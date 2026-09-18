#!/usr/bin/env bash
set -euo pipefail
OUT="qa/browser"
mkdir -p "$OUT"
CHROME=""
for c in "${CHROME_BIN:-}" /usr/bin/google-chrome /usr/bin/google-chrome-stable /usr/bin/chromium /usr/bin/chromium-browser; do
  if [ -n "$c" ] && [ -x "$c" ]; then CHROME="$c"; break; fi
done
test -n "$CHROME" || { echo "Chrome/Chromium not found"; exit 1; }
python3 -m http.server 8765 --bind 127.0.0.1 --directory . >"$OUT/http.log" 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" >/dev/null 2>&1 || true' EXIT
sleep 1
"$CHROME" --headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage --virtual-time-budget=15000 --dump-dom "http://127.0.0.1:8765/scripts/browser-ui-smoke.html" > "$OUT/browser-ui-smoke-dom.html" 2> "$OUT/chrome.log"
grep -q "GHZ_BROWSER_SMOKE_PASS" "$OUT/browser-ui-smoke-dom.html" || {
  echo "Browser interaction smoke failed"
  grep -o "GHZ_BROWSER_SMOKE_[A-Z]*[^<]*" "$OUT/browser-ui-smoke-dom.html" || true
  tail -n 120 "$OUT/chrome.log" || true
  exit 1
}
grep -o "GHZ_BROWSER_SMOKE_PASS[^<]*" "$OUT/browser-ui-smoke-dom.html" | head -n1 > "$OUT/browser-ui-smoke.txt"
cat "$OUT/browser-ui-smoke.txt"
