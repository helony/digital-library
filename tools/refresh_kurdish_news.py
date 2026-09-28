#!/usr/bin/env python3
"""Collect attributed links to original VOA reporting in Kurmancî and Soranî.

Publish only original titles, bylines, dates and URLs. Reject wire-service
credits, syndicated text, videos, missing authors and unrecognizable pages.
No article bodies, feed excerpts, images or media are saved in the collection.
"""
from __future__ import annotations
import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone, timedelta
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
from urllib.parse import urlsplit, urlunsplit
from urllib.request import Request, build_opener, HTTPRedirectHandler
import xml.etree.ElementTree as ET

from refresh_news import atomic_write, iso, plain_text, safe_url, timestamp, TOPICS

ROOT = Path(__file__).resolve().parents[1]
POLICY = 'https://www.voanews.com/p/5338.html'
APPROVED = {
    'voa-kmr': {'name': 'Dengê Amerîka · VOA', 'host': 'www.dengeamerika.com', 'language': 'kmr',
                'pageLanguage': 'kr-Latn', 'feeds': ['/api/', '/api/ztpttl-vomx-tpekjkq', '/api/ziuv_l-vomx-tpemikm']},
    'voa-ckb': {'name': 'دەنگی ئەمەریکا · VOA', 'host': 'www.dengiamerika.com', 'language': 'ckb',
                'pageLanguage': 'ku-CKB', 'feeds': ['/api/', '/api/z_itvl-vomx-tpevgkr']},
}
HOSTS = {s['host'] for s in APPROVED.values()} | {'www.voanews.com'}
KURDISH = re.compile(r'\b(?:kurd\w*|kurmanc\w*|soran\w*|zazak\w*|rojava|dengb[eê]j\w*|p[eê]şmerge\w*|qamişlo|koban[iîê]|efr[iî]n\w*|amed\w*|hewl[eê]r\w*|sil[eê]man[iî]\w*)\b|کورد|كورد|کەرد|پێشمەرگ|ڕۆژاوا|هەولێر|سلێمانی|کەرکووک', re.I)
THIRD_PARTY = re.compile(r'\b(?:Reuters|Associated Press|Agence France.Presse|AFP|AP)\b|ڕۆیتەر|ڕۆیتر|رۆیتر|رویتر|رۆیتەر|ئەسۆش[یێ]ت|ئەسۆشیەیت|ئاسۆشیەیت|ئاسۆشێت|ئاسۆشیت|ئەژانس.*فەرەن|ئاژانس.*فەرەن|ئافپ|ئەی\s*پی|ئه‌ی\s*پی', re.I)
EXCEPTION = re.compile(r'\b(?:republish\w*|syndicat\w*|all rights reserved|originally published|with permission)\b', re.I)
PATTERNS = {
    'politics': r'siyas|serok|hik[ûu]met|hilbijartin|parleman|p[eê]şmerge|siyaset|سیاس|سەرۆک|حکومەت|هەڵبژاردن|پەرلەمان|پێشمەرگ',
    'culture': r'çand|huner|ziman|pirt[ûu]k|edeb[iî]|helbest|m[iî]rat|کولتوور|فەرهەنگ|هونەر|زمان|کتێب|ئەدەب|هۆنراو|شیعر',
    'music': r'muz[iî]k|stran|dengb[eê]j|konser|awaz|مۆسیقا|گۆرانی|ئاواز|هونەرمەند',
    'people': r'jin\b|jiyan|zarok|ciwan|mamoste|xwendekar|rojnamevan|ژنان|ژن\b|منداڵ|گەنج|مامۆستا|خوێندکار|ڕۆژنامەنووس',
    'geography': r'geşt|çiya|j[iî]ngeh|avhewa|geştyar|ژینگە|گەشت|شاخ|کەشوهەوا',
    'affairs': r'maf|penaber|koçber|perwerde|internet|ئاواره|ئاوارە|پەنابەر|ماف|پەروەردە|ئینتەرنێت',
}


def canonical_url(value, source):
    parsed = urlsplit(safe_url(value, {source['host']}))
    # Escaped slugs are case-insensitive; article IDs remain the stable key.
    path = re.sub(r'%[0-9a-fA-F]{2}', lambda m: m.group().upper(), parsed.path)
    if not re.fullmatch(r'/a/(?:[^/]+/)?\d+\.html', path):
        raise ValueError('Expected a VOA article URL')
    return urlunsplit(('https', source['host'], path, '', ''))


