#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# ios-maestro-test.sh — Full iOS Maestro E2E test pipeline
#
# Mirrors the GitHub Actions workflow: maestro-ios job
# Requires macOS with Xcode and iOS Simulator installed.
#
# Usage:
#   ./scripts/ios-maestro-test.sh
#
# Environment Variables (optional overrides):
#   APP_ID          — Bundle ID (default: com.maestro.reactnative)
#   APP_NAME        — Xcode scheme/workspace name (default: MaestroReactNative)
#   SIMULATOR_NAME  — Simulator device name (default: iPhone 16)
#   SKIP_BUILD      — Set to "true" to skip xcodebuild step
#   SKIP_PREBUILD   — Set to "true" to skip expo prebuild step
# ──────────────────────────────────────────────────────────────
set -euo pipefail

# ─── Configuration ───────────────────────────────────────────
APP_ID="${APP_ID:-com.maestro.reactnative}"
APP_NAME="${APP_NAME:-MaestroReactNative}"
SIMULATOR_NAME="${SIMULATOR_NAME:-iPhone 16}"
SKIP_BUILD="${SKIP_BUILD:-false}"
SKIP_PREBUILD="${SKIP_PREBUILD:-false}"
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cd "$PROJECT_ROOT"

echo "============================================"
echo "  🍎 iOS Maestro E2E Test Pipeline"
echo "============================================"
echo "  App ID:     $APP_ID"
echo "  App Name:   $APP_NAME"
echo "  Simulator:  $SIMULATOR_NAME"
echo "  Project:    $PROJECT_ROOT"
echo "============================================"

# ─── Step 1: Install Node.js Dependencies ───────────────────
echo ""
echo "📦 Step 1: Installing Node.js dependencies..."
if [ -d "node_modules" ]; then
  echo "   ✓ node_modules exists, skipping install (run 'npm ci' manually to refresh)"
else
  npm ci --legacy-peer-deps
fi

# ─── Step 2: Expo Prebuild (iOS) ────────────────────────────
if [ "$SKIP_PREBUILD" = "true" ]; then
  echo ""
  echo "⏭️  Step 2: Skipping expo prebuild (SKIP_PREBUILD=true)"
else
  echo ""
  echo "🔧 Step 2: Running expo prebuild for iOS..."
  npx expo prebuild --platform ios --clean
fi

# ─── Step 3: Install CocoaPods ───────────────────────────────
echo ""
echo "🫘 Step 3: Installing CocoaPods..."
cd ios
pod install
cd "$PROJECT_ROOT"

# ─── Step 4: Build iOS App for Simulator (Release) ──────────
if [ "$SKIP_BUILD" = "true" ]; then
  echo ""
  echo "⏭️  Step 4: Skipping xcodebuild (SKIP_BUILD=true)"
else
  echo ""
  echo "🏗️  Step 4: Building iOS app for simulator (Release)..."
  cd ios
  xcodebuild \
    -workspace "${APP_NAME}.xcworkspace" \
    -scheme "${APP_NAME}" \
    -configuration Release \
    -sdk iphonesimulator \
    -destination 'generic/platform=iOS Simulator' \
    -derivedDataPath build \
    CODE_SIGN_IDENTITY="" \
    CODE_SIGNING_REQUIRED=NO \
    CODE_SIGNING_ALLOWED=NO \
    build
  cd "$PROJECT_ROOT"
fi

# ─── Step 5: Boot iOS Simulator & Install App ───────────────
echo ""
echo "📱 Step 5: Booting iOS Simulator & installing app..."

echo "   Discovering available simulators and runtimes..."
xcrun simctl list runtimes
xcrun simctl list devices available

DEVICE_ID=$(xcrun simctl list devices available \
  | grep "$SIMULATOR_NAME" \
  | head -1 \
  | grep -oE '[0-9A-F-]{36}') || true

if [ -z "$DEVICE_ID" ]; then
  echo "   ⚠️  No '$SIMULATOR_NAME' simulator found — creating one..."

  IOS_RUNTIME=$(xcrun simctl list runtimes available \
    | grep -i "iOS" \
    | tail -1 \
    | grep -oE 'com\.apple\.CoreSimulator\.SimRuntime\.iOS-[0-9-]+')

  if [ -z "$IOS_RUNTIME" ]; then
    echo "❌ Error: No iOS simulator runtime available."
    echo "   Install one with: xcodebuild -downloadPlatform iOS"
    xcrun simctl list runtimes
    exit 1
  fi

  echo "   Using runtime: $IOS_RUNTIME"

  DEVICE_TYPE=$(xcrun simctl list devicetypes \
    | grep -i "iPhone" \
    | tail -1 \
    | grep -oE 'com\.apple\.CoreSimulator\.SimDeviceType\.[^ )]+')

  echo "   Using device type: $DEVICE_TYPE"

  DEVICE_ID=$(xcrun simctl create "$SIMULATOR_NAME" "$DEVICE_TYPE" "$IOS_RUNTIME")
  echo "   ✓ Created simulator '$SIMULATOR_NAME' with ID: $DEVICE_ID"
fi

echo "   Simulator ID: $DEVICE_ID"
xcrun simctl boot "$DEVICE_ID" || true

