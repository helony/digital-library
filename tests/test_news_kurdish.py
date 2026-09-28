"""Permission gates and failure recovery for native Kurdish news links."""
import copy
from datetime import datetime, timezone, timedelta
import json
from pathlib import Path
import sys
import unittest
from xml.sax.saxutils import escape

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'tools'))
from refresh_kurdish_news import POLICY, read_config, parse_feed, reviewed_item, refresh, validate, canonical_url

ROOT = Path(__file__).resolve().parents[1]
NOW = datetime(2026, 9, 28, 13, tzinfo=timezone.utc)
POLICY_TEXT = b'All text, audio and video material produced exclusively by the Voice of America is in the public domain.'


def article_url(source):
    return source['url'] + 'a/8200001.html'


def rss(source, title=None, date='Mon, 28 Sep 2026 10:00:00 +0000'):
    title = title or ('Nûçeyên çanda kurdî' if source['language'] == 'kmr' else 'هەواڵی کوردستان')
    return f'<rss><channel><item><title>{escape(title)}</title><description>Original reporting</description><link>{article_url(source)}</link><pubDate>{date}</pubDate></item></channel></rss>'.encode()


def page(source, body='Original Kurdish reporting.', caption='', changes=None):
    metadata = {'@type': 'NewsArticle', 'url': article_url(source), 'headline': 'Nûçeyên çanda kurdî' if source['language'] == 'kmr' else 'هەواڵی کوردستان',
                'description': 'Kurdish culture', 'inLanguage': source['pageLanguage'], 'datePublished': '2026-09-28 09:00:00Z',
                'publisher': {'url': source['url']}, 'author': {'name': source['name'], 'url': source['url'] + 'author/reporter/123'}}
    metadata.update(changes or {})
    return (f'<html><head><link rel="canonical" href="{article_url(source)}"><script type="application/ld+json">{json.dumps(metadata)}</script></head>'
            f'<body><div class="body-container"><figure><figcaption>{caption}</figcaption></figure><p>{body}</p></div></body></html>').encode()


