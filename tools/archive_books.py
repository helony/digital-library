#!/usr/bin/env python3
"""Create local preservation copies for KDL records marked public domain.

Run from the project root:
    python3 tools/archive_books.py

Existing preservation copies are kept unchanged by default. To intentionally refresh them from current sources, use:
    python3 tools/archive_books.py --refresh

The script uses only Python's standard library. It downloads public-domain PDFs and
snapshots public-domain Wikisource transcriptions into books/<slug>/. It never
archives records marked regional, check, or licensed in archive-manifest.json.
"""
from __future__ import annotations
import hashlib, html, json, sys, time
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlencode, urljoin, urlsplit
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "archive-manifest.json"
BOOKS_DIR = ROOT / "books"
UA = "KurdishDigitalLibraryPreservation/1.0 (+static archival copy)"
TIMEOUT = 45

SAFE_TAGS = set('article blockquote br center code dd div dl dt em h1 h2 h3 h4 h5 h6 hr i li ol p pre rb rp rt ruby section small span strong sub sup table tbody td tfoot th thead tr u ul a'.split())
VOID_TAGS = {'br', 'hr'}
DROP_TAGS = {'script', 'style', 'iframe', 'object', 'embed', 'form', 'svg', 'math', 'template', 'audio', 'video'}
DROP_CLASSES = {'mw-editsection', 'navbox', 'metadata', 'noprint', 'catlinks', 'printfooter', 'sistersitebox', 'ws-noexport'}


def fetch(url: str) -> bytes:
    req = Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    with urlopen(req, timeout=TIMEOUT) as r:
        return r.read()


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


class SafeWikiHTML(HTMLParser):
    """Keep readable text markup without executable content or unsafe links."""
    def __init__(self, source: str):
        super().__init__(convert_charrefs=True)
        self.source = source
        self.parts: list[str] = []
        self.open_tags: list[str] = []
        self.blocked_tag: str | None = None
        self.blocked_depth = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if self.blocked_tag:
            if tag == self.blocked_tag:
                self.blocked_depth += 1
            return
        values = dict(attrs)
        if tag in DROP_TAGS or DROP_CLASSES.intersection((values.get('class') or '').split()):
            self.blocked_tag = tag
            self.blocked_depth = 1
            return
        if tag not in SAFE_TAGS:
            return
        kept = []
        for key in ('id', 'class', 'lang', 'dir', 'title', 'colspan', 'rowspan'):
            value = values.get(key)
            if value is not None and (key != 'dir' or value in ('ltr', 'rtl', 'auto')):
                kept.append(f' {key}="{html.escape(value, quote=True)}"')
        if tag == 'a':
            raw = values.get('href') or ''
            url = urljoin(self.source, raw) if raw else ''
            if urlsplit(url).scheme in ('http', 'https') and urlsplit(url).hostname:
                kept.append(f' href="{html.escape(url, quote=True)}" target="_blank" rel="noopener noreferrer"')
        self.parts.append(f'<{tag}{"".join(kept)}>')
        if tag not in VOID_TAGS:
            self.open_tags.append(tag)

    def handle_endtag(self, tag: str) -> None:
        if self.blocked_tag:
            if tag == self.blocked_tag:
                self.blocked_depth -= 1
                if not self.blocked_depth:
                    self.blocked_tag = None
            return
        if tag in self.open_tags:
            while self.open_tags:
                open_tag = self.open_tags.pop()
                self.parts.append(f'</{open_tag}>')
                if open_tag == tag:
                    break

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.handle_starttag(tag, attrs)
        if tag in SAFE_TAGS and tag not in VOID_TAGS:
            self.handle_endtag(tag)
        elif self.blocked_tag == tag:
            self.blocked_tag = None
            self.blocked_depth = 0

    def handle_data(self, data: str) -> None:
        if not self.blocked_tag:
            self.parts.append(html.escape(data))


def clean_fragment(fragment: str, source: str) -> str:
    parser = SafeWikiHTML(source)
    parser.feed(fragment)
    parser.close()
    while parser.open_tags:
        parser.parts.append(f'</{parser.open_tags.pop()}>')
    return ''.join(parser.parts).strip()


