#!/usr/bin/env python3
"""Validate publication data and files, or audit public reading/media endpoints.

Local:  python3 tools/check_library.py --require-pdf-parser
Remote: python3 tools/check_library.py --remote --report reports/remote-audit.json

Exit 1 = confirmed content/data failure; exit 2 = remote checks need manual review
(e.g. timeout, rate limit, or an access challenge). PDFs are downloaded to temporary
files and parsed, up to 100 MiB/120 seconds per file; non-PDF probes read 16 KiB.
YouTube oEmbed availability does not prove playback.
"""
from __future__ import annotations

import argparse
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
import hashlib
from http.client import HTTPException
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
import time
from urllib.error import HTTPError, URLError
from urllib.parse import unquote, urlencode, urlsplit
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
UA = 'KurdishDigitalLibraryLinkAudit/1.0 (https://github.com/helony/digital-library)'
SLUG = re.compile(r'^[a-z0-9][a-z0-9-]*$')
LANGUAGES = ('en', 'kmr', 'ckb', 'diq', 'hac', 'sdh')
MAX_PROBE_BYTES = 16384
MAX_PDF_BYTES = 100 * 1024 * 1024
MAX_PDF_SECONDS = 120


def is_http(value):
    if not isinstance(value, str):
        return False
    try:
        parts = urlsplit(value)
    except ValueError:
        return False
    return parts.scheme in ('https', 'http') and bool(parts.hostname) and not parts.username and not parts.password


def safe_local(root, value):
    if not isinstance(value, str) or not value:
        return None
    try:
        parts = urlsplit(value)
    except ValueError:
        return None
    if parts.scheme or parts.netloc or not parts.path or parts.path.startswith('/'):
        return None
    path = (root / unquote(parts.path)).resolve()
    return path if path.is_relative_to(root.resolve()) else None


def sha256(path):
    digest = hashlib.sha256()
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def pdf_failure(path, require_parser=False):
    with path.open('rb') as stream:
        start = stream.read(1024)
        stream.seek(max(0, path.stat().st_size - 4096))
        end = stream.read()
    if not start.lstrip().startswith(b'%PDF-'):
        return 'File is not a PDF (missing %PDF- signature)'
    if b'%%EOF' not in end:
        return 'PDF appears truncated (missing end-of-file marker)'
    parser = shutil.which('pdfinfo')
    if not parser:
        try:
            from pypdf import PdfReader
        except ImportError:
            return 'A PDF parser is required: install requirements-validation.txt or poppler-utils'
        try:
            reader = PdfReader(path, strict=False)
            if reader.is_encrypted and reader.decrypt('') == 0:
                return 'PDF is password-protected'
            if len(reader.pages) < 1:
                return 'PDF contains no pages'
            for page in reader.pages:
                if float(page.mediabox.width) <= 0 or float(page.mediabox.height) <= 0:
                    return 'PDF contains invalid page dimensions'
                contents = page.get('/Contents')
                if contents is not None:
                    contents.get_object()
        except Exception as error:
            return 'PDF parser could not read pages: ' + str(error)[:240]
        return None
    try:
        result = subprocess.run([parser, str(path)], capture_output=True, text=True, timeout=35)
    except subprocess.TimeoutExpired:
        return 'PDF parser timed out after 35 seconds'
    pages = re.search(r'^Pages:\s+(\d+)', result.stdout, re.M)
    if result.returncode or not pages or int(pages[1]) < 1:
        return 'PDF parser could not read pages: ' + result.stderr.strip()[:240]
    return None


class StoryParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.reader = False
        self.text = []
        self.reader_text = []
        self.reader_depth = 0
        self.image_urls = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        void = tag in ('area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr')
        if self.reader_depth and not void:
            self.reader_depth += 1
        elif 'story-reader' in (attrs.get('class') or '').split():
            self.reader = True
            self.reader_depth = 1
        if tag == 'img' and is_http(attrs.get('src')):
            self.image_urls.append(attrs['src'])

    def handle_endtag(self, tag):
        if self.reader_depth and tag not in ('area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'):
            self.reader_depth -= 1

    def handle_data(self, data):
        if data.strip():
            self.text.append(data.strip())
            if self.reader_depth:
                self.reader_text.append(data.strip())


