#!/bin/bash
# Set up the adjacent Temple linter projects when they are checked out here.

set -euo pipefail

workspace_root="$(cd "$(dirname "$0")/.." && pwd)"
for project in temple-linter vscode-temple-linter; do
  if [[ ! -d "$workspace_root/$project" ]]; then
    echo "Missing $workspace_root/$project; clone the Temple projects first." >&2
    exit 1
  fi
done

cd "$workspace_root/temple-linter"
if [[ ! -f .venv/bin/activate ]]; then
  echo "Missing temple-linter/.venv; create it before running this script." >&2
  exit 1
fi
source .venv/bin/activate
pip install -r requirements.txt

cd "$workspace_root/vscode-temple-linter"
npm install
