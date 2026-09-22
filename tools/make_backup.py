#!/usr/bin/env python3
from __future__ import annotations
import time, zipfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT.parent/f"KDL-backup-{time.strftime('%Y-%m-%d')}.zip"
skip={".DS_Store"}
with zipfile.ZipFile(OUT,"w",compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
    for p in ROOT.rglob("*"):
        if not p.is_file() or p.name in skip or p.suffix==".zip":
            continue
        z.write(p,p.relative_to(ROOT.parent))
print(f"Created {OUT}")