def load_data(root):
    return (json.loads((root / 'data/catalogue-full.json').read_text())['records'],
            json.loads((root / 'data/story-shelf.json').read_text()),
            json.loads((root / 'data/recordings.json').read_text()) if (root / 'data/recordings.json').exists() else None)


def validate(root=ROOT, require_parser=False, strict_archives=False):
    rows = []

    def issue(status, kind, identity, message, **extra):
        rows.append(dict(status=status, kind=kind, id=str(identity), message=message, **extra))

    try:
        catalogue, stories, media = load_data(root)
    except (OSError, ValueError, KeyError, TypeError) as error:
        issue('failed', 'data', 'catalogue', str(error))
        return rows
    if not isinstance(catalogue, list) or not isinstance(stories, list):
        issue('failed', 'data', 'catalogue', 'Catalogue records and story shelf must be arrays')
        return rows
    all_books = []
    for index, book in enumerate(catalogue + stories):
        if not isinstance(book, dict):
            issue('failed', 'data', index, 'Book/story entry must be an object')
        else:
            all_books.append(book)
    for key in ('id', 'slug'):
        for value, count in Counter(str(book.get(key)) for book in all_books).items():
            if count > 1:
                issue('failed', 'data', value, f'Duplicate book {key}: {count} entries')
    pdf_paths = set()
    for book in all_books:
        identity = book.get('slug', book.get('id', '(unknown)'))
        for field in ('id', 'slug', 'title', 'author', 'v', 'format', 'source', 'url'):
            if field not in book or book[field] in ('', None):
                issue('failed', 'book', identity, f'Missing required field: {field}')
        if not isinstance(book.get('id'), int) or isinstance(book.get('id'), bool) or book.get('id', 0) <= 0:
            issue('failed', 'book', identity, 'Book ID must be a positive integer')
        if not SLUG.fullmatch(str(book.get('slug', ''))):
            issue('failed', 'book', identity, 'Slug must use lowercase letters, digits, and hyphens')
        if book.get('format') not in ('pdf', 'wiki', 'web'):
            issue('failed', 'book', identity, 'Unknown reading format')
        tags = book.get('browseTags', [])
        if not isinstance(tags, list) or any(tag not in ('short', 'novels', 'children', 'poetry', 'reference') for tag in tags):
            issue('failed', 'book', identity, 'Unknown browseTags category')
        minutes = book.get('readingMinutes')
        if minutes is not None and (not isinstance(minutes, int) or isinstance(minutes, bool) or minutes <= 0):
            issue('failed', 'book', identity, 'readingMinutes must be a positive integer')
        if not is_http(book.get('source')):
            issue('failed', 'book', identity, 'Source must be an HTTP(S) URL')
        for field in ('desc', 'summary'):
            translations = book.get(field)
            missing = [locale for locale in LANGUAGES if not isinstance(translations, dict) or not isinstance(translations.get(locale), str) or not translations.get(locale, '').strip()]
            if missing:
                issue('failed', 'translation', identity, f'{field} missing interface languages: ' + ', '.join(missing))
        if not book.get('localStory') and not is_http(book.get('url')):
            issue('failed', 'book', identity, 'Remote reading URL must be HTTP(S)')
        if book.get('format') == 'wiki' and not book.get('wiki'):
            issue('failed', 'book', identity, 'Wikisource reading needs a wiki page title')
        local_fields = []
        if book.get('localStory'):
            local_fields.append(('url', True))
        if book.get('readerPath'):
            local_fields.append(('readerPath', True))
        if book.get('archiveEligible') and not book.get('localPath'):
            issue('failed', 'file', identity, 'Archive-eligible record has no localPath')
        if book.get('localPath'):
            local_fields.append(('localPath', strict_archives and bool(book.get('archiveEligible'))))
        for field, required in local_fields:
            path = safe_local(root, book[field])
            if path is None:
                issue('failed', 'file', identity, f'Unsafe local path in {field}', path=book[field])
            elif not path.is_file() and (required or book.get('archiveEligible')):
                issue('failed' if required else 'warning', 'file', identity,
                      'Required reading file missing' if required else 'Optional preservation copy missing; reader uses external source', path=book[field])
            elif path.is_file() and path.suffix.lower() == '.pdf':
                pdf_paths.add(path)
            elif path.is_file() and path.suffix.lower() == '.html':
                text = path.read_text(encoding='utf-8')
                parser = StoryParser()
                parser.feed(text)
                if not parser.text or (book.get('localStory') and (not parser.reader or not parser.reader_text)):
                    issue('failed', 'story', identity, 'Local story is empty or lacks .story-reader', path=book[field])
    # Include PDFs not currently referenced to prevent unnoticed corrupt hosted files.
    pdf_paths.update((root / 'books').glob('**/*.pdf'))
    for path in sorted(pdf_paths):
        problem = pdf_failure(path, require_parser)
        rel = str(path.relative_to(root))
        issue('failed' if problem else 'passed', 'pdf', rel, problem or 'PDF signature, end marker, and page validation passed', path=rel)
        meta = path.parent / 'metadata.json'
        if meta.exists():
            try:
                expected = json.loads(meta.read_text()).get('sha256')
                if expected and sha256(path) != expected:
                    issue('failed', 'checksum', rel, 'Preservation SHA-256 checksum mismatch')
            except (OSError, ValueError) as error:
                issue('failed', 'checksum', rel, str(error))
    license_path = root / 'data/licensed-reader-copies.json'
    if license_path.exists():
        for item in json.loads(license_path.read_text()):
            path = safe_local(root, item.get('path'))
            if path is None or not path.is_file():
                issue('failed', 'licensed-copy', item.get('slug'), 'Reviewed publisher file missing', path=item.get('path'))
            elif sha256(path) != item.get('sha256') or path.stat().st_size != item.get('bytes'):
                issue('failed', 'licensed-copy', item.get('slug'), 'Reviewed publisher file differs from approved bytes/checksum')
    if media is None:
        issue('failed', 'media', 'recordings', 'data/recordings.json is missing')
    else:
        try:
            try:
                from .rebuild_recording_data import load_and_validate
            except ImportError:
                from rebuild_recording_data import load_and_validate
            load_and_validate(root)
        except (OSError, ValueError, KeyError, TypeError) as error:
            issue('failed', 'media', 'recordings', str(error))
    for relative, variable, expected in (
            ('assets/catalogue-data.js', 'KDL_BOOKS', catalogue),
            ('assets/story-data.js', 'KDL_STORIES', stories)):
        try:
            source = (root / relative).read_text(encoding='utf-8')
            marker = re.search(r'window\.' + variable + r'\s*=\s*', source)
            if marker is None:
                raise ValueError('Missing generated data assignment')
            actual, length = json.JSONDecoder().raw_decode(source[marker.end():])
            if actual != expected or source[marker.end() + length:].strip() not in ('', ';'):
                raise ValueError('Generated data is stale; run tools/rebuild_catalogue.py')
        except (OSError, ValueError) as error:
            issue('failed', 'generated-data', relative, str(error))
    permanent_ids = [book.get('kdlId') for book in catalogue]
    if len(permanent_ids) != len(set(permanent_ids)):
        issue('failed', 'book', 'permanent IDs', 'Duplicate permanent KDL identifier')
    for book in catalogue:
        if not re.fullmatch(r'KDL-[A-Z]{3}-\d{4}', str(book.get('kdlId', ''))):
            issue('failed', 'book', book.get('slug'), 'Invalid permanent KDL identifier')
        record_path = safe_local(root, 'book/' + str(book.get('slug')) + '/index.html')
        if record_path is None or not record_path.is_file():
            issue('failed', 'file', book.get('slug'), 'Missing permanent book record page')
    if not any(row['status'] == 'failed' for row in rows):
        issue('passed', 'schema', 'catalogue', f'{len(all_books)} book/story records validated')
    return rows


