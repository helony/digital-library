# Audio stories

The Listen shelf starts with human-narrated oral stories. These are field
recordings, not promises of verbatim audiobook editions for every catalogue item.

## Local recordings

Three complete Hewramî recordings from Masoud Mohammadirad's 2025 Zenodo corpus
are redistributed under **CC BY 4.0**. Zenodo's record metadata declares
`license.id: cc-by-4.0` and `access_right: open` (checked 2026-09-28).

- Dataset: https://zenodo.org/records/15419952
- Machine-readable rights evidence: https://zenodo.org/api/records/15419952
- Transcripts, English translations, narrator context: *Echoes of the past:
  Hewramî narratives*, https://langsci-press.org/catalog/book/531
- Book source introductions: https://github.com/langsci/531/tree/main/texts

Saleh narrates *zaroɫe û bizê*, recorded in Hewraman Tekht in August 2022.
Mohammad narrates *zaroɫe û qiřolû darî* and *peɫê merekuř*, recorded in Serûpîrî
in August 2022. Names and context follow the book's text A, B and D introductions.
Masoud Mohammadirad recorded, transcribed and translated these narratives.

`data/audio-story-sources.json` records the source archive, member paths, WAV
and MP3 SHA-256 hashes, exact durations and transformation. The MP3s preserve
the complete recordings, converted to mono 32 kHz / 64 kbps for speech.
The cards credit the narrators and researcher, link the source and license,
and identify the conversion. Short display titles/descriptions are editorial;
the original transcribed titles remain in the data and search index.

To re-import, install ffmpeg from its official distribution and run
`python3 tools/import_audio_stories.py`. This fetches only the three ZIP members
using HTTP byte ranges, verifies ZIP CRCs, and refuses an unexpected license.
Review the new manifest, synchronize recording hashes/durations, then run
`python3 tools/rebuild_recording_data.py`. Re-encoding with another ffmpeg
version can legitimately change MP3 hashes and requires review.

## External players

Three Cambridge Kurdish and Gorani Dialect Database recordings are **links
only**: Zembîlfiroş and Dindik Hinar in Kurmancî, and A ‘Pious’ Fox in Soranî.
Their public source players include transcripts and English translations.
No reuse permission is inferred from public availability or from the separate
license of the associated folklore books; their audio is neither copied nor
embedded. The records link to volume II already in the catalogue. Zembîlfiroş
also connects to the library's other tellings, without claiming identical text.

## Playback and checks

Audio loads only on demand. Native controls provide seeking and speed/volume
where supported; the large play/pause button is keyboard accessible. Selecting
another story pauses the first. Local recordings resume in the same browser,
and finishing or selecting Start over clears their saved position. Source-site
players manage their own controls and do not save progress in this library.

Interface labels cover all six UI locales. Like the existing media collection,
Hewramî and Southern Kurdish prose uses labelled Sorani fallback. Editorial
translations still need fluent-speaker review.

The prepublish gate validates rights metadata, local MP3 signatures, SHA-256,
manifest consistency and playable durations recorded during import. Regression
checks cover language selection, deep links, bookmarks, completion, exclusive
playback and failures. Existing weekly audits check external source pages.
