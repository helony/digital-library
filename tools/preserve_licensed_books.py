#!/usr/bin/env python3
"""Preserve the two reviewed CC BY-NC publisher PDFs used by the reader.

Keep original publisher files and notices unchanged. The explicit source hashes
prevent a substituted file from silently replacing a reviewed edition.
"""
import hashlib
import json
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]


def main():
    copies = json.loads((ROOT / 'data/licensed-reader-copies.json').read_text())
    for item in copies:
        target = ROOT / item['path']
        if target.is_file() and hashlib.sha256(target.read_bytes()).hexdigest() == item['sha256']:
            print(f"Already preserved: {item['slug']}")
            continue
        with urlopen(Request(item['url'], headers={'User-Agent': 'KurdishDigitalLibrary/1.0'}), timeout=60) as response:
            data = response.read(item['bytes'] + 1)
        if not data.startswith(b'%PDF') or len(data) != item['bytes'] or hashlib.sha256(data).hexdigest() != item['sha256']:
            raise ValueError(f"Source did not match the reviewed PDF: {item['slug']}")
        target.parent.mkdir(parents=True, exist_ok=True)
        temp = target.with_suffix('.pdf.tmp')
        temp.write_bytes(data)
        temp.replace(target)
        (target.parent / 'reader-source.json').write_text(json.dumps(item, ensure_ascii=False, indent=2) + '\n')
        print(f"Preserved {item['slug']}: {len(data):,} bytes")


if __name__ == '__main__':
    main()