def remote_targets(root=ROOT):
    books, stories, media = load_data(root)
    tasks = {}

    def add(kind, identity, url, **extra):
        if is_http(url):
            key = (kind, url)
            if key in tasks:
                tasks[key]['ids'].append(identity)
            else:
                tasks[key] = dict(kind=kind, ids=[identity], url=url, **extra)
    for book in books + stories:
        if book.get('sourceOnly'):
            continue
        identity = book['slug']
        if book.get('format') == 'pdf':
            local = book.get('readerPath') or book.get('localPath')
            if local and (root / local).is_file():
                # The publication gate fully parses the reader's local PDF.
                continue
            add('pdf', identity, book['url'])
        elif book.get('format') == 'wiki':
            params = urlencode(dict(action='query', titles=book['wiki'], format='json', formatversion=2))
            add('wiki', identity, 'https://wikisource.org/w/api.php?' + params)
        elif book.get('localStory'):
            parser = StoryParser()
            parser.feed((root / book['url']).read_text())
            for src in parser.image_urls:
                add('image', identity, src)
        else:
            add('page', identity, book['url'])
    for rec in (media or {}).get('recordings', []):
        video = urlsplit(rec.get('embedUrl', '')).path.removeprefix('/embed/')
        if video:
            params = urlencode({'url': 'https://www.youtube.com/watch?v=' + video, 'format': 'json'})
            add('youtube', rec['id'], 'https://www.youtube.com/oembed?' + params)
        else:
            add('media' if rec.get('videoUrl') else 'page', rec['id'], rec.get('videoUrl') or rec.get('sourceUrl'))
    return list(tasks.values())


