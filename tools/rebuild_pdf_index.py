#!/usr/bin/env python3
"""Regenerate the browser's local PDF targets from verified archive copies.

Run after tools/archive_books.py. Use --check before publishing to require the
committed map to match the archive without modifying any files.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BEGIN = '// BEGIN GENERATED VERIFIED PDF PATHS'
END = '// END GENERATED VERIFIED PDF PATHS'


def verified_paths(root: Path) -> dict[str, str]:
    """Fail closed if an archive claims a local PDF that is absent or changed."""
    manifest = json.loads((root / 'books/archive-index.json').read_text(encoding='utf-8'))
    items = manifest.get('items')
    if not isinstance(items, list):
        raise ValueError('books/archive-index.json must contain an items list')
    result = {}
    books = (root / 'books').resolve()
    for item in items:
        if not isinstance(item, dict) or item.get('ok') is not True:
            continue
        target = item.get('path', '')
        if not isinstance(target, str) or not target.lower().endswith('.pdf'):
            continue
        slug = item.get('slug', '')
        if not isinstance(slug, str) or not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', slug):
            raise ValueError(f'Invalid PDF slug: {slug!r}')
        if slug in result:
            raise ValueError(f'Duplicate PDF slug: {slug}')
        path = (root / target).resolve()
        if not target.startswith('books/') or not path.is_relative_to(books):
            raise ValueError(f'PDF path must remain inside books/: {target}')
        expected = item.get('sha256', '')
        if not isinstance(expected, str) or not re.fullmatch(r'[0-9a-fA-F]{64}', expected):
            raise ValueError(f'Missing or invalid archive SHA-256: {target}')
        digest = hashlib.sha256()
        size = 0
        with path.open('rb') as pdf:
            header = pdf.read(5)
            if header != b'%PDF-':
                raise ValueError(f'Not a PDF file: {target}')
            digest.update(header)
            size = len(header)
            for chunk in iter(lambda: pdf.read(1024 * 1024), b''):
                digest.update(chunk)
                size += len(chunk)
        if digest.hexdigest() != expected.lower():
            raise ValueError(f'Archive SHA-256 mismatch: {target}')
        if item.get('bytes') is not None and item['bytes'] != size:
            raise ValueError(f'Archive byte count mismatch: {target}')
        result[slug] = target
    return dict(sorted(result.items()))


def rebuild(root: Path = ROOT, *, check: bool = False) -> tuple[int, bool]:
    paths = verified_paths(root)
    script = root / 'assets/discovery-utils.js'
    content = script.read_text(encoding='utf-8')
    if content.count(BEGIN) != 1 or content.count(END) != 1:
        raise ValueError('Expected exactly one generated PDF map block in assets/discovery-utils.js')
    start = content.index(BEGIN)
    end = content.index(END, start) + len(END)
    block = BEGIN + '\n const verifiedPdfPaths=Object.freeze(' + json.dumps(paths, ensure_ascii=False, indent=2) + ');\n ' + END
    updated = content[:start] + block + content[end:]
    changed = updated != content
    if changed:
        if check:
            raise ValueError('Local PDF map is stale. Run: python3 tools/rebuild_pdf_index.py')
        script.write_text(updated, encoding='utf-8')
    return len(paths), changed


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='fail if the generated PDF map is stale; do not write files')
    args = parser.parse_args()
    try:
        count, changed = rebuild(check=args.check)
    except (OSError, ValueError, KeyError) as error:
        print(f'PDF index: {error}', file=sys.stderr)
        return 1
    print(f'PDF index: {count} verified local PDFs; ' + ('updated.' if changed else 'up to date.'))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
