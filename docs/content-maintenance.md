# Maintaining the library

Run `bash tools/prepublish.sh` before publishing. Requirements: Python 3.12+ and Node.js 22+. Run `python3 -m pip install -r requirements-validation.txt` and `npm ci --ignore-scripts` once after cloning or dependency changes. PDFs use `pdfinfo` from Poppler when available, with the pinned Python `pypdf` package as a portable fallback. The gate checks JavaScript syntax, regression tests, structured media and relations, required story/reader files, generated catalogue/story/media synchronization, all interface translation keys, PDF headers/end markers, complete local PDF page-tree parsing, and publisher-file checksums. The output is saved in `reports/prepublish.json` and `.md`.

Edit `data/catalogue-full.json` for core books, `data/story-shelf.json` for stories, and `data/recordings.json` for performers and recordings. Use stable IDs/slugs; related recording entries refer to book slugs and performer IDs. Book descriptions and summaries, plus media introductions/descriptions and connection notes, need all six interface locales. Run `python3 tools/rebuild_catalogue.py` after changing books or stories, and `python3 tools/rebuild_recording_data.py` after changing recordings. Use `browseTags` values `short`, `novels`, `children`, `poetry`, or `reference`; set `readingMinutes` only when supported by the actual reading content. CI checks that its browser bundle matches the JSON. Preserve sources, licensing, and credits when adding content.

The `localeFallbacks` map in `data/recordings.json` identifies shared-language media text. Such prose is visibly labelled and carries its actual language for assistive technology. Replacing a shared value with a distinct translation automatically removes the fallback label for that field. Keep editorial-draft/native-review metadata accurate; complete dictionaries alone do not establish translation fluency.

After changing hosted PDFs, run `python3 tools/rebuild_pdf_index.py` to regenerate the browser’s verified-file map. The archive workflows do this automatically, and publication checks reject a stale map.

`readerPath` is a required hosted reader file. An `archiveEligible` record with `localPath` has an optional preservation copy: when absent, the reader falls back to its remote source. Publication checks explicitly report missing optional copies. Run `python3 tools/check_library.py --strict-archives` to require them all, or `python3 tools/verify_library.py` for preservation checksums; the latter now fails for missing copies unless `--allow-missing` is given deliberately.

The PDF and Wikisource archive workflows use `verify_library.py --format=pdf` and `--format=wiki`. Each requires the copies it attempted while still checking all existing checksums. A new file awaiting the other archive workflow does not prevent successful copies from being saved.

## Regular availability checks

The **Library content and link checks** workflow runs local checks on every push and pull request. It also runs a public endpoint audit every Monday at 08:23 UTC and on **Run workflow**. To run the same audit locally:

```sh
python3 tools/check_library.py --remote --workers 4 --timeout 15 --report reports/remote-audit.json
```

The audit uses four requests at a time with a 15-second socket timeout. Remote PDFs are downloaded into temporary files and their signature, end marker, and page tree are parsed. HTML error pages with HTTP 200 and truncated PDFs do not count as working files. Each PDF has a 100 MiB size cap and a 120-second download budget; oversized, slow, partial, or blocked responses are explicitly unverified. The files are deleted after checking, not added to the public archive. Other endpoint probes read at most 16 KiB. Hosted PDFs are parsed by the local publication gate. Story image URLs, Wikisource page existence, spoken-video URLs, and YouTube oEmbed endpoints are checked too. oEmbed availability cannot prove playback works in every country/browser.

Failures stay visible in Actions and the run summary; JSON and Markdown reports are retained as downloadable artifacts for 30 days. Exit `1` means a confirmed issue (missing file, invalid PDF, broken reference, HTTP 404/410). Exit `2` means verification was blocked by a timeout, rate limit, access challenge, or other inconclusive provider response. These are labeled **unverified**, not silently treated as working or permanently removed. Re-run or check the provider manually before replacing a source. No source data is deleted or rewritten by the audit. This audit checks active reader links; a book served from a verified hosted PDF does not depend on the old remote download URL.

## Deployment validation

Netlify builds now run the publication gate from `netlify.toml` and stop on any failed check. `tools/prepare_site.py` stages the checked website into `_site/`, excluding dependencies, tests, source tools, and reports. A manual drag-and-drop upload bypasses Netlify build commands; run the gate locally before uploading.

### GitHub Pages

**Publish validated library** (`publish-validated.yml`) runs on every push to `main` and can also be started from **Actions → Publish validated library → Run workflow**. It runs the publication gate, stages the exact checked checkout with `tools/prepare_site.py`, and uploads that website as the Pages artifact. The deploy job depends on successful validation; a failed check prevents publication and leaves the existing site online.

Successful PDF or Wikisource archive runs on `main` also start this workflow. It checks the latest `main` checkout, including newly preserved files, before publishing. This separate completion trigger is needed because commits made with the archive workflows' `GITHUB_TOKEN` do not start push workflows. Failed archive runs do not start validation or deployment.

Keep **Settings → Pages → Build and deployment → Source** set to **GitHub Actions**. Switching back to branch publishing bypasses this gate. Check the validation summary and retained `publication-checks` artifact when a run fails. After correcting the issue, push the fix or rerun the workflow.

See [GitHub's custom Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