def probe(task, timeout=15):
    row = dict(task)
    kind = task['kind']
    headers = {'User-Agent': UA, 'Accept': '*/*'}
    if kind != 'pdf':
        headers['Range'] = f'bytes=0-{MAX_PROBE_BYTES - 1}'
    request = Request(task['url'], headers=headers)
    started = time.monotonic()
    try:
        with urlopen(request, timeout=timeout) as response:
            data = response.read(MAX_PROBE_BYTES)
            row['http_status'] = response.status
            row['final_url'] = response.url
            row['content_type'] = response.headers.get('Content-Type', '')
            challenge = re.search(rb'captcha|access denied|challenge-platform|checking your browser|just a moment', data, re.I)
            if challenge and ('text/html' in row['content_type'].lower() or data.lstrip().startswith(b'<')):
                row.update(status='unverified', message='Access challenge; content could not be checked')
                return row
            if kind == 'pdf':
                if not data.lstrip().startswith(b'%PDF-'):
                    row.update(status='failed', message='Reading endpoint returned non-PDF bytes')
                    return row
                length = response.headers.get('Content-Length')
                if length and int(length) > MAX_PDF_BYTES:
                    row.update(status='unverified', message='PDF exceeds the 100 MiB audit limit; full file needs manual validation')
                    return row
                if response.status == 206:
                    row.update(status='unverified', message='Provider sent only part of the PDF; full-file parsing is unavailable')
                    return row
                with tempfile.TemporaryDirectory(prefix='kdl-pdf-audit-') as folder:
                    pdf = Path(folder) / 'book.pdf'
                    size = len(data)
                    with pdf.open('wb') as stream:
                        stream.write(data)
                        while True:
                            if time.monotonic() - started > MAX_PDF_SECONDS:
                                row.update(status='unverified', message='PDF download exceeded the 120-second audit limit')
                                return row
                            chunk = response.read(256 * 1024)
                            if not chunk:
                                break
                            size += len(chunk)
                            if size > MAX_PDF_BYTES:
                                row.update(status='unverified', message='PDF exceeds the 100 MiB audit limit; full file needs manual validation')
                                return row
                            stream.write(chunk)
                    problem = pdf_failure(pdf, require_parser=True)
                    row['bytes'] = size
                    if problem:
                        row.update(status='unverified' if 'parser is required' in problem else 'failed', message=problem)
                    else:
                        row.update(status='passed', message='Complete PDF downloaded and parsed successfully')
                    return row
        if kind in ('wiki', 'youtube'):
            payload = json.loads(data)
            if kind == 'wiki':
                pages = payload.get('query', {}).get('pages')
                if payload.get('error') or not isinstance(pages, list) or not pages:
                    row.update(status='unverified', message='Wikisource did not return a valid page result')
                elif any('missing' in p or 'invalid' in p for p in pages):
                    row.update(status='failed', message='Wikisource page is missing or invalid')
                else:
                    row.update(status='passed', message='Wikisource page exists')
            elif not payload.get('html'):
                row.update(status='failed', message='YouTube did not return an embeddable recording')
            else:
                row.update(status='passed', message='YouTube oEmbed available (playback not verified)')
        elif kind == 'image' and not row['content_type'].lower().startswith('image/'):
            row.update(status='failed', message='Story illustration endpoint did not return an image')
        elif kind == 'media' and not row['content_type'].lower().startswith(('audio/', 'video/', 'application/ogg')):
            row.update(status='failed', message='Recording endpoint did not return audio/video')
        else:
            row.update(status='passed', message='Endpoint responded')
    except HTTPError as error:
        row.update(status='failed' if error.code in (404, 410) else 'unverified', http_status=error.code,
                   message=f'HTTP {error.code}: ' + ('link is missing' if error.code in (404, 410) else 'blocked, rate-limited, or unavailable; retry/manual check required'))
    except (URLError, TimeoutError, OSError, ValueError, HTTPException) as error:
        row.update(status='unverified', message=f'Could not verify: {str(error)[:240]}')
    return row