class KurdishNewsTests(unittest.TestCase):
    def setUp(self):
        self.config = read_config(ROOT / 'data/kurdish-news-sources.json')
        self.source = self.config['sources'][0]

    def good_fetch(self, url):
        if url == POLICY:
            return POLICY_TEXT
        for source in self.config['sources']:
            if url in source['feeds']:
                return rss(source)
            if url == article_url(source):
                return page(source)
        raise AssertionError(url)

    def data(self):
        return refresh(self.config, None, NOW, self.good_fetch)[0]

    def test_native_titles_byline_and_original_dates_without_body_or_media(self):
        data = self.data()
        self.assertEqual(validate(data, self.config), 2)
        self.assertEqual({i['language'] for i in data['items']}, {'kmr', 'ckb'})
        for item in data['items']:
            self.assertEqual(item['publishedAt'], '2026-09-28T09:00:00Z')
            self.assertEqual(set(item), {'id', 'url', 'title', 'author', 'sourceId', 'language', 'topics', 'publishedAt'})
        self.assertTrue(all(s['status'] == 'ok' for s in data['sources']))

    def test_no_wire_copy_or_missing_or_external_authors(self):
        candidate = parse_feed(rss(self.source), self.source, NOW)[0]
        for body in ['Reuters reports this.', 'AFP', 'Associated Press', 'ڕۆیتەر', 'With permission, originally published elsewhere.']:
            with self.subTest(body=body):
                self.assertIsNone(reviewed_item(page(self.source, body=body), candidate, self.source))
        for author in [None, {}, {'name': 'Reuters', 'url': self.source['url'] + 'author/reuters/1'}, {'name': 'Someone', 'url': 'https://other.example/author/1'}]:
            self.assertIsNone(reviewed_item(page(self.source, changes={'author': author}), candidate, self.source))
        # An excluded photo credit is not a license for the photo, nor a text byline.
        self.assertIsNotNone(reviewed_item(page(self.source, caption='Photo: Reuters'), candidate, self.source))

    def test_only_readable_matching_language_articles_are_accepted(self):
        candidate = parse_feed(rss(self.source), self.source, NOW)[0]
        self.assertIsNone(reviewed_item(page(self.source, changes={'@type': 'VideoObject'}), candidate, self.source))
        with self.assertRaises(ValueError):
            reviewed_item(page(self.source, changes={'inLanguage': 'en'}), candidate, self.source)
        with self.assertRaises(ValueError):
            reviewed_item(b'<html>Temporary maintenance</html>', candidate, self.source)
        self.assertIsNone(reviewed_item(page(self.source, changes={'publisher': {'url': 'https://other.example/'}}), candidate, self.source))

    def test_feed_relevance_dates_and_urls_are_restricted(self):
        self.assertEqual(parse_feed(rss(self.source, title='An unrelated story'), self.source, NOW), [])
        for date in ['invalid', 'Mon, 28 Sep 2026 20:00:00 +0000', 'Mon, 01 Jun 2026 10:00:00 +0000']:
            self.assertEqual(parse_feed(rss(self.source, date=date), self.source, NOW), [])
        for url in ['javascript:alert(1)', 'http://www.dengeamerika.com/a/8200001.html', 'https://www.dengeamerika.com.evil.test/a/8200001.html', 'https://user@www.dengeamerika.com/a/8200001.html', 'https://www.dengeamerika.com/a/%2e%2e/8200001.html']:
            with self.assertRaises(ValueError):
                canonical_url(url, self.source)
        with self.assertRaises(ValueError):
            parse_feed(b'<!DOCTYPE rss><rss><channel/></rss>', self.source, NOW)

    def test_policy_failure_retains_archive_and_does_not_claim_success(self):
        previous = self.data()
        def changed(url):
            return b'All rights reserved' if url == POLICY else self.good_fetch(url)
        current, errors = refresh(self.config, previous, NOW + timedelta(hours=1), changed)
        self.assertEqual(current['items'], previous['items'])
        self.assertEqual(current['lastSuccessfulCheck'], previous['lastSuccessfulCheck'])
        self.assertTrue(all(s['status'] == 'error' for s in current['sources']))
        self.assertTrue(errors)

    def test_feed_failure_isolated_and_old_links_remain_readable(self):
        previous = self.data()
        def failed(url):
            if url in self.source['feeds']:
                raise OSError('Unavailable')
            return self.good_fetch(url)
        current, errors = refresh(self.config, previous, NOW + timedelta(hours=1), failed)
        self.assertEqual(current['items'], previous['items'])
        self.assertEqual([s['status'] for s in current['sources']], ['error', 'ok'])
        self.assertTrue(errors)

    def test_new_rights_exception_removes_old_listing_but_page_outage_preserves_it(self):
        previous = self.data()
        def exception(url):
            return page(self.source, body='Reuters') if url == article_url(self.source) else self.good_fetch(url)
        current, _ = refresh(self.config, previous, NOW + timedelta(hours=1), exception)
        self.assertEqual([i['language'] for i in current['items']], ['ckb'])
        def outage(url):
            return b'<html>Maintenance</html>' if url == article_url(self.source) else self.good_fetch(url)
        current, errors = refresh(self.config, previous, NOW + timedelta(hours=1), outage)
        self.assertEqual(current['items'], previous['items'])
        self.assertEqual(current['sources'][0]['status'], 'partial')
        self.assertTrue(errors)

    def test_offline_validation_rejects_extra_content_and_language_mismatch(self):
        for field, value in [('description', 'Copied story'), ('language', 'en'), ('author', '<b>Writer</b>')]:
            data = copy.deepcopy(self.data())
            data['items'][0][field] = value
            with self.assertRaises(ValueError):
                validate(data, self.config)


if __name__ == '__main__':
    unittest.main()
