"""Regression checks for publication failures that an HTTP 200 can hide."""
import json
import io
from pathlib import Path
import sys
import tempfile
import shutil
import subprocess
import unittest
from unittest.mock import patch
from urllib.error import HTTPError
from pypdf import PdfWriter

TOOLS = Path(__file__).resolve().parents[1] / 'tools'
sys.path.insert(0, str(TOOLS))
from check_library import StoryParser, pdf_failure, probe, safe_local, validate


class FakeResponse:
    def __init__(self, body, content_type='text/html'):
        self.body = body
        self.stream = io.BytesIO(body)
        self.headers = {'Content-Type': content_type}
        self.status = 200
        self.url = 'https://example.org/book.pdf'
        self.requested = None

    def __enter__(self):
        return self

    def __exit__(self, *args):
        pass

    def read(self, count):
        self.requested = count
        return self.stream.read(count)


def complete_pdf():
    writer = PdfWriter()
    writer.add_blank_page(width=612, height=792)
    output = io.BytesIO()
    writer.write(output)
    return output.getvalue()


class LibraryChecks(unittest.TestCase):
    def test_separate_archive_jobs_require_only_their_missing_format(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            (root / 'tools').mkdir()
            shutil.copyfile(TOOLS / 'verify_library.py', root / 'tools/verify_library.py')
            items = [{'eligible': True, 'slug': 'new-' + kind, 'format': kind,
                      'local_path': 'books/new-' + kind + '/content.' + kind} for kind in ('wiki', 'pdf')]
            (root / 'archive-manifest.json').write_text(json.dumps({'items': items}))
            pdf = root / items[1]['local_path']
            pdf.parent.mkdir(parents=True)
            pdf.write_bytes(complete_pdf())
            for requested, expected in [('pdf', 0), ('wiki', 1)]:
                with self.subTest(format=requested):
                    result = subprocess.run([sys.executable, str(root / 'tools/verify_library.py'), '--format=' + requested], capture_output=True, text=True)
                    self.assertEqual(result.returncode, expected, result.stdout + result.stderr)
            # Scoping missing files never disables checksum failures in another format.
            pdf.with_name('metadata.json').write_text(json.dumps({'sha256': '0' * 64}))
            result = subprocess.run([sys.executable, str(root / 'tools/verify_library.py'), '--format=wiki', '--allow-missing'], capture_output=True, text=True)
            self.assertEqual(result.returncode, 1)

    def test_http_200_html_is_not_a_working_pdf(self):
        response = FakeResponse(b'<html>This file was removed</html>')
        with patch('check_library.urlopen', return_value=response):
            result = probe({'kind': 'pdf', 'ids': ['book'], 'url': response.url})
        self.assertEqual(result['status'], 'failed')
        self.assertLessEqual(response.requested, 16384)

    def test_pdf_content_is_verified_without_trusting_content_type(self):
        response = FakeResponse(complete_pdf(), 'application/octet-stream')
        with patch('check_library.urlopen', return_value=response):
            result = probe({'kind': 'pdf', 'ids': ['book'], 'url': response.url})
        self.assertEqual(result['status'], 'passed')
        self.assertIn('Complete PDF downloaded and parsed', result['message'])

    def test_pdf_header_alone_is_not_a_valid_remote_pdf(self):
        response = FakeResponse(b'%PDF-1.7\ntruncated content', 'application/pdf')
        with patch('check_library.urlopen', return_value=response):
            result = probe({'kind': 'pdf', 'ids': ['book'], 'url': response.url})
        self.assertEqual(result['status'], 'failed')
        self.assertIn('truncated', result['message'])

    def test_partial_and_oversized_pdf_are_unverified(self):
        for partial in (True, False):
            response = FakeResponse(complete_pdf(), 'application/pdf')
            if partial:
                response.status = 206
            else:
                response.headers['Content-Length'] = str(101 * 1024 * 1024)
            with self.subTest(partial=partial), patch('check_library.urlopen', return_value=response):
                result = probe({'kind': 'pdf', 'ids': ['book'], 'url': response.url})
            self.assertEqual(result['status'], 'unverified')

    def test_python_parser_works_without_poppler(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'book.pdf'
            path.write_bytes(complete_pdf())
            with patch('check_library.shutil.which', return_value=None):
                self.assertIsNone(pdf_failure(path, require_parser=True))
                path.write_bytes(b'%PDF-1.7\nnot a page tree\n%%EOF')
                self.assertIn('could not read pages', pdf_failure(path, require_parser=True))

    def test_unavailable_and_rate_limited_are_distinct(self):
        for status, expected in [(404, 'failed'), (410, 'failed'), (403, 'unverified'), (429, 'unverified'), (503, 'unverified')]:
            with self.subTest(status=status), patch('check_library.urlopen', side_effect=HTTPError('https://example.org', status, '', {}, None)):
                result = probe({'kind': 'page', 'ids': ['test'], 'url': 'https://example.org'})
                self.assertEqual(result['status'], expected)

    def test_access_challenge_is_not_reported_as_valid_or_removed(self):
        response = FakeResponse(b'<html>Just a moment... checking your browser</html>')
        with patch('check_library.urlopen', return_value=response):
            result = probe({'kind': 'pdf', 'ids': ['book'], 'url': response.url})
        self.assertEqual(result['status'], 'unverified')

    def test_wikisource_missing_page_is_failure_even_at_http_200(self):
        response = FakeResponse(json.dumps({'query': {'pages': [{'title': 'Gone', 'missing': True}]}}).encode(), 'application/json')
        with patch('check_library.urlopen', return_value=response):
            result = probe({'kind': 'wiki', 'ids': ['book'], 'url': response.url})
        self.assertEqual(result['status'], 'failed')

    def test_empty_wikisource_api_response_cannot_pass(self):
        response = FakeResponse(b'{}', 'application/json')
        with patch('check_library.urlopen', return_value=response):
            result = probe({'kind': 'wiki', 'ids': ['book'], 'url': response.url})
        self.assertEqual(result['status'], 'unverified')

    def test_empty_story_is_not_hidden_by_page_navigation_text(self):
        parser = StoryParser()
        parser.feed('<title>A story</title><nav>Library</nav><main class="story-reader"></main><footer>Credits</footer>')
        self.assertTrue(parser.text)
        self.assertFalse(parser.reader_text)
        parser = StoryParser()
        parser.feed('<main class="story-reader"><p>Story <em>text</em><br>continues</p></main><footer>Credits</footer>')
        self.assertEqual(parser.reader_text, ['Story', 'text', 'continues'])

    def test_bad_local_pdf_and_path_traversal(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            pdf = root / 'book.pdf'
            pdf.write_bytes(b'<html>not a PDF</html>')
            self.assertIn('not a PDF', pdf_failure(pdf))
            pdf.write_bytes(b'%PDF-1.7\ntruncated')
            self.assertIn('truncated', pdf_failure(pdf))
            self.assertIsNone(safe_local(root, '../outside.pdf'))
            self.assertIsNone(safe_local(root, '/etc/passwd'))
            self.assertIsNone(safe_local(root, '//example.org/book.pdf'))
            self.assertIsNone(safe_local(root, '%2e%2e/outside.pdf'))
            self.assertEqual(safe_local(root, 'book.pdf?page=2#page=2'), pdf)

    def test_missing_story_duplicate_id_and_dangling_relationship_fail(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            (root / 'data').mkdir()
            book = {'id': 1, 'slug': 'example', 'title': 'Example', 'author': 'Author', 'v': 'kmr', 'format': 'web', 'source': 'https://example.org/source', 'url': 'stories/missing/index.html', 'localStory': True, 'desc': {'en': 'Example story'}}
            (root / 'data/catalogue-full.json').write_text(json.dumps({'records': []}))
            (root / 'data/story-shelf.json').write_text(json.dumps([book, {**book, 'slug': 'second'}]))
            (root / 'assets').mkdir()
            (root / 'assets/story-data.js').write_text('window.KDL_STORIES = [];')
            media = {'performers': [], 'recordings': [{'id': 'broken', 'title': 'Test', 'kind': 'archive', 'collection': 'spoken', 'credit': 'Source', 'sourceUrl': 'https://example.org/source', 'performerIds': ['unknown'], 'relatedBooks': ['missing-book'], 'aliases': [], 'description': {code: 'Test' for code in ('en', 'kmr', 'ckb', 'diq', 'hac', 'sdh')}, 'connection': {code: 'Test' for code in ('en', 'kmr', 'ckb', 'diq', 'hac', 'sdh')}}]}
            (root / 'data/recordings.json').write_text(json.dumps(media))
            rows = validate(root)
            messages = '\n'.join(row['message'] for row in rows if row['status'] == 'failed')
            self.assertIn('Duplicate book id', messages)
            self.assertIn('Required reading file missing', messages)
            self.assertIn('unknown performer', messages)
            self.assertIn('unknown book', messages)
            self.assertIn('Generated data is stale', messages)


if __name__ == '__main__':
    unittest.main()
