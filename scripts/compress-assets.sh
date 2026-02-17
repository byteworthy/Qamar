#!/bin/bash
# Compress PNG assets in assets/images/ using pngquant
# Usage: chmod +x scripts/compress-assets.sh && ./scripts/compress-assets.sh

set -e

if ! command -v pngquant &> /dev/null; then
  echo "Installing pngquant..."
  brew install pngquant
fi

echo "Compressing PNG images in assets/..."

find assets/images -name "*.png" -print0 | while IFS= read -r -d '' file; do
  ORIGINAL=$(du -k "$file" | cut -f1)
  pngquant --force --quality=65-80 --output "$file" "$file" 2>/dev/null || true
  AFTER=$(du -k "$file" | cut -f1)
  SAVINGS=$((ORIGINAL - AFTER))
  echo "  $file: ${ORIGINAL}KB → ${AFTER}KB (saved ${SAVINGS}KB)"
done

echo ""
echo "Done! Run 'npm run bundle:analyze' to verify size reduction."
