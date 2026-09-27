#!/usr/bin/env python3
"""Refresh the attributed News & Culture link collection; --check validates offline.

Only the reviewed Global Voices source is supported. RSS descriptions are used
transiently for relevance and topics, never published. Individual article pages
must carry the expected license and no detected republication/rights exception.
Network failures retain the last good items and are reflected in source status.
"""
from __future__ import annotations

import argparse
import concurrent.futures
import hashlib
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import sys
import tempfile
from datetime import datetime, timezone, timedelta
from email.utils import parsedate_to_datetime
from urllib.parse import urlsplit, urlunsplit, unquote
from urllib.request import Request, build_opener, HTTPRedirectHandler
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
TOPICS = {'politics', 'culture', 'affairs', 'music', 'people', 'geography'}
SOURCE_ID = 'global-voices'
LICENSE_URL = 'https://creativecommons.org/licenses/by/3.0/'
POLICY_URL = 'https://globalvoices.org/about/global-voices-attribution-policy/'
MAX_RESPONSE_BYTES = 4 * 1024 * 1024
KURDISH = re.compile(r'\b(?:kurd(?:s|ish|istan)?|rojava|kurmanc[iî]|kurmanji|soran[iî]|zazak[iî]|dengb[eê]j)\b', re.I)
EXCEPTION = re.compile(r'\b(?:republish(?:ed|ing)?|reproduc(?:ed|tion)|(?:originally|first) (?:published|appeared)|content.sharing agreement|with permission|all rights reserved|copyright reserved|not (?:for|permitted to) (?:republi|reproduc)|syndicat(?:ed|ion))\b', re.I)
TOPIC_PATTERNS = {
    'politics': r'\b(?:politic\w*|state|government|election\w*|insurgency|autonom\w*|parliament|diplomacy)\b',
    'culture': r'\b(?:cultur\w*|language\w*|alphabet\w*|literature|poe[mt]\w*|book\w*|art|heritage|tradition\w*|festival\w*)\b',
    'music': r'\b(?:music\w*|song\w*|singer\w*|concert\w*|dengb[eê]j|musician\w*)\b',
    'people': r'\b(?:communit\w*|family|families|women|woman|men|student\w*|journalist\w*|artist\w*|activist\w*|wikimedian\w*|biograph\w*)\b',
    'geography': r'\b(?:geograph\w*|landscape\w*|mountain\w*|river\w*|environment\w*|climate|ecolog\w*|travel\w*)\b',
    'affairs': r'\b(?:rights|justice|citizenship|expression|information|displacement|education|internet|digital|recognition)\b',
}


