#!/usr/bin/env bash
set -euo pipefail

PKG="com.foad.ghazaldeutsch"
ACTIVITY="$PKG/.MainActivity"
APK="app/build/outputs/apk/debug/app-debug.apk"
OUT="qa/emulator"
mkdir -p "$OUT"

adb wait-for-device
adb shell settings put global window_animation_scale 0 || true
adb shell settings put global transition_animation_scale 0 || true
adb shell settings put global animator_duration_scale 0 || true
adb install -r "$APK" | tee "$OUT/install.txt"

cat > "$OUT/ghazal_security.xml" <<'XML'
<?xml version='1.0' encoding='utf-8' standalone='yes' ?>
<map>
    <boolean name="app_lock" value="false" />
    <boolean name="privacy_screen" value="false" />
</map>
XML
adb shell "run-as $PKG mkdir -p shared_prefs"
adb shell "run-as $PKG sh -c 'cat > shared_prefs/ghazal_security.xml'" < "$OUT/ghazal_security.xml"

function fail_on_crash() {
  if adb logcat -d -v brief | grep -F "Process: $PKG" -B 3 -A 20 | grep -q "FATAL EXCEPTION"; then
    adb logcat -d -v threadtime > "$OUT/logcat-crash.txt"
    echo "GHAZAL crashed; see $OUT/logcat-crash.txt"
    exit 1
  fi
}

function assert_running() {
  local pid
  pid="$(adb shell pidof "$PKG" | tr -d '\r')"
  test -n "$pid" || { adb logcat -d > "$OUT/logcat-no-process.txt"; echo "GHAZAL process is not running"; exit 1; }
  echo "$pid"
}

function dump_ui() {
  local name="$1"
  adb shell uiautomator dump "/sdcard/${name}.xml" >/dev/null
  adb pull "/sdcard/${name}.xml" "$OUT/${name}.xml" >/dev/null
  grep -Eq 'android.webkit.WebView|GHAZAL|غزل' "$OUT/${name}.xml" || {
    echo "Expected WebView/GHAZAL UI was not found in ${name}.xml"
    cat "$OUT/${name}.xml"
    exit 1
  }
}

adb logcat -c
adb shell am force-stop "$PKG"
adb shell am start -W -n "$ACTIVITY" | tee "$OUT/launch-online.txt"
sleep 5
assert_running > "$OUT/pid-online.txt"
dump_ui "ui-online"
fail_on_crash

adb shell input keyevent KEYCODE_HOME
sleep 2
adb shell am start -W -n "$ACTIVITY" | tee "$OUT/relaunch.txt"
sleep 3
assert_running > "$OUT/pid-relaunch.txt"
dump_ui "ui-relaunch"
fail_on_crash

adb shell svc wifi disable || true
adb shell svc data disable || true
adb shell am force-stop "$PKG"
adb logcat -c
adb shell am start -W -n "$ACTIVITY" | tee "$OUT/launch-offline.txt"
sleep 5
assert_running > "$OUT/pid-offline.txt"
dump_ui "ui-offline"
fail_on_crash

adb shell settings put system accelerometer_rotation 0 || true
adb shell settings put system user_rotation 1 || true
sleep 3
assert_running > "$OUT/pid-landscape.txt"
dump_ui "ui-landscape"
fail_on_crash

adb shell settings put system user_rotation 0 || true

cat > "$OUT/summary.json" <<JSON
{
  "package": "$PKG",
  "install": "PASS",
  "onlineLaunch": "PASS",
  "relaunch": "PASS",
  "offlineLaunch": "PASS",
  "landscapeSurvival": "PASS",
  "fatalCrash": "NONE"
}
JSON
cat "$OUT/summary.json"
