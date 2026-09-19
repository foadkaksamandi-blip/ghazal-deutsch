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
    <boolean name="privacy_user_selected" value="true" />
    <boolean name="touch_compat_v14_0_1" value="true" />
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
  pid="$(adb shell pidof "$PKG" 2>/dev/null | tr -d '\r' || true)"
  if [ -z "$pid" ]; then
    adb logcat -d -v threadtime > "$OUT/logcat-no-process.txt" || true
    echo "GHAZAL process is not running"
    tail -n 200 "$OUT/logcat-no-process.txt" || true
    exit 1
  fi
  echo "$pid"
}

function dump_ui() {
  local name="$1"
  local remote="/data/local/tmp/${name}.xml"
  adb shell uiautomator dump "$remote" >/dev/null
  adb shell cat "$remote" > "$OUT/${name}.xml"
  test -s "$OUT/${name}.xml" || { echo "UI hierarchy dump is empty"; exit 1; }
}

function require_text() {
  local file="$1"
  local needle="$2"
  grep -Fq "$needle" "$OUT/$file" || {
    echo "Expected UI text not found: $needle"
    cat "$OUT/$file"
    exit 1
  }
}

function tap_text() {
  local file="$1"
  local needle="$2"
  local xy
  xy="$(python - "$OUT/$file" "$needle" <<'PY'
import re,sys,xml.etree.ElementTree as ET
p,needle=sys.argv[1],sys.argv[2]
root=ET.parse(p).getroot()
for node in root.iter("node"):
    hay=" ".join([node.attrib.get("text",""),node.attrib.get("content-desc","")])
    if needle in hay:
        b=node.attrib.get("bounds","")
        m=re.match(r"\[(\d+),(\d+)\]\[(\d+),(\d+)\]",b)
        if m:
            x1,y1,x2,y2=map(int,m.groups())
            print((x1+x2)//2,(y1+y2)//2)
            sys.exit(0)
sys.exit(2)
PY
)" || {
    echo "Could not resolve tappable bounds for: $needle"
    cat "$OUT/$file"
    exit 1
  }
  adb shell input tap $xy
}

adb logcat -c
adb shell am force-stop "$PKG"
adb shell am start -n "$ACTIVITY" | tee "$OUT/launch-online.txt"
sleep 7
assert_running > "$OUT/pid-online.txt"
dump_ui "ui-online"
require_text "ui-online.xml" "شروع مستقیم از A1"
require_text "ui-online.xml" "شروع ارزیابی اولیه"
fail_on_crash

# This reproduces the user's exact complaint: the onboarding button must actually
# receive a touch and transition to the reminder/home state.
tap_text "ui-online.xml" "شروع مستقیم از A1"
sleep 3
dump_ui "ui-after-onboarding-tap"
if ! grep -Fq "یادآوری روزانه" "$OUT/ui-after-onboarding-tap.xml" && ! grep -Fq "برنامه امروز" "$OUT/ui-after-onboarding-tap.xml"; then
  echo "Onboarding touch did not change the UI"
  cat "$OUT/ui-after-onboarding-tap.xml"
  exit 1
fi
printf 'PASS\n' > "$OUT/onboarding-button-touch.txt"
fail_on_crash

# Close reminder offer if it is present.
if grep -Fq "فعلاً نه" "$OUT/ui-after-onboarding-tap.xml"; then
  tap_text "ui-after-onboarding-tap.xml" "فعلاً نه"
  sleep 2
fi

adb shell input keyevent KEYCODE_HOME
sleep 2
adb shell am start -n "$ACTIVITY" | tee "$OUT/relaunch.txt"
sleep 4
assert_running > "$OUT/pid-relaunch.txt"
dump_ui "ui-relaunch"
fail_on_crash

adb shell svc wifi disable || true
adb shell svc data disable || true
adb shell am force-stop "$PKG"
adb logcat -c
adb shell am start -n "$ACTIVITY" | tee "$OUT/launch-offline.txt"
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
  "onboardingButtonTouch": "PASS",
  "relaunch": "PASS",
  "offlineLaunch": "PASS",
  "landscapeSurvival": "PASS",
  "fatalCrash": "NONE"
}
JSON
cat "$OUT/summary.json"
