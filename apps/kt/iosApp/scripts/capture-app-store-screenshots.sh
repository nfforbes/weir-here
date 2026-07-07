#!/usr/bin/env bash
# Capture App Store screenshots from a built iOS Simulator .app bundle.
# Usage: capture-app-store-screenshots.sh <path-to.app> [output-dir]
#
# Output sets (all PNGs are resized to exact App Store pixel dimensions):
#   iphone-67-*  -> 1284×2778  (6.5" display slot: 1284×2778 or 2778×1284)
#   iphone-65-*  -> 1242×2688  (6.5" display slot: 1242×2688 or 2688×1242)
#   iphone-69-*  -> 1320×2868  (6.9" display slot, when App Store Connect offers it)
#
# Newer simulators (e.g. iPhone 17 Pro Max) capture at non-accepted sizes; we always
# normalize with `sips` so uploads pass App Store Connect validation.
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

find_first_simulator_name() {
  local pattern="$1"
  xcrun simctl list devices available |
    grep -E "${pattern}" 2>/dev/null |
    head -1 |
    sed -E 's/^[[:space:]]+(.+) \([0-9A-F-]{36}\).*/\1/' ||
    true
}

screenshot_dimensions() {
  local file="$1"
  sips -g pixelWidth -g pixelHeight "$file" 2>/dev/null |
    awk '/pixelWidth/ {w=$2} /pixelHeight/ {h=$2} END {print w, h}'
}

normalize_screenshot() {
  local file="$1"
  local target_w="$2"
  local target_h="$3"
  read -r current_w current_h <<< "$(screenshot_dimensions "$file")"

  if [ "$current_w" = "$target_w" ] && [ "$current_h" = "$target_h" ]; then
    echo "  OK ${file}: ${target_w}×${target_h}"
    return 0
  fi

  echo "  Resizing ${file}: ${current_w}×${current_h} -> ${target_w}×${target_h}"
  sips -z "$target_h" "$target_w" "$file" --out "$file" >/dev/null
}

expected_dimensions_for() {
  local file="$1"
  local base
  base="$(basename "$file")"
  case "$base" in
    iphone-67-*) echo "1284 2778" ;;
    iphone-65-*) echo "1242 2688" ;;
    iphone-69-*) echo "1320 2868" ;;
    *) echo "" ;;
  esac
}

