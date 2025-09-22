#!/usr/bin/env bash
# Usage: export FIREBASE_SERVICE_ACCOUNT='{"..."}' and run this script
# This writes the FIREBASE_SERVICE_ACCOUNT env var to a temporary file and
# sets GOOGLE_APPLICATION_CREDENTIALS so SDKs can use it.

set -euo pipefail
OUT="$PWD/serviceAccountKey.json"

if [ -z "${FIREBASE_SERVICE_ACCOUNT:-}" ]; then
  echo "FIREBASE_SERVICE_ACCOUNT not set; nothing to restore"
  exit 0
fi

echo "$FIREBASE_SERVICE_ACCOUNT" > "$OUT"
export GOOGLE_APPLICATION_CREDENTIALS="$OUT"
echo "Wrote service account to $OUT"

# Print path so callers can use it
printf "%s" "$OUT"