def archive_pdf(item: dict, folder: Path) -> dict:
    data = fetch(item["remote_url"])
    if not data.startswith(b"%PDF"):
        raise RuntimeError("download did not look like a PDF")
    dest = folder / "book.pdf"
    dest.write_bytes(data)
    return {"path": str(dest.relative_to(ROOT)), "bytes": len(data), "sha256": sha256(data)}


def archive_wiki(item: dict, folder: Path) -> dict:
    title = item.get("wiki_title")
    if not title:
        raise RuntimeError("missing wiki_title")
    params = urlencode({
        "action": "parse", "page": title,
        "prop": "text|sections|displaytitle|revid",
        "format": "json", "origin": "*"
    })
    api = "https://wikisource.org/w/api.php?" + params
    payload = json.loads(fetch(api).decode("utf-8"))
    if "error" in payload:
        raise RuntimeError(payload["error"].get("info", "Wikisource API error"))
    parsed = payload["parse"]
    fragment = clean_fragment(parsed["text"]["*"], item["source"])
    attribution = (
        '<footer class="archive-attribution">'
        'Preservation snapshot from <a href="%s" target="_blank" rel="noopener">Wikisource</a>. '
        'Underlying historical work: public domain. Wikisource contributions: '
        '<a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a>. '
        'Reader formatting simplified by Kurdish Digital Library. Archived on %s. Revision %s.'
        '</footer>'
    ) % (html.escape(item["source"], quote=True), time.strftime("%Y-%m-%d"), parsed.get("revid", "unknown"))
    data = (fragment + attribution).encode("utf-8")
    dest = folder / "content.html"
    dest.write_bytes(data)
    return {
        "path": str(dest.relative_to(ROOT)), "bytes": len(data), "sha256": sha256(data),
        "revision": parsed.get("revid"), "sections": parsed.get("sections", [])
    }


def main() -> int:
    refresh = "--refresh" in sys.argv[1:]
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    BOOKS_DIR.mkdir(exist_ok=True)
    report = {"created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "items": []}
    formats = {'wiki', 'pdf'}
    for arg in sys.argv[1:]:
        if arg.startswith('--format='):
            formats = {arg.partition('=')[2]}
    if not formats <= {'wiki', 'pdf'}:
        raise SystemExit('Use --format=wiki or --format=pdf')
    eligible = [x for x in manifest["items"] if x.get("eligible") and x["format"] in formats]
    print(f"Archiving {len(eligible)} public-domain records. Non-public-domain records are skipped.\n")
    for i, item in enumerate(eligible, 1):
        folder = BOOKS_DIR / item["slug"]
        folder.mkdir(parents=True, exist_ok=True)
        target = folder / ("book.pdf" if item["format"] == "pdf" else "content.html")
        meta_path = folder / "metadata.json"
        print(f"[{i}/{len(eligible)}] {item['title']} ...", flush=True)
        if target.exists() and meta_path.exists() and not refresh:
            existing = json.loads(meta_path.read_text(encoding="utf-8"))
            report["items"].append({"slug": item["slug"], "ok": True, "preserved": True, "path": str(target.relative_to(ROOT)), "sha256": existing.get("sha256")})
            print("  already preserved; kept existing snapshot (use --refresh to update)")
            continue
        try:
            result = archive_pdf(item, folder) if item["format"] == "pdf" else archive_wiki(item, folder)
            meta = {
                "kdl_id": item.get("kdl_id"), "slug": item["slug"], "title": item["title"], "author": item["author"],
                "source": item["source"], "remote_url": item["remote_url"],
                "rights_type": item["rights_type"], "rights_key": item["rights_key"],
                "source_checked": item["checked"], "archived_at": report["created_at"], **result
            }
            (folder / "metadata.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
            report["items"].append({"slug": item["slug"], "ok": True, **result})
            print(f"  saved {result['bytes']:,} bytes")
        except (HTTPError, URLError, TimeoutError, RuntimeError, ValueError, OSError) as e:
            report["items"].append({"slug": item["slug"], "ok": False, "error": str(e)})
            print(f"  SKIPPED/FAILED: {e}")
    (BOOKS_DIR / "archive-index.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    ok = sum(1 for x in report["items"] if x["ok"])
    print(f"\nFinished: {ok}/{len(eligible)} archived. See books/archive-index.json for details.")
    return 0 if ok else 1

if __name__ == "__main__":
    raise SystemExit(main())