class TextOnly(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []
        self.hidden = 0

    def handle_starttag(self, tag, attrs):
        if tag in {'script', 'style'}:
            self.hidden += 1
        elif tag in {'p', 'div', 'br', 'li'}:
            self.parts.append(' ')

    def handle_endtag(self, tag):
        if tag in {'script', 'style'} and self.hidden:
            self.hidden -= 1
        elif tag in {'p', 'div', 'li'}:
            self.parts.append(' ')

    def handle_data(self, data):
        if not self.hidden:
            self.parts.append(data)


def plain_text(value: str) -> str:
    parser = TextOnly()
    parser.feed(value)
    text = ''.join(parser.parts)
    # Remove controls and invisible direction overrides from external labels.
    text = ''.join(c for c in text if c in '\n\t\r' or (ord(c) >= 32 and c not in '\u007f\u202a\u202b\u202c\u202d\u202e\u2066\u2067\u2068\u2069'))
    return re.sub(r'\s+', ' ', text).strip()


def safe_url(value: str, hosts: set[str]) -> str:
    if not isinstance(value, str) or any(ord(c) < 33 for c in value) or '\\' in value:
        raise ValueError('Unsafe news URL')
    p = urlsplit(value)
    if p.scheme != 'https' or p.hostname not in hosts or p.username or p.password or p.port:
        raise ValueError('News URL must use HTTPS on an approved host')
    path = unquote(p.path)
    if any(ord(c) < 32 for c in path) or '\\' in path or any(part in {'.', '..'} for part in path.split('/')):
        raise ValueError('Unsafe news URL path')
    return urlunsplit(('https', p.hostname, p.path, '', ''))


def canonical_url(value: str) -> str:
    url = safe_url(value, {'globalvoices.org'})
    p = urlsplit(url)
    path = p.path.rstrip('/') + '/'
    if not re.fullmatch(r'/\d{4}/\d{2}/\d{2}/[a-z0-9][a-z0-9%-]*/', path):
        raise ValueError('Expected an original article URL')
    return urlunsplit(('https', 'globalvoices.org', path, '', ''))


def timestamp(value: str) -> datetime:
    if not isinstance(value, str):
        raise ValueError('Missing news date')
    try:
        result = datetime.fromisoformat(value.replace('Z', '+00:00'))
    except ValueError:
        result = parsedate_to_datetime(value)
    if result.tzinfo is None:
        raise ValueError('News dates require an explicit timezone')
    return result.astimezone(timezone.utc)


def iso(value: datetime) -> str:
    return value.astimezone(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00', 'Z')


def item_id(url: str) -> str:
    return SOURCE_ID + '-' + hashlib.sha256(url.encode()).hexdigest()[:16]


def relevant(title: str, description: str) -> bool:
    # A matching headline or its short lead is a meaningful focus signal;
    # isolated mentions in full article bodies never qualify a story.
    return bool(KURDISH.search(title) or KURDISH.search(description[:700]))


def topics_for(title: str, description: str) -> list[str]:
    text = title + ' ' + description[:700]
    found = [topic for topic, pattern in TOPIC_PATTERNS.items() if re.search(pattern, text, re.I)]
    return found or ['affairs']


def read_config(path: Path) -> dict:
    config = json.loads(path.read_text(encoding='utf-8'))
    sources = config.get('sources', [])
    if config.get('schemaVersion') != 1 or len(sources) != 1:
        raise ValueError('Expected one explicitly reviewed news source')
    s = sources[0]
    if (s.get('id') != SOURCE_ID or s.get('name') != 'Global Voices' or s.get('url') != 'https://globalvoices.org/'
            or s.get('license') != 'CC BY 3.0' or s.get('licenseUrl') != LICENSE_URL
            or s.get('policyUrl') != POLICY_URL or s.get('language') != 'en'
            or s.get('allowedHosts') != ['globalvoices.org']):
        raise ValueError('News source or license is not approved; review code and policy before adding a source')
    if type(config.get('maxItems')) is not int or not 1 <= config['maxItems'] <= 100:
        raise ValueError('maxItems must be between 1 and 100')
    feeds = s.get('feeds')
    if not isinstance(feeds, list) or not feeds or len(feeds) != len(set(feeds)):
        raise ValueError('News source needs unique feed URLs')
    for feed in feeds:
        if safe_url(feed, {'globalvoices.org'}) != feed or not re.fullmatch(r'https://globalvoices\.org/(?:-/[a-z0-9/-]+/)?feed/', feed):
            raise ValueError('Unapproved news feed URL')
    return config


class SafeRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        safe_url(newurl, {'globalvoices.org'})
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def fetch(url: str) -> bytes:
    safe_url(url, {'globalvoices.org'})
    request = Request(url, headers={'User-Agent': 'KurdishDigitalLibrary-News/1.0 (+https://helony.github.io/digital-library/)', 'Accept': 'application/rss+xml, application/xml, text/html;q=0.9'})
    with build_opener(SafeRedirect()).open(request, timeout=30) as response:
        safe_url(response.url, {'globalvoices.org'})
        data = response.read(MAX_RESPONSE_BYTES + 1)
        if len(data) > MAX_RESPONSE_BYTES:
            raise ValueError('News response exceeds size limit')
        return data


def parse_feed(data: bytes, now: datetime) -> list[dict]:
    if b'<!DOCTYPE' in data.upper() or b'<!ENTITY' in data.upper():
        raise ValueError('RSS document declarations are not accepted')
    root = ET.fromstring(data)
    channel = root.find('./channel')
    if root.tag != 'rss' or channel is None:
        raise ValueError('Expected an RSS channel')
    items = []
    for entry in channel.findall('./item'):
        title = plain_text(entry.findtext('title', ''))
        description = plain_text(entry.findtext('description', ''))
        author = plain_text(entry.findtext('{http://purl.org/dc/elements/1.1/}creator', ''))
        if not title or len(title) > 350 or not author or len(author) > 200 or not relevant(title, description):
            continue
        try:
            url = canonical_url(entry.findtext('link', '').strip())
            published = timestamp(entry.findtext('pubDate', ''))
            if published > now + timedelta(minutes=5) or published.year < 2005:
                continue
        except (ValueError, TypeError, OverflowError):
            continue
        items.append({'id': item_id(url), 'url': url, 'title': title, 'publishedAt': iso(published),
                      'author': author, 'sourceId': SOURCE_ID, 'language': 'en', 'topics': topics_for(title, description)})
    return items


class ArticleRights(HTMLParser):
    """Inspect the main article and its credit block, excluding related stories."""
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.body = []
        self.licenses = []
        self.canonical = None
        self.found_body = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        classes = set(attrs.get('class', '').split())
        active_body = any(state[1] for state in self.stack) or 'post' in classes
        active_credits = any(state[2] for state in self.stack) or 'postfooter-credits' in classes
        if 'post' in classes:
            self.found_body = True
        if tag == 'link' and 'canonical' in attrs.get('rel', '').split():
            self.canonical = attrs.get('href')
        if active_credits and tag == 'a' and 'license' in attrs.get('rel', '').split():
            self.licenses.append(attrs.get('href', ''))
        if tag not in {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}:
            self.stack.append((tag, active_body, active_credits))

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, -1, -1):
            if self.stack[index][0] == tag:
                del self.stack[index:]
                break

    def handle_data(self, data):
        if any(state[1] for state in self.stack) and not any(state[0] in {'script', 'style'} for state in self.stack):
            self.body.append(data)


def rights_allowed(data: bytes, url: str) -> bool:
    page = ArticleRights()
    page.feed(data.decode('utf-8'))
    try:
        matching_url = canonical_url(page.canonical or '') == url
    except ValueError:
        matching_url = False
    # A successful HTTP response can still be a maintenance/challenge page, or
    # a redirect to another article. That is an unavailable check, not evidence
    # that a previously accepted article's rights have changed.
    if not matching_url or not page.found_body or not ''.join(page.body).strip():
        raise ValueError('Unrecognizable article page; reuse check unavailable')
    return bool(page.licenses == [LICENSE_URL] and not EXCEPTION.search(' '.join(page.body)))


def source_record(config: dict) -> dict:
    return {key: config[key] for key in ('id', 'name', 'url', 'license', 'licenseUrl', 'policyUrl')}


def validate(data: dict, config: dict) -> int:
    if set(data) != {'schemaVersion', 'checkedAt', 'lastSuccessfulCheck', 'sources', 'items'} or data.get('schemaVersion') != 1:
        raise ValueError('Invalid news data schema')
    checked = timestamp(data['checkedAt'])
    success = timestamp(data['lastSuccessfulCheck']) if data['lastSuccessfulCheck'] else None
    if iso(checked) != data['checkedAt'] or (success and iso(success) != data['lastSuccessfulCheck']):
        raise ValueError('News check timestamps must be canonical UTC')
    if success and success > checked:
        raise ValueError('Successful check cannot follow last attempted check')
    records = data['sources']
    if not isinstance(records, list) or len(records) != 1:
        raise ValueError('Invalid news sources')
    source = records[0]
    if set(source) != {'id', 'name', 'url', 'license', 'licenseUrl', 'policyUrl', 'status', 'lastSuccessfulCheck'}:
        raise ValueError('Invalid public news source fields')
    expected = source_record(config['sources'][0])
    if any(source.get(key) != value for key, value in expected.items()) or source.get('status') not in {'ok', 'partial', 'error'}:
        raise ValueError('Invalid news source or license metadata')
    if source['lastSuccessfulCheck'] != data['lastSuccessfulCheck']:
        raise ValueError('Source and overall successful check must agree')
    if source['status'] == 'ok' and data['lastSuccessfulCheck'] != data['checkedAt']:
        raise ValueError('Successful source must have current timestamp')
    if not isinstance(data['items'], list) or len(data['items']) > config['maxItems']:
        raise ValueError('Invalid news archive length')
    seen = set()
    dates = []
    for item in data['items']:
        if set(item) != {'id', 'url', 'title', 'publishedAt', 'author', 'sourceId', 'language', 'topics'}:
            raise ValueError('Unexpected news item fields; article content must not be stored')
        url = canonical_url(item['url'])
        if url != item['url'] or url in seen or item['id'] != item_id(url):
            raise ValueError('Duplicate or noncanonical news item')
        seen.add(url)
        if item['sourceId'] != SOURCE_ID or item['language'] != 'en':
            raise ValueError('Unapproved news item source or language')
        for key, limit in [('title', 350), ('author', 200)]:
            text = item[key]
            if not isinstance(text, str) or not text or len(text) > limit or plain_text(text) != text or '<' in text or '>' in text:
                raise ValueError('News labels must be short plain text')
        published = timestamp(item['publishedAt'])
        if iso(published) != item['publishedAt'] or published > checked + timedelta(minutes=5) or published.year < 2005:
            raise ValueError('Invalid news publication date')
        dates.append(published)
        topics = item['topics']
        if not isinstance(topics, list) or not topics or any(topic not in TOPICS for topic in topics) or len(topics) != len(set(topics)):
            raise ValueError('Invalid news topics')
    if dates != sorted(dates, reverse=True):
        raise ValueError('News items must be newest first')
    return len(seen)


def refresh(config: dict, previous: dict | None, now: datetime, fetcher=fetch) -> tuple[dict, list[str]]:
    if previous is not None:
        validate(previous, config)
    source = config['sources'][0]
    errors = []
    candidates = {}
    successful_feeds = 0
    # At most four requests in parallel, with a per-request timeout and size cap.
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        requests = {url: pool.submit(fetcher, url) for url in source['feeds']}
        for url, future in requests.items():
            try:
                parsed = parse_feed(future.result(), now)
                successful_feeds += 1
                for item in parsed:
                    candidates[item['url']] = item
            except Exception as error:
                errors.append(f'Feed unavailable: {url}: {type(error).__name__}')
    archive = {item['url']: item for item in (previous or {}).get('items', [])}
    if successful_feeds:
        # Recheck archived pages too, so newly detected rights exceptions remove
        # a listing. Temporary page failures keep only already accepted records.
        to_review = {**archive, **candidates}
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
            requests = {url: pool.submit(fetcher, url) for url in to_review}
            for url, future in requests.items():
                try:
                    allowed = rights_allowed(future.result(), url)
                except Exception as error:
                    errors.append(f'Article check unavailable: {url}: {type(error).__name__}')
                    continue
                if allowed:
                    archive[url] = to_review[url]
                else:
                    archive.pop(url, None)
                    print(f'Excluded article with unverified reuse rights: {url}', file=sys.stderr)
    status = 'error' if not successful_feeds else ('partial' if errors else 'ok')
    last_success = iso(now) if status == 'ok' else (previous or {}).get('lastSuccessfulCheck')
    public_source = {**source_record(source), 'status': status, 'lastSuccessfulCheck': last_success}
    data = {'schemaVersion': 1, 'checkedAt': iso(now), 'lastSuccessfulCheck': last_success,
            'sources': [public_source], 'items': sorted(archive.values(), key=lambda item: (item['publishedAt'], item['id']), reverse=True)[:config['maxItems']]}
    validate(data, config)
    return data, errors


def atomic_write(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile('w', encoding='utf-8', dir=path.parent, delete=False) as handle:
            temporary = Path(handle.name)
            json.dump(data, handle, ensure_ascii=False, indent=2)
            handle.write('\n')
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary, path)
    finally:
        if temporary and temporary.exists():
            temporary.unlink()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='validate committed source configuration and data without network access or writes')
    parser.add_argument('--root', type=Path, default=ROOT)
    args = parser.parse_args()
    try:
        config = read_config(args.root / 'data/news-sources.json')
        target = args.root / 'data/news.json'
        previous = json.loads(target.read_text(encoding='utf-8')) if target.exists() else None
        if args.check:
            if previous is None:
                raise ValueError('data/news.json is missing; run the refresh first')
            count = validate(previous, config)
            print(f'News: {count} attributed links validated (offline).')
        else:
            data, errors = refresh(config, previous, datetime.now(timezone.utc))
            atomic_write(target, data)
            for error in errors:
                print(error, file=sys.stderr)
            print(f"News: {len(data['items'])} links; source status {data['sources'][0]['status']}.")
    except (OSError, ValueError, KeyError, TypeError) as error:
        print(f'News refresh: {error}', file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
