#!/bin/bash
# Pull new channel posts, rebuild the site and publish it if anything changed.
cd "$(dirname "$0")/.." || exit 1
PY=/opt/homebrew/bin/python3
echo "--- $(date '+%F %H:%M')"
"$PY" tools/sync.py && "$PY" tools/build.py || exit 1
git add -A
if git diff --cached --quiet -- . ':(exclude)data/meta.json' ':(exclude)index.html' ':(exclude)lotin/index.html'; then
  git reset -q
  git checkout -q -- data/meta.json index.html lotin/index.html 2>/dev/null
  echo "no new posts"
  exit 0
fi
git commit -q -m "Update site: $(date '+%F %H:%M')" && git push -q origin main && echo "published"
