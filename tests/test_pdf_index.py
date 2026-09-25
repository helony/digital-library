"""Regression coverage for the generated browser PDF target index."""
import hashlib
import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'tools'))
from rebuild_pdf_index import BEGIN, END, rebuild, verified_paths


class PdfIndexTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / 'books').mkdir()
        (self.root / 'assets').mkdir()
        self.script = self.root / 'assets/discovery-utils.js'
        self.script.write_text('before();\n' + BEGIN + '\nconst verifiedPdfPaths={};\n' + END + '\nafter();\n')
        self.items = []

    def pdf(self, slug, data=b'%PDF-1.7\nexample content\n%%EOF\n'):
        target = f'books/{slug}/book.pdf'
        file = self.root / target
        file.parent.mkdir(parents=True, exist_ok=True)
        file.write_bytes(data)
        self.items.append({'slug': slug, 'ok': True, 'path': target, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()})
        self.manifest()
        return file

    def manifest(self):
        (self.root / 'books/archive-index.json').write_text(json.dumps({'items': self.items}))

    def test_check_detects_stale_map_without_writing_then_rebuild_is_deterministic(self):
        self.pdf('z-last')
        self.pdf('a-first')
        before = self.script.read_text()
        with self.assertRaisesRegex(ValueError, 'stale'):
            rebuild(self.root, check=True)
        self.assertEqual(self.script.read_text(), before)
        self.assertEqual(rebuild(self.root), (2, True))
        generated = self.script.read_text()
        self.assertTrue(generated.startswith('before();\n'))
        self.assertTrue(generated.endswith('\nafter();\n'))
        self.assertLess(generated.index('a-first'), generated.index('z-last'))
        self.assertEqual(rebuild(self.root, check=True), (2, False))
        self.assertEqual(rebuild(self.root), (2, False))

    def test_changed_pdf_hash_is_rejected_before_map_is_modified(self):
        file = self.pdf('a-book')
        before = self.script.read_text()
        file.write_bytes(b'%PDF-1.7\nchanged\n%%EOF\n')
        with self.assertRaisesRegex(ValueError, 'SHA-256 mismatch'):
            rebuild(self.root)
        self.assertEqual(self.script.read_text(), before)

    def test_html_error_page_cannot_be_indexed_even_with_matching_hash(self):
        self.pdf('a-book', b'<html>Source is unavailable</html>')
        with self.assertRaisesRegex(ValueError, 'Not a PDF'):
            verified_paths(self.root)

    def test_failed_archives_are_excluded_and_local_paths_cannot_escape_books(self):
        self.pdf('a-book')
        self.items.append({'slug': 'failed', 'ok': False, 'path': 'books/failed/book.pdf'})
        self.manifest()
        self.assertEqual(list(verified_paths(self.root)), ['a-book'])
        self.items[0]['path'] = 'books/../outside.pdf'
        self.manifest()
        with self.assertRaisesRegex(ValueError, 'inside books'):
            verified_paths(self.root)


if __name__ == '__main__':
    unittest.main()
