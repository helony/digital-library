# Kurdish Digital Library

A multilingual library connecting Kurdish books, stories, poetry, and recorded voices.

## Current collection and reader

- 121 readable works: 70 core catalogue entries plus story shelves, with three additional source-guide records kept out of the reading grid.
- 43 PDF titles; 14 verified local PDF files, with publisher-hosted reading for the remaining titles.
- One search across books, authors, performers and 24 media entries, including 18 Dengbêj performances.
- Accent-insensitive and Arabic-keyboard-equivalent search, browse categories, saved books and reading progress in this browser.
- A self-hosted PDF.js reader with mobile controls, page restoration, text access and an external-source fallback.
- Linked reading/listening, performer introductions, source credits and problem reports.
- Six interface dictionaries and catalogue descriptions. Editorial translations, especially Hewramî, Southern Kurdish and Zazakî, benefit from fluent-speaker review. Hewramî and Southern Kurdish media prose currently uses a shared Sorani fallback, with visible language labels and matching language attributes; native translations remain editorial work.

## Checks and maintenance

See [docs/content-maintenance.md](docs/content-maintenance.md) for the source data, regeneration commands, local validation, weekly link audits and deployment gates. Netlify and GitHub Pages run validation before deployment. Every push to `main` starts **Publish validated library**; only a successfully checked website is published. Keep the Pages source set to **GitHub Actions**.

## Recommended workflow

### 1. Populate eligible local preservation copies

macOS: double-click `archive-books.command`

Windows: run `archive-books.bat`

Or from a terminal:

```bash
python3 tools/archive_books.py
```

The script only automatically mirrors records marked `eligible: true` in `archive-manifest.json`. Records with regional, uncertain, or permission-limited rights remain manual-review items.
Use `--format=wiki` or `--format=pdf` to archive one format at a time. Separate GitHub Actions workflows archive eligible Wikisource texts and historical PDF scans; each can be rerun manually in the Actions tab. They commit successful local copies and the updated audit to the repository. PDF downloads are capped at 90 MiB per file to stay within GitHub's per-file limit.

### 2. Verify the archive

macOS: `verify-library.command`

Windows: `verify-library.bat`

Or:

```bash
python3 tools/verify_library.py
```

This checks that eligible local files are present and, when archive metadata contains a stored SHA-256 hash, confirms the file still matches it. It writes `library-audit.json`.

### 3. Make an offline backup

macOS: `make-backup.command`

Windows: `make-backup.bat`

Or:

```bash
python3 tools/make_backup.py
```

This produces a dated zip next to the project folder.

### 4. Deploy

Upload the **entire folder** to Netlify or another static host. Do not upload only `index.html`; the site depends on `assets/`, `book/`, `authors/`, and eventually `books/`.

## Key files

- `index.html` — main multilingual catalogue
- `assets/app.js` — catalogue data and interactive reader
- `catalogue.json` / `catalogue.csv` — portable catalogue metadata
- `archive-manifest.json` — preservation policy and target paths
- `books/` — local preservation copies
- `book/` — durable individual record pages
- `authors/` — author index and author holdings pages
- `preservation/` — deployed archive-status dashboard
- `about/` — project and rights methodology
- `tools/archive_books.py` — fetch eligible preservation copies
- `tools/verify_library.py` — integrity checker
- `tools/make_backup.py` — offline backup tool

## Permanent identifiers

IDs follow:

`KDL-<primary language code>-<sequence>`

Examples:

- `KDL-KMR-0001` — primary Kurmancî record
- `KDL-CKB-0001` — primary Soranî / Central Kurdish record
- `KDL-DIQ-0001` — primary Zazakî record
- `KDL-HAC-0001` — primary Hewramî/Goranî record
- `KDL-SDH-0001` — primary Southern Kurdish record

Once assigned, an ID should **never be reused or changed** merely because a title, spelling, metadata field, or source URL is corrected.

## Preservation principle

The library should prefer a locally preserved copy when redistribution is clearly allowed. The external source remains in the record as **provenance**, not as the only copy on which the library depends.

Being available online does not itself establish redistribution rights. Modern editions, translations, transcriptions, introductions and scans can have rights separate from the underlying historical work.

## Catalogue source of truth

The editable master catalogue is `data/catalogue-full.json`. The browser copy in `assets/catalogue-data.js`, the public `catalogue.json` / `catalogue.csv`, the archive manifest, and fallback catalogue counts can be regenerated with:

```bash
python3 tools/rebuild_catalogue.py
```

This separation keeps catalogue content out of the main UI code and makes future additions safer.
