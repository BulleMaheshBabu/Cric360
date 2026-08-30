#!/usr/bin/env bash
# Render Static Site build: inject Firebase config from Environment Variables.
# Keys are NOT stored in source HTML — only written at deploy time into firebase-config.js
set -euo pipefail

# Accept several common env name styles (use whichever you set in Render)
API_KEY="${FIREBASE_API_KEY:-${apiKey:-${API_KEY:-}}}"
AUTH_DOMAIN="${FIREBASE_AUTH_DOMAIN:-${authDomain:-${AUTH_DOMAIN:-}}}"
PROJECT_ID="${FIREBASE_PROJECT_ID:-${projectId:-${PROJECT_ID:-}}}"
STORAGE_BUCKET="${FIREBASE_STORAGE_BUCKET:-${storageBucket:-${STORAGE_BUCKET:-}}}"
MESSAGING_SENDER_ID="${FIREBASE_MESSAGING_SENDER_ID:-${messagingSenderId:-${MESSAGING_SENDER_ID:-}}}"
APP_ID="${FIREBASE_APP_ID:-${appId:-${APP_ID:-}}}"
MEASUREMENT_ID="${FIREBASE_MEASUREMENT_ID:-${measurementId:-${MEASUREMENT_ID:-}}}"

missing=0
for pair in \
  "FIREBASE_API_KEY:$API_KEY" \
  "FIREBASE_AUTH_DOMAIN:$AUTH_DOMAIN" \
  "FIREBASE_PROJECT_ID:$PROJECT_ID" \
  "FIREBASE_STORAGE_BUCKET:$STORAGE_BUCKET" \
  "FIREBASE_MESSAGING_SENDER_ID:$MESSAGING_SENDER_ID" \
  "FIREBASE_APP_ID:$APP_ID"
do
  name="${pair%%:*}"
  val="${pair#*:}"
  if [ -z "$val" ]; then
    echo "Missing env: $name"
    missing=1
  fi
done

if [ "$missing" -ne 0 ]; then
  echo "ERROR: Set Firebase env vars in Render → Environment."
  echo "Required: FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_PROJECT_ID,"
  echo "          FIREBASE_STORAGE_BUCKET, FIREBASE_MESSAGING_SENDER_ID, FIREBASE_APP_ID"
  echo "Optional: FIREBASE_MEASUREMENT_ID"
  exit 1
fi

# Escape for JS string literals
js_escape() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

cat > firebase-config.js <<EOF
/* Generated at deploy — do not commit real secrets to git */
window.FIREBASE_CONFIG = {
  apiKey: "$(js_escape "$API_KEY")",
  authDomain: "$(js_escape "$AUTH_DOMAIN")",
  projectId: "$(js_escape "$PROJECT_ID")",
  storageBucket: "$(js_escape "$STORAGE_BUCKET")",
  messagingSenderId: "$(js_escape "$MESSAGING_SENDER_ID")",
  appId: "$(js_escape "$APP_ID")",
  measurementId: "$(js_escape "${MEASUREMENT_ID:-}")"
};
EOF

echo "Wrote firebase-config.js (keys from environment)"
ls -la firebase-config.js
# Static site: no other build steps
exit 0
