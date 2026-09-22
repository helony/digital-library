# Local preservation copies

This folder is intentionally part of the website. The library can serve eligible books from here instead of depending on an outside site.

Run from the project root:

```bash
python3 tools/archive_books.py
```

The script reads `archive-manifest.json` and automatically archives **only records marked public domain**. It creates:

- `books/<slug>/book.pdf` for PDF scans
- `books/<slug>/content.html` for Wikisource text snapshots
- `books/<slug>/metadata.json` with source, rights, archive date and SHA-256 checksum
- `books/archive-index.json` as a run report

The website automatically prefers these local preservation copies when they exist and falls back to the original source when they do not.

Do not manually change an item from `eligible: false` to `true` unless its redistribution rights have been verified. Regional-public-domain, uncertain-rights and permission-based records are deliberately skipped by the automatic archiver.
