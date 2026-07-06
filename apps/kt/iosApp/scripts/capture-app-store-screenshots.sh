#!/usr/bin/env bash
# Capture App Store screenshots from a built iOS Simulator .app bundle.
# Usage: capture-app-store-screenshots.sh <path-to.app> [output-dir]
set -euo pipefail

APP_PATH="${1:?Simulator .app bundle path required}"
OUT_DIR="${2:-iosApp/build/screenshots}"
BUNDLE_ID="${BUNDLE_ID:-com.weirhere.mobile}"

mkdir -p "$OUT_DIR"

find_simulator() {
  local device_name="$1"
  xcrun simctl list devices available |
    grep -F "${device_name} (" |
    head -1 |
    sed -E 's/.*\(([0-9A-F-]{36})\).*/\1/'
}

prepare_status_bar() {
  local udid="$1"
  xcrun simctl status_bar "$udid" override \
    --time "9:41" \
    --batteryState charged \
    --batteryLevel 100 \
    --cellularBars 4 \
    --cellularMode active \
    --operatorName "" 2>/dev/null || true
}

capture_screen() {
  local udid="$1"
  local tab="$2"
  local output_file="$3"

  xcrun simctl terminate "$udid" "$BUNDLE_ID" 2>/dev/null || true
  xcrun simctl launch "$udid" "$BUNDLE_ID" -ScreenshotMode "-ScreenshotTab=${tab}"
  sleep 2
  xcrun simctl io "$udid" screenshot "$output_file"
  echo "Captured ${output_file}"
}

capture_for_device() {
  local device_name="$1"
  local prefix="$2"
  local udid

  udid="$(find_simulator "$device_name")"
  if [ -z "$udid" ]; then
    echo "Skipping ${device_name}: simulator not available on this runner"
    return 0
  fi

  echo "Using ${device_name} (${udid})"

  xcrun simctl shutdown all 2>/dev/null || true
  xcrun simctl boot "$udid" 2>/dev/null || true
  xcrun simctl bootstatus "$udid" -b

  xcrun simctl uninstall "$udid" "$BUNDLE_ID" 2>/dev/null || true
  xcrun simctl install "$udid" "$APP_PATH"
  prepare_status_bar "$udid"

  capture_screen "$udid" "jobs" "${OUT_DIR}/${prefix}-01-browse-jobs.png"
  capture_screen "$udid" "payment" "${OUT_DIR}/${prefix}-02-payment.png"
  capture_screen "$udid" "payment-banking" "${OUT_DIR}/${prefix}-03-banking.png"
  capture_screen "$udid" "profile" "${OUT_DIR}/${prefix}-04-profile.png"

  xcrun simctl shutdown "$udid" 2>/dev/null || true
}

# 6.7" display (App Store primary iPhone slot)
capture_for_device "iPhone 16 Pro Max" "iphone-67" || true
if ! compgen -G "${OUT_DIR}/iphone-67-*.png" > /dev/null; then
  capture_for_device "iPhone 15 Pro Max" "iphone-67"
fi

# 6.5" display (secondary iPhone slot)
capture_for_device "iPhone 11 Pro Max" "iphone-65" || true

if ! compgen -G "${OUT_DIR}/*.png" > /dev/null; then
  echo "No screenshots were captured"
  exit 1
fi

ls -la "$OUT_DIR"
