#!/usr/bin/env bash
# take-screenshots.sh - Run Maestro flows to capture App Store screenshots
#
# Prerequisites:
#   - Maestro CLI installed (brew install maestro / curl -Ls https://get.maestro.mobile.dev | bash)
#   - iOS Simulator or Android Emulator running with the app installed
#
# Usage:
#   ./scripts/take-screenshots.sh            # Run all screenshot flows
#   ./scripts/take-screenshots.sh 01-welcome  # Run a single flow

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
FLOWS_DIR="$PROJECT_DIR/.maestro/screenshots"
OUTPUT_DIR="$PROJECT_DIR/screenshots"

mkdir -p "$OUTPUT_DIR"

echo "=== Noor App Store Screenshot Automation ==="
echo "Output directory: $OUTPUT_DIR"
echo ""

if ! command -v maestro &> /dev/null; then
  echo "ERROR: Maestro CLI not found."
  echo "Install with: curl -Ls https://get.maestro.mobile.dev | bash"
  exit 1
fi

if [ $# -gt 0 ]; then
  # Run a single flow by name
  FLOW="$FLOWS_DIR/$1.yaml"
  if [ ! -f "$FLOW" ]; then
    echo "ERROR: Flow not found: $FLOW"
    exit 1
  fi
  echo "Running flow: $1"
  maestro test "$FLOW" --output "$OUTPUT_DIR"
else
  # Run all flows in order
  for FLOW in "$FLOWS_DIR"/*.yaml; do
    FLOW_NAME="$(basename "$FLOW" .yaml)"
    echo "--- Running: $FLOW_NAME ---"
    maestro test "$FLOW" --output "$OUTPUT_DIR" || {
      echo "WARNING: Flow $FLOW_NAME failed, continuing..."
    }
    echo ""
  done
fi

echo "=== Screenshots saved to $OUTPUT_DIR ==="
ls -la "$OUTPUT_DIR"/*.png 2>/dev/null || echo "(no .png files found yet)"
