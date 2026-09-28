#!/usr/bin/env python3
"""Import selected CC BY 4.0 Hewramî field recordings from Zenodo.

Requires ffmpeg/ffprobe. Fetches only the selected ZIP members using byte
ranges, checks their ZIP CRCs, and converts complete WAVs to mono MP3s.
Run explicitly when updating these assets; CI validates the checked-in files.
"""
import hashlib
import io
import json
import struct
import subprocess
import tempfile
import urllib.request
import zipfile
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RECORD = "https://zenodo.org/api/records/15419952"
SELECTION = {
    "hewrami-child-goat": "text 1. zaroɫe û bizê/ZB-001-speaker4.wav",
    "hewrami-child-tree": "text 2. zaroɫe û qiřolû darî/ZQ-001-speaker5.wav",
    "hewrami-grasshoppers": "text 4. peɫê merekuř/PM-001-speaker5.wav",
}


def get(url, start=None, end=None):
    headers = {"User-Agent": "KurdishDigitalLibrary/1.0"}
    if start is not None:
        headers["Range"] = f"bytes={start}-{end}"
    with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=120) as response:
        if start is not None:
            expected = f"bytes {start}-{end}/"
            if response.status != 206 or not response.headers.get("Content-Range", "").startswith(expected):
                raise RuntimeError("Source did not honor the requested byte range")
        result = response.read()
    if start is not None and len(result) != end - start + 1:
        raise RuntimeError("Incomplete byte range")
    return result


def main():
    metadata = json.loads(get(RECORD))
    if metadata["metadata"]["license"]["id"] != "cc-by-4.0":
        raise RuntimeError("Review source licensing before importing")
    archive = next(item for item in metadata["files"] if item["key"] == "Corpus of Hewramî recordings.zip")
    url, size = archive["links"]["self"], archive["size"]
    base = size - 131072
    directory = zipfile.ZipFile(io.BytesIO(get(url, base, size - 1)))
    output = ROOT / "assets/audio"
    output.mkdir(parents=True, exist_ok=True)
    imported = []
    with tempfile.TemporaryDirectory() as temporary:
        for identifier, suffix in SELECTION.items():
            member = directory.getinfo("Corpus of Hewramî recordings/" + suffix)
            offset = base + member.header_offset
            header = get(url, offset, offset + 29)
            if header[:4] != b"PK\x03\x04" or member.compress_type != zipfile.ZIP_DEFLATED:
                raise RuntimeError("Unexpected ZIP member format")
            name_length, extra_length = struct.unpack_from("<HH", header, 26)
            start = offset + 30 + name_length + extra_length
            print(f"Fetching {identifier}…", flush=True)
            wav = zlib.decompress(get(url, start, start + member.compress_size - 1), -15)
            if len(wav) != member.file_size or zlib.crc32(wav) != member.CRC:
                raise RuntimeError("ZIP checksum mismatch")
            source = Path(temporary) / "source.wav"
            source.write_bytes(wav)
            target = output / f"{identifier}.mp3"
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(source),
                            "-map_metadata", "-1", "-ac", "1", "-ar", "32000",
                            "-codec:a", "libmp3lame", "-b:a", "64k", str(target)], check=True)
            duration = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries",
                "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", str(target)], text=True))
            imported.append({"id": identifier, "archiveMember": member.filename,
                "sourceSha256": hashlib.sha256(wav).hexdigest(),
                "audioUrl": target.relative_to(ROOT).as_posix(),
                "audioSha256": hashlib.sha256(target.read_bytes()).hexdigest(),
                "durationSeconds": round(duration, 2), "bytes": target.stat().st_size})
            print(f"Saved {target.name}: {duration:.1f}s / {target.stat().st_size} bytes", flush=True)
    manifest = {"sourceUrl": "https://zenodo.org/records/15419952", "metadataUrl": RECORD,
        "archiveChecksum": archive["checksum"], "license": "CC BY 4.0",
        "licenseUrl": "https://creativecommons.org/licenses/by/4.0/", "checked": "2026-09-28",
        "credit": "Masoud Mohammadirad, University of Cambridge; fieldwork 2022",
        "changes": "Complete WAV recordings converted to mono 32 kHz, 64 kbps MP3; no cuts.",
        "recordings": imported}
    (ROOT / "data/audio-story-sources.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
    main()
