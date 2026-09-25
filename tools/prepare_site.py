#!/usr/bin/env python3
"""Stage the checked static website without development files or dependencies."""
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]
DESTINATION = ROOT / '_site'
EXCLUDED = {'.git', '.github', '.venv', '_site', 'node_modules', 'reports',
            'tests', 'tools', '__pycache__', '.pytest_cache'}


def main():
    if DESTINATION.exists():
        shutil.rmtree(DESTINATION)
    shutil.copytree(ROOT, DESTINATION,
                    ignore=lambda _directory, names: [name for name in names if name in EXCLUDED])
    print('Checked static website staged in _site/')


if __name__ == '__main__':
    main()
