#!/usr/bin/env python3
"""Validate structured recordings and build their browser data bundle.

Edit data/recordings.json, then run this script.  CI can use --check to
verify the JSON and ensure assets/recording-data.js is up to date.
This checks structure and relationships; remote availability is audited
separately so an intermittent media-provider outage cannot alter the data.
"""

import argparse
import json
import re
import sys
from pathlib import Path
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parents[1]
LOCALES = ("en", "kmr", "ckb", "diq", "hac", "sdh")
ID_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
VIDEO_ID = re.compile(r"^[A-Za-z0-9_-]{11}$")


def load_and_validate(root=ROOT):
    """Return valid media data, or raise ValueError listing invalid fields."""
    root = Path(root)
    data = json.loads((root / "data/recordings.json").read_text(encoding="utf-8"))
    errors = []

    def require(condition, message):
        if not condition:
            errors.append(message)

    def text(value):
        return isinstance(value, str) and bool(value.strip())

    def translated(value, label):
        require(isinstance(value, dict), f"{label}: expected translated text")
        if isinstance(value, dict):
            for locale in LOCALES:
                require(text(value.get(locale)), f"{label}: missing {locale}")

    def string_list(value, label):
        valid = isinstance(value, list) and all(text(item) for item in value)
        require(valid, f"{label}: expected an array of nonempty strings")
        if valid:
            require(len(value) == len(set(value)), f"{label}: duplicate values")
        return value if valid else []

    def url(value, label):
        if not isinstance(value, str):
            require(False, f"{label}: expected an HTTPS URL")
            return
        parsed = urlparse(value)
        require(parsed.scheme == "https" and bool(parsed.netloc)
                and not parsed.username and not parsed.password,
                f"{label}: expected an HTTPS URL without credentials")

    def local_file(value, label):
        require(text(value), f"{label}: expected a local file path")
        if text(value):
            path = (root / value).resolve()
            require(path.is_relative_to(root.resolve()) and path.is_file(),
                    f"{label}: missing or invalid local file {value}")

    def sources(value, label):
        require(isinstance(value, list) and bool(value), f"{label}: expected credited sources")
        for index, entry in enumerate(value if isinstance(value, list) else []):
            if not isinstance(entry, dict):
                require(False, f"{label}[{index}]: expected a source object")
                continue
            require(text(entry.get("title")), f"{label}[{index}]: missing title")
            url(entry.get("url"), f"{label}[{index}].url")

    require(isinstance(data, dict), "recordings.json: expected an object")
    if not isinstance(data, dict):
        raise ValueError("\n".join(errors))
    performers = data.get("performers")
    recordings = data.get("recordings")
    require(isinstance(performers, list), "performers: expected an array")
    require(isinstance(recordings, list), "recordings: expected an array")
    if not isinstance(performers, list) or not isinstance(recordings, list):
        raise ValueError("\n".join(errors))

    def entries(rows, label):
        ids = set()
        for index, row in enumerate(rows):
            context = f"{label}[{index}]"
            if not isinstance(row, dict):
                require(False, f"{context}: expected an object")
                continue
            record_id = row.get("id")
            if not isinstance(record_id, str) or not ID_PATTERN.fullmatch(record_id):
                require(False, f"{context}: invalid id")
                continue
            require(record_id not in ids, f"{label}: duplicate id {record_id}")
            ids.add(record_id)
            yield record_id, row

    performer_ids = set()
    for performer_id, performer in entries(performers, "performers"):
        performer_ids.add(performer_id)
        require(text(performer.get("name")), f"{performer_id}: missing name")
        string_list(performer.get("aliases"), f"{performer_id}.aliases")
        translated(performer.get("intro"), f"{performer_id}.intro")
        sources(performer.get("sources"), f"{performer_id}.sources")
        if "portrait" in performer:
            portrait = performer["portrait"]
            require(isinstance(portrait, dict), f"{performer_id}.portrait: expected an object")
            if isinstance(portrait, dict):
                local_file(portrait.get("src"), f"{performer_id}.portrait.src")
                translated(portrait.get("alt"), f"{performer_id}.portrait.alt")
                require(portrait.get("type") in ("symbolic-illustration", "video-still", "photograph"),
                        f"{performer_id}.portrait: invalid type")
                require(text(portrait.get("credit")), f"{performer_id}.portrait: missing credit")
                require(text(portrait.get("license")), f"{performer_id}.portrait: missing license")
                url(portrait.get("licenseUrl"), f"{performer_id}.portrait.licenseUrl")
                if portrait.get("type") == "symbolic-illustration":
                    local_file(portrait.get("source"), f"{performer_id}.portrait.source")
                else:
                    url(portrait.get("source"), f"{performer_id}.portrait.source")
                if "creditI18n" in portrait:
                    translated(portrait["creditI18n"], f"{performer_id}.portrait.creditI18n")

    core = json.loads((root / "data/catalogue-full.json").read_text(encoding="utf-8"))
    stories = json.loads((root / "data/story-shelf.json").read_text(encoding="utf-8"))
    book_slugs = {book["slug"] for book in core["records"] + stories}
    for recording_id, recording in entries(recordings, "recordings"):
        require(text(recording.get("title")), f"{recording_id}: missing title")
        require(text(recording.get("credit")), f"{recording_id}: missing source credit")
        translated(recording.get("description"), f"{recording_id}.description")
        if "titleTranslations" in recording:
            translated(recording["titleTranslations"], f"{recording_id}.titleTranslations")
        string_list(recording.get("aliases"), f"{recording_id}.aliases")
        for performer_id in string_list(recording.get("performerIds"),
                                        f"{recording_id}.performerIds"):
            require(performer_id in performer_ids,
                    f"{recording_id}: unknown performer {performer_id}")
        for slug in string_list(recording.get("relatedBooks"), f"{recording_id}.relatedBooks"):
            require(slug in book_slugs, f"{recording_id}: unknown book {slug}")
        if recording.get("relatedBooks"):
            translated(recording.get("connection"), f"{recording_id}.connection")
        if "connectionSources" in recording:
            sources(recording["connectionSources"], f"{recording_id}.connectionSources")
        kind = recording.get("kind")
        require(kind in ("dengbej", "spoken", "archive"), f"{recording_id}: invalid kind")
        require(recording.get("collection") in ("dengbej", "spoken"),
                f"{recording_id}: invalid collection")
        url(recording.get("sourceUrl"), f"{recording_id}.sourceUrl")
        for key in ("embedUrl", "videoUrl", "thumbnailUrl", "creditUrl", "licenseUrl"):
            if key in recording:
                url(recording[key], f"{recording_id}.{key}")
        if kind == "dengbej":
            require(bool(recording.get("performerIds")), f"{recording_id}: missing performer")
            embedded = urlparse(recording.get("embedUrl", ""))
            video_id = embedded.path.removeprefix("/embed/")
            require(embedded.hostname == "www.youtube-nocookie.com"
                    and embedded.path.startswith("/embed/") and VIDEO_ID.fullmatch(video_id),
                    f"{recording_id}: invalid YouTube embed URL")
            source = urlparse(recording.get("sourceUrl", ""))
            require(source.hostname in ("youtube.com", "www.youtube.com")
                    and parse_qs(source.query).get("v") == [video_id],
                    f"{recording_id}: source and embed refer to different videos")
        elif kind == "spoken":
            require(bool(recording.get("videoUrl")), f"{recording_id}: missing video URL")
            require(bool(recording.get("performerIds")), f"{recording_id}: missing speaker")
            require(text(recording.get("license")), f"{recording_id}: missing license")
            require(bool(recording.get("licenseUrl")), f"{recording_id}: missing license URL")
            poster = recording.get("poster", "")
            require(isinstance(poster, str) and bool(poster), f"{recording_id}: missing poster")
            if isinstance(poster, str) and poster:
                path = (root / poster).resolve()
                require(path.is_relative_to(root.resolve()) and path.is_file(),
                        f"{recording_id}: missing or invalid local poster {poster}")
    if errors:
        raise ValueError("\n".join(errors))
    return data


def bundle(data):
    return ("// Generated from data/recordings.json by tools/rebuild_recording_data.py.\n"
            "window.KDL_MEDIA = " + json.dumps(data, ensure_ascii=False, separators=(",", ":"))
            + ";\n")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="validate without changing files")
    args = parser.parse_args()
    try:
        data = load_and_validate()
        expected = bundle(data)
        destination = ROOT / "assets/recording-data.js"
        if args.check:
            if not destination.is_file() or destination.read_text(encoding="utf-8") != expected:
                raise ValueError("assets/recording-data.js is out of date; run tools/rebuild_recording_data.py")
        else:
            destination.write_text(expected, encoding="utf-8")
        print(f"Validated {len(data['performers'])} performers and {len(data['recordings'])} recordings.")
    except (ValueError, KeyError, OSError) as error:
        print(error, file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