APP_PATH="ios/build/Build/Products/Release-iphonesimulator/${APP_NAME}.app"
if [ ! -d "$APP_PATH" ]; then
  echo "❌ Error: Built app not found at $APP_PATH"
  exit 1
fi

xcrun simctl install "$DEVICE_ID" "$APP_PATH"
echo "   ✓ App installed on simulator"

# ─── Step 6: Install Maestro (if not already installed) ─────
echo ""
echo "🎭 Step 6: Checking Maestro installation..."
if command -v maestro &>/dev/null; then
  echo "   ✓ Maestro found: $(maestro --version 2>/dev/null || echo 'installed')"
else
  echo "   Installing Maestro..."
  curl -Ls "https://get.maestro.mobile.dev" | bash
  export PATH="$HOME/.maestro/bin:$PATH"
fi

# ─── Step 7: Run Maestro Tests ──────────────────────────────
echo ""
echo "🧪 Step 7: Running Maestro tests..."
rm -rf screenshots maestro-output-ios.log || true
mkdir -p screenshots

maestro test .maestro/flow.yaml | tee maestro-output-ios.log

echo "📂 Moving screenshots..."
mv ./*.png screenshots/ 2>/dev/null || true

# ─── Step 8: Generate HTML Report ───────────────────────────
echo ""
echo "📄 Step 8: Generating HTML report..."
mkdir -p ./gh-pages/screenshots
cp -v screenshots/*.png ./gh-pages/screenshots/ 2>/dev/null || echo "   No screenshots to copy"
cp -v maestro-output-ios.log ./gh-pages/maestro-output.log 2>/dev/null || echo "   No log file found"

LOG_FILE="maestro-output-ios.log"

cat > ./gh-pages/index.html <<'HTMLHEAD'
<html><head><meta charset="UTF-8"><title>Maestro Test Report</title>
<style>
  body { font-family: sans-serif; padding: 2rem; background: #f5f5f5; color: #222; }
  h1 { font-size: 2.2rem; }
  h2 { margin-top: 2rem; font-size: 1.5rem; }
  table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
  table td, table th { border: 1px solid #ccc; padding: 0.5rem; text-align: left; }
  table th { background: #eee; }
  pre { background: #fff; padding: 1rem; border-radius: 0.5rem; white-space: pre-wrap; overflow-x: auto; }
  .screenshots-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-top: 1rem;
  }
  .screenshot {
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 0.5rem;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.06);
    text-align: center;
  }
  .screenshot img {
    border-radius: 0.5rem;
    max-width: 100%;
    height: auto;
    margin-top: 0.5rem;
  }
</style></head><body>
HTMLHEAD

# Summary statistics
total_tests=$(grep -cE "COMPLETED|FAILED" "$LOG_FILE" 2>/dev/null || echo 0)
passed=$(grep -c "COMPLETED" "$LOG_FILE" 2>/dev/null || echo 0)
failed=$(grep -c "FAILED" "$LOG_FILE" 2>/dev/null || echo 0)
percent=$(awk "BEGIN {printf \"%.1f\", ($passed*100)/($total_tests == 0 ? 1 : $total_tests)}")
os_version="iOS Simulator (${SIMULATOR_NAME})"

cat >> ./gh-pages/index.html <<SUMMARY
<h1>Maestro Test Report</h1>
<table>
  <tr><th>App</th><td>${APP_ID}</td></tr>
  <tr><th>OS</th><td>${os_version}</td></tr>
  <tr><th>Simulator</th><td>${SIMULATOR_NAME} (${DEVICE_ID})</td></tr>
  <tr><th>Tests Passed</th><td>${passed}</td></tr>
  <tr><th>Tests Failed</th><td>${failed}</td></tr>
  <tr><th>Success Rate</th><td>${percent}%</td></tr>
</table>
SUMMARY

echo '<h2>Test Report</h2><pre>' >> ./gh-pages/index.html
sed -e 's/Launch app/🚀 &/' \
    -e 's/Assert that/🔍 &/' \
    -e 's/Tap on/👆 &/' \
    -e 's/Input text/📝 &/' \
    -e 's/Wait for/⏳ &/' \
    -e 's/Take screenshot/📸 &/' \
    -e 's/COMPLETED/✅ COMPLETED/' \
    -e 's/FAILED/❌ FAILED/' \
    -e 's/RUNNING/🏃 RUNNING/' "$LOG_FILE" >> ./gh-pages/index.html
echo '</pre>' >> ./gh-pages/index.html

echo '<h2>Screenshots</h2><div class="screenshots-grid">' >> ./gh-pages/index.html
for img in ./gh-pages/screenshots/*.png; do
  [ -f "$img" ] || continue
  base=$(basename "$img" .png)
  echo "<div class='screenshot'><strong>${base}</strong><img src='screenshots/${base}.png'/></div>" >> ./gh-pages/index.html
done
echo '</div></body></html>' >> ./gh-pages/index.html

echo ""
echo "============================================"
echo "  ✅ Pipeline complete!"
echo "============================================"
echo "  Report: ./gh-pages/index.html"
echo "  Log:    ./maestro-output-ios.log"
echo "  Screenshots: ./screenshots/"
echo "============================================"
