#!/usr/bin/env python3
from __future__ import annotations
import hashlib, json, sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
MANIFEST=json.loads((ROOT/"archive-manifest.json").read_text(encoding="utf-8"))
ok=missing=bad=review=0
rows=[]

def digest(path: Path)->str:
    h=hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda:f.read(1024*1024),b""):
            h.update(chunk)
    return h.hexdigest()

for item in MANIFEST["items"]:
    rel=item.get("local_path")
    if not item.get("eligible"):
        review+=1
        rows.append({"kdl_id":item.get("kdl_id"),"slug":item["slug"],"status":"manual_review"})
        continue
    path=ROOT/rel
    if not path.exists():
        missing+=1
        rows.append({"kdl_id":item.get("kdl_id"),"slug":item["slug"],"status":"missing","path":rel})
        continue
    meta=path.parent/"metadata.json"
    expected=None
    if meta.exists():
        try: expected=json.loads(meta.read_text(encoding="utf-8")).get("sha256")
        except Exception: pass
    actual=digest(path)
    if expected and actual != expected:
        bad+=1
        rows.append({"kdl_id":item.get("kdl_id"),"slug":item["slug"],"status":"checksum_mismatch","path":rel,"expected":expected,"actual":actual})
    else:
        ok+=1
        rows.append({"kdl_id":item.get("kdl_id"),"slug":item["slug"],"status":"ok","path":rel,"sha256":actual})

report={"ok":ok,"missing":missing,"checksum_mismatch":bad,"manual_review":review,"items":rows}
(ROOT/"library-audit.json").write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
print(f"Verified local archive: {ok} OK, {missing} missing, {bad} checksum mismatch, {review} manual review.")
print("Report: library-audit.json")
sys.exit(1 if bad else 0)
