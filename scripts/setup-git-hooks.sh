#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOOK_SRC="${ROOT}/.githooks/prepare-commit-msg"
HOOK_DST="${ROOT}/.git/hooks/prepare-commit-msg"

cp "$HOOK_SRC" "$HOOK_DST"
chmod +x "$HOOK_DST"
echo "Installed prepare-commit-msg hook (Signed-off-by trailer)."
