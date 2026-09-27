"""Offline coverage of news permission gates, dates, URLs and feed failures."""
import copy
from datetime import datetime, timezone
import json
from pathlib import Path
import sys
import tempfile
import unittest
from xml.sax.saxutils import escape

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'tools'))
from refresh_news import (LICENSE_URL, atomic_write, canonical_url, iso, parse_feed,
                          plain_text, read_config, refresh, relevant, rights_allowed, validate)

ROOT = Path(__file__).resolve().parents[1]
NOW = datetime(2026, 9, 27, 8, 0, tzinfo=timezone.utc)
URL = 'https://globalvoices.org/2025/08/27/a-kurdish-language-story/'


def rss(title='A Kurdish language story', url=URL, description='Language and digital culture.',
        date='Wed, 27 Aug 2025 02:00:10 +0000', author='Example Author', body='', extra=''):
    return (f'<rss xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/">'
            f'<channel><item><title>{escape(title)}</title><link>{escape(url)}</link>'
            f'<description>{escape(description)}</description><pubDate>{escape(date)}</pubDate>'
            f'<dc:creator>{escape(author)}</dc:creator><content:encoded>{escape(body)}</content:encoded>'
            f'</item>{extra}</channel></rss>').encode()


def page(url=URL, body='Original reporting about Kurdish language.', license_url=LICENSE_URL,
         related='', article_license=True):
    badge = f'<a rel="license" href="{license_url}">License</a>' if article_license else ''
    return (f'<html><head><link rel="canonical" href="{url}"></head><body>'
            f'<div class="post-container"><div class="post type-post"><p>{body}</p></div></div>'
            f'<div class="postfooter"><div class="postfooter-credits">{badge}</div></div>'
            f'<aside>{related}</aside><footer><a rel="license" href="{LICENSE_URL}">Site license</a></footer>'
            f'</body></html>').encode()


