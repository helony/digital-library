"""Block accidental unlicensed mirroring and changed/invalid local audio."""
import json
from pathlib import Path
import shutil
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))
from rebuild_recording_data import load_and_validate


class AudioStoryChecks(unittest.TestCase):
    def setUp(self):
        self.folder = tempfile.TemporaryDirectory()
        self.addCleanup(self.folder.cleanup)
        self.root = Path(self.folder.name)
        (self.root / 'data').mkdir()
        source = json.loads((ROOT / 'data/recordings.json').read_text())
        self.record = next(row for row in source['recordings'] if row['kind'] == 'audio-story')
        self.data = {'performers': [], 'recordings': [self.record]}
        (self.root / 'data/catalogue-full.json').write_text('{"records":[]}')
        (self.root / 'data/story-shelf.json').write_text('[]')
        shutil.copy2(ROOT / 'data/audio-story-sources.json', self.root / 'data/audio-story-sources.json')
        target = self.root / self.record['audioUrl']
        target.parent.mkdir(parents=True)
        shutil.copy2(ROOT / self.record['audioUrl'], target)
        self.write()

    def write(self):
        (self.root / 'data/recordings.json').write_text(json.dumps(self.data))

    def test_valid_audio_then_corrupted_file(self):
        load_and_validate(self.root)
        (self.root / self.record['audioUrl']).write_bytes(b'<html>Not an audio recording</html>')
        with self.assertRaisesRegex(ValueError, 'invalid MP3 contents'):
            load_and_validate(self.root)

    def test_missing_license_or_source_only_audio_is_rejected(self):
        del self.record['license']
        self.write()
        with self.assertRaisesRegex(ValueError, 'missing audio reuse license'):
            load_and_validate(self.root)
        self.record['kind'] = 'archive'
        self.record['access'] = 'source-link'
        self.write()
        with self.assertRaisesRegex(ValueError, 'source-only stories must link'):
            load_and_validate(self.root)


if __name__ == '__main__':
    unittest.main()
