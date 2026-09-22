#!/bin/bash
cd "$(dirname "$0")"
python3 tools/make_backup.py
printf "\nPress Return to close…"
read