class NewsTests(unittest.TestCase):
    def setUp(self):
        self.config = read_config(ROOT / 'data/news-sources.json')
        self.feeds = self.config['sources'][0]['feeds']

    def good_fetch(self, url):
        return rss() if url in self.feeds else page(url)

    def data(self):
        return refresh(self.config, None, NOW, self.good_fetch)[0]

    def test_relevance_uses_headline_and_lead_but_never_the_full_body(self):
        self.assertTrue(relevant('A song in Zazakî', ''))
        self.assertTrue(relevant('An educational journey', 'A Kurdish student recounts her experience.'))
        self.assertFalse(relevant('Travel elsewhere', 'A village story.'))
        self.assertEqual(parse_feed(rss(title='An unrelated article', description='A world story', body='A Kurdish person is mentioned once.'), NOW), [])

    def test_plain_labels_strip_html_scripts_controls_and_direction_overrides(self):
        self.assertEqual(plain_text('<p>Şakiro &amp; <b>music</b></p><script>bad()</script>\u202e\x01'), 'Şakiro & music')
        items = parse_feed(rss(title='<b>A Kurdish story</b>', author='<i>Author</i>'), NOW)
        self.assertEqual(items[0]['title'], 'A Kurdish story')
        self.assertEqual(items[0]['author'], 'Author')
        self.assertNotIn('description', items[0])

    def test_url_canonicalization_drops_tracking_and_blocks_unapproved_hosts(self):
        self.assertEqual(canonical_url(URL.rstrip('/') + '?utm_source=rss#story'), URL)
        for url in ['http://globalvoices.org/2025/08/27/a-story/',
                    'https://globalvoices.org.evil.example/2025/08/27/a-story/',
                    'https://user:pass@globalvoices.org/2025/08/27/a-story/',
                    'https://globalvoices.org:443/2025/08/27/a-story/',
                    'javascript:alert(1)',
                    'https://globalvoices.org/2025/08/27/%2e%2e/',
                    'https://globalvoices.org/2025/08/27/a%0astory/']:
            with self.subTest(url=url), self.assertRaises(ValueError):
                canonical_url(url)

    def test_publication_date_is_original_utc_not_refresh_date(self):
        item = parse_feed(rss(date='Wed, 27 Aug 2025 05:00:10 +0300'), NOW)[0]
        self.assertEqual(item['publishedAt'], '2025-08-27T02:00:10Z')
        for date in ['', 'nonsense', '2025-08-27T05:00:10', 'Sun, 27 Sep 2026 09:00:00 +0000']:
            with self.subTest(date=date):
                self.assertEqual(parse_feed(rss(date=date), NOW), [])

    def test_article_license_required_even_when_site_footer_is_licensed(self):
        self.assertTrue(rights_allowed(page(), URL))
        self.assertFalse(rights_allowed(page(article_license=False), URL))
        self.assertFalse(rights_allowed(page(license_url='https://creativecommons.org/licenses/by-nc/4.0/'), URL))
        with self.assertRaisesRegex(ValueError, 'Unrecognizable'):
            rights_allowed(page(url=URL.replace('a-kurdish', 'another')), URL)

    def test_syndication_exceptions_fail_closed_but_related_stories_do_not(self):
        for body in ['This article was first published by another publisher.',
                     'An edited version is republished by permission.',
                     'All rights reserved.', 'Shared through a content-sharing agreement.']:
            with self.subTest(body=body):
                self.assertFalse(rights_allowed(page(body=body), URL))
        self.assertTrue(rights_allowed(page(related='An unrelated story was republished with permission.'), URL))

    def test_duplicate_feeds_are_deduplicated_and_no_content_is_published(self):
        data, errors = refresh(self.config, None, NOW, self.good_fetch)
        self.assertFalse(errors)
        self.assertEqual(len(data['items']), 1)
        self.assertEqual(data['sources'][0]['status'], 'ok')
        self.assertEqual(data['lastSuccessfulCheck'], iso(NOW))
        self.assertEqual(validate(data, self.config), 1)
        self.assertEqual(set(data['items'][0]), {'id', 'url', 'title', 'publishedAt', 'author', 'sourceId', 'language', 'topics'})

    def test_all_failed_feeds_keep_archive_and_previous_success(self):
        previous = self.data()
        later = datetime(2026, 9, 28, 8, 0, tzinfo=timezone.utc)
        def failed(url):
            raise TimeoutError('temporary outage')
        data, errors = refresh(self.config, previous, later, failed)
        self.assertEqual(data['items'], previous['items'])
        self.assertEqual(data['lastSuccessfulCheck'], previous['lastSuccessfulCheck'])
        self.assertEqual(data['checkedAt'], iso(later))
        self.assertEqual(data['sources'][0]['status'], 'error')
        self.assertEqual(len(errors), len(self.feeds))

    def test_partial_feed_or_article_failure_is_visible_and_keeps_last_good(self):
        previous = self.data()
        later = datetime(2026, 9, 28, 8, 0, tzinfo=timezone.utc)
        def partial(url):
            if url in {self.feeds[0], URL}:
                raise TimeoutError('unavailable')
            return self.good_fetch(url)
        data, errors = refresh(self.config, previous, later, partial)
        self.assertEqual(data['items'], previous['items'])
        self.assertEqual(data['sources'][0]['status'], 'partial')
        self.assertEqual(data['lastSuccessfulCheck'], previous['lastSuccessfulCheck'])
        self.assertEqual(len(errors), 2)

    def test_unverified_new_article_is_not_added_and_new_exception_removes_old(self):
        def missing_page(url):
            if url == URL:
                raise TimeoutError('unavailable')
            return self.good_fetch(url)
        data, _ = refresh(self.config, None, NOW, missing_page)
        self.assertEqual(data['items'], [])
        previous = self.data()
        def changed_rights(url):
            return rss() if url in self.feeds else page(body='Originally published by a third party.')
        data, _ = refresh(self.config, previous, NOW, changed_rights)
        self.assertEqual(data['items'], [])

    def test_http_200_maintenance_page_keeps_archive_and_marks_partial(self):
        previous = self.data()
        later = datetime(2026, 9, 28, 8, 0, tzinfo=timezone.utc)
        def maintenance(url):
            return rss() if url in self.feeds else b'<html><h1>Temporarily unavailable</h1><p>Please try again later.</p></html>'
        data, errors = refresh(self.config, previous, later, maintenance)
        self.assertEqual(data['items'], previous['items'])
        self.assertEqual(data['sources'][0]['status'], 'partial')
        self.assertEqual(data['lastSuccessfulCheck'], previous['lastSuccessfulCheck'])
        self.assertEqual(data['checkedAt'], iso(later))
        self.assertEqual(len(errors), 1)
        new_data, _ = refresh(self.config, None, later, maintenance)
        self.assertEqual(new_data['items'], [])
        self.assertEqual(new_data['sources'][0]['status'], 'partial')

    def test_invalid_or_entity_feed_does_not_count_as_success(self):
        for invalid in [b'<html>Unavailable</html>', b'<!DOCTYPE rss [<!ENTITY x "value">]><rss><channel/></rss>']:
            with self.subTest(invalid=invalid):
                data, errors = refresh(self.config, None, NOW, lambda url: invalid)
                self.assertEqual(data['sources'][0]['status'], 'error')
                self.assertIsNone(data['lastSuccessfulCheck'])
                self.assertTrue(errors)

    def test_data_validation_blocks_unsafe_drift_and_article_content(self):
        original = self.data()
        for mutate in [lambda d: d['items'].append(copy.deepcopy(d['items'][0])),
                       lambda d: d['items'][0].update({'url': 'https://evil.example/article'}),
                       lambda d: d['items'][0].update({'description': 'Full story goes here'}),
                       lambda d: d['items'][0].update({'publishedAt': '2027-01-01T00:00:00Z'}),
                       lambda d: d['sources'][0].update({'license': 'All rights reserved'})]:
            data = copy.deepcopy(original)
            mutate(data)
            with self.assertRaises(ValueError):
                validate(data, self.config)

    def test_source_configuration_requires_explicit_license_review(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'sources.json'
            for mutate in [lambda d: d['sources'][0].update({'license': 'Unspecified'}),
                           lambda d: d['sources'][0].update({'allowedHosts': ['evil.example']}),
                           lambda d: d['sources'][0].update({'feeds': ['https://evil.example/feed/']})]:
                config = copy.deepcopy(self.config)
                mutate(config)
                path.write_text(json.dumps(config))
                with self.assertRaises(ValueError):
                    read_config(path)

    def test_atomic_save_round_trips_and_leaves_no_temporary_file(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'news.json'
            data = self.data()
            atomic_write(path, data)
            self.assertEqual(json.loads(path.read_text()), data)
            self.assertEqual(list(Path(directory).iterdir()), [path])


if __name__ == '__main__':
    unittest.main()
