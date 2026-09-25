#!/usr/bin/env bash
# Run from any directory. These checks do not download external books.
set -euo pipefail
cd "$(dirname "$0")/.."
for script in assets/*.js; do
  node --check "$script"
done
npm test
python3 -m unittest discover -s tests -p 'test_*.py'
python3 tools/rebuild_recording_data.py --check
python3 tools/rebuild_pdf_index.py --check
python3 tools/check_library.py --require-pdf-parser --report reports/prepublish.json