def identity(url, source_id):
    return source_id + '-' + re.search(r'/(\d+)\.html$', url).group(1)


def read_config(path):
    data = json.loads(path.read_text(encoding='utf-8'))
    if data.get('schemaVersion') != 1 or data.get('maxItemsPerSource') != 40:
        raise ValueError('Invalid Kurdish news source configuration')
    if [s.get('id') for s in data.get('sources', [])] != list(APPROVED):
        raise ValueError('Only explicitly reviewed Kurdish news sources are allowed')
    for source in data['sources']:
        approved = APPROVED[source['id']]
        expected = {**approved, 'url': 'https://' + approved['host'] + '/', 'policyUrl': POLICY,
                    'license': 'VOA-produced material', 'licenseUrl': POLICY,
                    'feeds': ['https://' + approved['host'] + p for p in approved['feeds']]}
        if any(source.get(key) != value for key, value in expected.items()):
            raise ValueError('Source configuration differs from reviewed VOA policy or feeds')
    return data


class Redirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        safe_url(newurl, HOSTS)
        if urlsplit(req.full_url).hostname != urlsplit(newurl).hostname:
            raise ValueError('Cross-source redirect rejected')
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def fetch(url):
    safe_url(url, HOSTS)
    req = Request(url, headers={'User-Agent': 'KurdishDigitalLibrary-News/1.0 (+https://helony.github.io/digital-library/)',
                               'Accept': 'application/rss+xml,application/xml,text/html;q=0.9'})
    with build_opener(Redirect()).open(req, timeout=25) as response:
        content = response.read(4 * 1024 * 1024 + 1)
        if len(content) > 4 * 1024 * 1024:
            raise ValueError('Response too large')
        return content


def relevant(title, lead):
    return bool(KURDISH.search(title + ' ' + lead[:700]))


def parse_feed(content, source, now):
    if b'<!DOCTYPE' in content.upper() or b'<!ENTITY' in content.upper():
        raise ValueError('RSS declarations rejected')
    root = ET.fromstring(content)
    if root.tag != 'rss' or root.find('channel') is None:
        raise ValueError('Expected RSS channel')
    items = []
    for entry in root.findall('./channel/item')[:100]:
        title, lead = (plain_text(entry.findtext(key, '')) for key in ('title', 'description'))
        if not title or len(title) > 350 or not relevant(title, lead):
            continue
        try:
            url = canonical_url(entry.findtext('link', '').strip(), source)
            date = timestamp(entry.findtext('pubDate', ''))
            if not now - timedelta(days=90) <= date <= now + timedelta(minutes=5):
                continue
        except (ValueError, TypeError, OverflowError):
            continue
        text = title + ' ' + lead[:700]
        topics = [topic for topic, pattern in PATTERNS.items() if re.search(pattern, text, re.I)] or ['affairs']
        items.append({'id': identity(url, source['id']), 'url': url, 'title': title,
                      'publishedAt': iso(date), 'sourceId': source['id'], 'language': source['language'], 'topics': topics})
    return items