def write_report(rows, report, remote=False):
    counts = Counter(row['status'] for row in rows)
    payload = {'checked_at': datetime.now(timezone.utc).isoformat(), 'mode': 'remote' if remote else 'local',
               'complete': True, 'summary': dict(counts), 'items': rows}
    report.parent.mkdir(parents=True, exist_ok=True)
    report.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n')
    lines = ['# Library ' + ('link audit' if remote else 'publication checks'), '',
             ', '.join(f'{value} {key}' for key, value in sorted(counts.items())), '']
    if remote:
        lines.extend(['PDF checks download and parse complete files (100 MiB/120-second limit); blocked or oversized files remain unverified.',
                      'YouTube checks verify oEmbed availability, not playback, geography, or age restrictions.', ''])
    for row in rows:
        if row['status'] == 'passed':
            continue
        identity = row.get('id') or ', '.join(row.get('ids', []))
        lines.append(f"- **{row['status']}** `{identity}`: {row['message']}" + (f" — {row.get('path') or row.get('url')}" if row.get('path') or row.get('url') else ''))
    report.with_suffix('.md').write_text('\n'.join(lines) + '\n')
    print('\n'.join(lines))
    print(f'JSON report: {report}')
    return 1 if counts['failed'] else (2 if counts['unverified'] else 0)


def checkpoint_audit(rows, report, total):
    """Leave useful evidence even if the CI runner stops a long network audit."""
    report.parent.mkdir(parents=True, exist_ok=True)
    counts = dict(Counter(row['status'] for row in rows))
    report.write_text(json.dumps({'checked_at': datetime.now(timezone.utc).isoformat(),
                                 'mode': 'remote', 'complete': False, 'checked': len(rows),
                                 'pending': total - len(rows), 'summary': counts, 'items': rows},
                                ensure_ascii=False, indent=2) + '\n')
    report.with_suffix('.md').write_text(
        f"# Library link audit — incomplete\n\n{len(rows)}/{total} probes completed. "
        "If the job was interrupted, pending endpoints have not been verified. "
        "Re-run the audit. See the JSON artifact for completed results.\n")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=ROOT)
    parser.add_argument('--remote', action='store_true')
    parser.add_argument('--strict-archives', action='store_true', help='Require every optional preservation copy')
    parser.add_argument('--require-pdf-parser', action='store_true')
    parser.add_argument('--report', type=Path, default=Path('reports/library-checks.json'))
    parser.add_argument('--workers', type=int, default=4)
    parser.add_argument('--timeout', type=int, default=15)
    args = parser.parse_args()
    if args.remote:
        try:
            tasks = remote_targets(args.root)
        except (OSError, ValueError, KeyError, TypeError) as error:
            return write_report([dict(status='failed', kind='data', id='audit-input',
                                      message='Cannot build endpoint list: ' + str(error))], args.report, True)
        checkpoint_audit([], args.report, len(tasks))
        with ThreadPoolExecutor(max_workers=max(1, min(args.workers, 8))) as pool:
            futures = [pool.submit(probe, task, max(3, min(args.timeout, 30))) for task in tasks]
            rows = []
            for future in as_completed(futures):
                row = future.result()
                rows.append(row)
                if len(rows) % 20 == 0:
                    checkpoint_audit(rows, args.report, len(tasks))
                print(f"{len(rows)}/{len(tasks)} {row['status']}: {', '.join(row['ids'])}", flush=True)
        rows.sort(key=lambda row: (row['kind'], row['url']))
    else:
        try:
            rows = validate(args.root, args.require_pdf_parser, args.strict_archives)
        except (OSError, ValueError, KeyError, TypeError) as error:
            rows = [dict(status='failed', kind='data', id='publication-input',
                         message='Cannot complete validation: ' + str(error))]
    return write_report(rows, args.report, args.remote)


if __name__ == '__main__':
    raise SystemExit(main())
