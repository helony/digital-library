# Kurdish Digital Library — v5 Durable Archive

This release strengthens the library as an independent preservation project rather than a catalogue of outbound links.

## What is included

- **43 catalogue records**
- **Permanent KDL identifiers** for every record (for example `KDL-KMR-0001`)
- **43 permanent book record pages** under `book/<slug>/`
- **26 author pages** under `authors/`
- **About / preservation policy page**
- **Live preservation dashboard** that checks whether archive files are actually present on the deployed site
- Machine-readable **`catalogue.json`** and **`catalogue.csv`**
- Preservation manifest with local target paths and rights-gated archive eligibility
- Local archive downloader for clearly public-domain records
- SHA-256 integrity verification tool
- Dated backup creation tool

## Recommended workflow

### 1. Populate eligible local preservation copies

macOS: double-click `archive-books.command`

Windows: run `archive-books.bat`

Or from a terminal:

```bash
python3 tools/archive_books.py
```

The script only automatically mirrors records marked `eligible: true` in `archive-manifest.json`. Records with regional, uncertain, or permission-limited rights remain manual-review items.
Use `--format=wiki` or `--format=pdf` to archive one format at a time. The GitHub Actions workflow archives eligible Wikisource texts when its workflow file is first pushed, and can be rerun manually in the Actions tab. It commits successful local copies and the updated audit to the repository. PDFs remain a separate step because their sizes and source access vary.

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