class Article(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.ld = []
        self.json_text = []
        self.body = []
        self.canonical = None
        self.found_body = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        classes = set(attrs.get('class', '').split())
        body = any(s[1] for s in self.stack) or 'body-container' in classes
        excluded = any(s[2] for s in self.stack) or tag in {'figure', 'figcaption', 'aside', 'script', 'style'} or any('caption' in c for c in classes)
        ld = tag == 'script' and attrs.get('type') == 'application/ld+json'
        if 'body-container' in classes:
            self.found_body = True
        if tag == 'link' and 'canonical' in attrs.get('rel', '').split():
            self.canonical = attrs.get('href')
        if tag not in {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}:
            self.stack.append((tag, body, excluded, ld))
        if ld:
            self.json_text = []

    def handle_endtag(self, tag):
        if tag == 'script' and self.stack and self.stack[-1][3]:
            try:
                value = json.loads(''.join(self.json_text))
                self.ld.extend(value if isinstance(value, list) else [value])
            except (ValueError, TypeError):
                pass
        for index in range(len(self.stack) - 1, -1, -1):
            if self.stack[index][0] == tag:
                del self.stack[index:]
                break

    def handle_data(self, text):
        if self.stack and self.stack[-1][3]:
            self.json_text.append(text)
        if self.stack and self.stack[-1][1] and not self.stack[-1][2]:
            self.body.append(text)


def reviewed_item(content, candidate, source):
    page = Article()
    page.feed(content.decode('utf-8'))
    metadata = next((r for r in page.ld if isinstance(r, dict) and r.get('@type') == 'NewsArticle'), None)
    # Recognized non-text media is deliberately not advertised as a readable article.
    if metadata is None and any(r.get('@type') in {'VideoObject', 'AudioObject', 'ImageGallery'} for r in page.ld if isinstance(r, dict)):
        return None
    if not metadata or not page.found_body or not ''.join(page.body).strip():
        raise ValueError('Unrecognizable article; keep only previously verified links')
    url = canonical_url(page.canonical or metadata.get('url', ''), source)
    if identity(url, source['id']) != candidate['id'] or metadata.get('inLanguage') != source['pageLanguage']:
        raise ValueError('Article identity or language mismatch')
    if metadata.get('publisher', {}).get('url', '').rstrip('/') != source['url'].rstrip('/'):
        return None
    authors = metadata.get('author', [])
    if isinstance(authors, dict):
        authors = [authors]
    if not authors or any(not isinstance(a, dict) or not a.get('name') for a in authors):
        return None
    for author in authors:
        try:
            author_url = safe_url(author.get('url', ''), {source['host']})
            if not urlsplit(author_url).path.startswith('/author/'):
                return None
        except ValueError:
            return None
    byline = plain_text(' · '.join(a['name'] for a in authors))
    if len(byline) > 200 or THIRD_PARTY.search(byline + ' ' + ' '.join(page.body)) or EXCEPTION.search(' '.join(page.body)):
        return None
    title = plain_text(metadata.get('headline', ''))
    # Use the publisher's current title and original publication date, not feed polling time.
    published = iso(timestamp(metadata.get('datePublished', '')))
    if not title or len(title) > 350 or not relevant(title, plain_text(metadata.get('description', ''))):
        return None
    return {**candidate, 'url': url, 'title': title, 'author': byline, 'publishedAt': published}


def public_source(source):
    return {key: source[key] for key in ('id', 'name', 'url', 'language', 'license', 'licenseUrl', 'policyUrl')}


def validate(data, config):
    if set(data) != {'schemaVersion', 'checkedAt', 'lastSuccessfulCheck', 'sources', 'items'} or data['schemaVersion'] != 1:
        raise ValueError('Invalid Kurdish news collection')
    checked = timestamp(data['checkedAt'])
    if data['checkedAt'] != iso(checked):
        raise ValueError('Check date must be canonical UTC')
    if data['lastSuccessfulCheck'] and timestamp(data['lastSuccessfulCheck']) > checked:
        raise ValueError('Future successful check')
    expected = {s['id']: s for s in config['sources']}
    if not isinstance(data['sources'], list) or {s.get('id') for s in data['sources']} != set(expected) or len(data['sources']) != len(expected):
        raise ValueError('Missing or duplicate Kurdish sources')
    for source in data['sources']:
        fields = public_source(expected[source['id']])
        if set(source) != set(fields) | {'status', 'lastSuccessfulCheck'} or any(source.get(k) != v for k, v in fields.items()) or source.get('status') not in {'ok', 'partial', 'error'}:
            raise ValueError('Unreviewed source metadata')
        if source['lastSuccessfulCheck'] and timestamp(source['lastSuccessfulCheck']) > checked:
            raise ValueError('Future source check')
        if source['status'] == 'ok' and source['lastSuccessfulCheck'] != data['checkedAt']:
            raise ValueError('Successful source must have current check date')
    seen, dates = set(), []
    for item in data['items']:
        if set(item) != {'id', 'url', 'title', 'publishedAt', 'author', 'sourceId', 'language', 'topics'} or item['sourceId'] not in expected:
            raise ValueError('Unexpected item fields or source')
        source = expected[item['sourceId']]
        if canonical_url(item['url'], source) != item['url'] or item['id'] != identity(item['url'], source['id']) or item['id'] in seen or item['language'] != source['language']:
            raise ValueError('Invalid item identity or language')
        seen.add(item['id'])
        for key, limit in [('title', 350), ('author', 200)]:
            value = item[key]
            if not isinstance(value, str) or not value or len(value) > limit or plain_text(value) != value or '<' in value or '>' in value:
                raise ValueError('Invalid plain text label')
        date = timestamp(item['publishedAt'])
        if iso(date) != item['publishedAt'] or date > checked + timedelta(minutes=5):
            raise ValueError('Invalid publication date')
        dates.append(date)
        if not item['topics'] or any(t not in TOPICS for t in item['topics']) or len(set(item['topics'])) != len(item['topics']):
            raise ValueError('Invalid topics')
    if dates != sorted(dates, reverse=True) or len(seen) > config['maxItemsPerSource'] * len(expected):
        raise ValueError('Collection order or size invalid')
    return len(seen)


def refresh(config, previous, now, fetcher=fetch):
    if previous:
        validate(previous, config)
    old_sources = {s['id']: s for s in (previous or {}).get('sources', [])}
    errors, output, sources = [], [], []
    try:
        policy = plain_text(fetcher(POLICY).decode()).lower()
        if 'all text, audio and video material produced exclusively by the voice of america is in the public domain' not in policy:
            raise ValueError('VOA permission statement changed; review required')
        policy_ok = True
    except Exception as error:
        errors.append(f'VOA reuse policy unavailable: {type(error).__name__}')
        policy_ok = False
    for source in config['sources']:
        archive = {item['id']: item for item in (previous or {}).get('items', []) if item['sourceId'] == source['id'] and timestamp(item['publishedAt']) >= now - timedelta(days=90)}
        failures, successful_feeds, candidates = [], 0, {}
        if policy_ok:
            with ThreadPoolExecutor(max_workers=3) as pool:
                requests = {url: pool.submit(fetcher, url) for url in source['feeds']}
                for url, future in requests.items():
                    try:
                        for item in parse_feed(future.result(), source, now):
                            candidates[item['id']] = item
                        successful_feeds += 1
                    except Exception as error:
                        failures.append(f'{source["id"]} feed unavailable: {url}: {type(error).__name__}')
        if successful_feeds:
            review = sorted({**archive, **candidates}.values(), key=lambda i: i['publishedAt'], reverse=True)[:config['maxItemsPerSource']]
            with ThreadPoolExecutor(max_workers=4) as pool:
                requests = [(item, pool.submit(fetcher, item['url'])) for item in review]
                for item, future in requests:
                    try:
                        accepted = reviewed_item(future.result(), item, source)
                        if accepted and now - timedelta(days=90) <= timestamp(accepted['publishedAt']) <= now + timedelta(minutes=5):
                            archive[item['id']] = accepted
                        else:
                            archive.pop(item['id'], None)
                    except Exception as error:
                        failures.append(f'{source["id"]} article unavailable: {item["url"]}: {type(error).__name__}')
        status = 'error' if not successful_feeds else 'partial' if failures else 'ok'
        last_success = iso(now) if status == 'ok' else old_sources.get(source['id'], {}).get('lastSuccessfulCheck')
        sources.append({**public_source(source), 'status': status, 'lastSuccessfulCheck': last_success})
        output.extend(sorted(archive.values(), key=lambda i: i['publishedAt'], reverse=True)[:config['maxItemsPerSource']])
        errors.extend(failures)
    data = {'schemaVersion': 1, 'checkedAt': iso(now), 'lastSuccessfulCheck': iso(now) if all(s['status'] == 'ok' for s in sources) else (previous or {}).get('lastSuccessfulCheck'),
            'sources': sources, 'items': sorted(output, key=lambda i: (i['publishedAt'], i['id']), reverse=True)}
    validate(data, config)
    return data, errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    try:
        config = read_config(ROOT / 'data/kurdish-news-sources.json')
        path = ROOT / 'data/kurdish-news.json'
        previous = json.loads(path.read_text(encoding='utf-8')) if path.exists() else None
        if args.check:
            print(f'Kurdish news: {validate(previous, config)} attributed links validated.')
        else:
            data, errors = refresh(config, previous, datetime.now(timezone.utc))
            atomic_write(path, data)
            for error in errors:
                print(error, file=sys.stderr)
            print(f'Kurdish news: {len(data["items"])} links; ' + ', '.join(s['id'] + ': ' + s['status'] for s in data['sources']))
    except (ValueError, OSError, KeyError, TypeError) as error:
        print(error, file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