verify_all_screenshots() {
  local failed=0
  local file expected_w expected_h actual_w actual_h

  for file in "$OUT_DIR"/*.png; do
    [ -f "$file" ] || continue
    read -r expected_w expected_h <<< "$(expected_dimensions_for "$file")"
    if [ -z "$expected_w" ]; then
      echo "WARN: unknown screenshot prefix: ${file}"
      continue
    fi
    read -r actual_w actual_h <<< "$(screenshot_dimensions "$file")"
    if [ "$actual_w" != "$expected_w" ] || [ "$actual_h" != "$expected_h" ]; then
      echo "ERROR: ${file} is ${actual_w}×${actual_h}, expected ${expected_w}×${expected_h}"
      failed=1
    else
      echo "Verified ${file}: ${actual_w}×${actual_h}"
    fi
  done

  return "$failed"
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
  local target_w="$4"
  local target_h="$5"

  xcrun simctl terminate "$udid" "$BUNDLE_ID" 2>/dev/null || true
  xcrun simctl launch "$udid" "$BUNDLE_ID" -ScreenshotMode "-ScreenshotTab=${tab}"
  sleep 2
  xcrun simctl io "$udid" screenshot "$output_file"
  normalize_screenshot "$output_file" "$target_w" "$target_h"
  echo "Captured ${output_file}"
}

capture_for_device() {
  local device_name="$1"
  local prefix="$2"
  local target_w="$3"
  local target_h="$4"
  local udid

  udid="$(find_simulator "$device_name")"
  if [ -z "$udid" ]; then
    echo "Skipping ${device_name}: simulator not available on this runner"
    return 0
  fi

  echo "Using ${device_name} (${udid}) -> ${target_w}×${target_h}"

  xcrun simctl shutdown all 2>/dev/null || true
  xcrun simctl boot "$udid" 2>/dev/null || true
  xcrun simctl bootstatus "$udid" -b

  xcrun simctl uninstall "$udid" "$BUNDLE_ID" 2>/dev/null || true
  xcrun simctl install "$udid" "$APP_PATH"
  prepare_status_bar "$udid"

  capture_screen "$udid" "jobs" "${OUT_DIR}/${prefix}-01-browse-jobs.png" "$target_w" "$target_h"
  capture_screen "$udid" "payment" "${OUT_DIR}/${prefix}-02-pay-now.png" "$target_w" "$target_h"
  capture_screen "$udid" "profile" "${OUT_DIR}/${prefix}-03-profile.png" "$target_w" "$target_h"

  xcrun simctl shutdown "$udid" 2>/dev/null || true
}

capture_for_first_available() {
  local prefix="$1"
  local target_w="$2"
  local target_h="$3"
  shift 3
  local device_name

  for device_name in "$@"; do
    capture_for_device "$device_name" "$prefix" "$target_w" "$target_h"
    if compgen -G "${OUT_DIR}/${prefix}-*.png" > /dev/null; then
      return 0
    fi
  done

  return 1
}

# Primary iPhone set: 1284×2778 (accepted for 6.5" display in App Store Connect)
capture_for_first_available "iphone-67" 1284 2778 \
  "iPhone 15 Pro Max" \
  "iPhone 16 Pro Max" \
  "iPhone 17 Pro Max" \
  "iPhone 14 Pro Max" \
  || true

if ! compgen -G "${OUT_DIR}/iphone-67-*.png" > /dev/null; then
  fallback_name="$(find_first_simulator_name 'iPhone .+ Pro Max \(' || true)"
  if [ -n "$fallback_name" ]; then
    echo "Falling back to first available Pro Max simulator: ${fallback_name}"
    capture_for_device "$fallback_name" "iphone-67" 1284 2778 || true
  fi
fi

# Legacy 6.5" set: 1242×2688 (also accepted for the same 6.5" display slot)
capture_for_first_available "iphone-65" 1242 2688 \
  "iPhone 11 Pro Max" \
  "iPhone XS Max" \
  || true

if ! compgen -G "${OUT_DIR}/iphone-65-*.png" > /dev/null; then
  fallback_name="$(find_first_simulator_name 'iPhone 11 Pro Max \(' || true)"
  if [ -z "$fallback_name" ]; then
    fallback_name="$(find_first_simulator_name 'iPhone XS Max \(' || true)"
  fi
  if [ -n "$fallback_name" ]; then
    echo "Falling back to legacy 6.5\" simulator: ${fallback_name}"
    capture_for_device "$fallback_name" "iphone-65" 1242 2688 || true
  else
    echo "Skipping 1242×2688 screenshots: no legacy 6.5\" simulator on this runner"
  fi
fi

# Optional 6.9" set: 1320×2868 (primary slot on newer App Store Connect listings)
capture_for_first_available "iphone-69" 1320 2868 \
  "iPhone 17 Pro Max" \
  "iPhone 16 Pro Max" \
  "iPhone 16 Plus" \
  "iPhone 15 Pro Max" \
  || true

if ! compgen -G "${OUT_DIR}/*.png" > /dev/null; then
  echo "No screenshots were captured"
  echo "Available iPhone simulators on this runner:"
  xcrun simctl list devices available | grep -E 'iPhone|iOS' || true
  exit 1
fi

echo ""
echo "Verifying screenshot dimensions..."
if ! verify_all_screenshots; then
  echo "Screenshot dimension verification failed"
  exit 1
fi

echo ""
echo "Upload guidance:"
echo "  - For the 6.5\" display slot (1284×2778 / 1242×2688): use iphone-67-*.png (recommended)"
echo "  - For the 6.9\" display slot (1320×2868): use iphone-69-*.png if that slot is shown"
echo ""

ls -la "$OUT_DIR"
