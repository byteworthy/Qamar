#!/bin/bash
# Version Bump Script
# Bumps version in package.json and app.json

set -e

echo "📦 Version Bump"
echo "==============="
echo ""

# Check argument
if [ $# -eq 0 ]; then
    echo "Usage: npm run version:bump <major|minor|patch>"
    echo ""
    echo "Examples:"
    echo "  npm run version:bump patch  # 0.9.0 → 0.9.1"
    echo "  npm run version:bump minor  # 0.9.1 → 0.10.0"
    echo "  npm run version:bump major  # 0.10.0 → 1.0.0"
    exit 1
fi

TYPE=$1

# Validate type
if [ "$TYPE" != "major" ] && [ "$TYPE" != "minor" ] && [ "$TYPE" != "patch" ]; then
    echo "❌ Invalid bump type: $TYPE"
    echo "Use: major, minor, or patch"
    exit 1
fi

# Get current version
CURRENT=$(node -p "require('./package.json').version")
echo "Current version: $CURRENT"

# Bump version in package.json
npm version $TYPE --no-git-tag-version

# Get new version
NEW=$(node -p "require('./package.json').version")
echo "New version: $NEW"

# Update app.json version
if [ -f "app.json" ]; then
    node -e "
    const fs = require('fs');
    const app = JSON.parse(fs.readFileSync('app.json', 'utf8'));
    app.expo.version = '$NEW';
    fs.writeFileSync('app.json', JSON.stringify(app, null, 2) + '\\n');
    "
    echo "✅ Updated app.json"
fi

echo ""
echo "✅ Version bumped: $CURRENT → $NEW"
echo ""
echo "Next steps:"
echo "  1. Review changes: git diff"
echo "  2. Commit: git add package.json app.json && git commit -m \"Bump version to $NEW\""
echo "  3. Tag: git tag v$NEW"
echo "  4. Push: git push && git push --tags"
echo "  5. Deploy: npm run deploy:backend"
