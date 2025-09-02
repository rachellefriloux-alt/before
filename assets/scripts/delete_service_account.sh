#!/usr/bin/env bash
# Delete local temporary serviceAccountKey.json created by restore_service_account.sh
set -euo pipefail
FILE="$PWD/serviceAccountKey.json"
if [ -f "$FILE" ]; then
  rm -f "$FILE"
  echo "Deleted $FILE"
else
  echo "No file to delete"
fi
