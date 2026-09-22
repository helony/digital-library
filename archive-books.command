#!/bin/bash
cd "$(dirname "$0")"
python3 tools/archive_books.py
printf '\nPress Return to close...'
read
