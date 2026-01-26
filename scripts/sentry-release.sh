#!/bin/bash
# Sentry Release Creation Script
# Creates and finalizes a Sentry release with commit tracking

set -e

echo "📊 Sentry Release Creation"
echo "=========================="
echo ""

# Check if sentry-cli is installed
if ! command -v sentry-cli &> /dev/null; then
    echo "❌ sentry-cli not found"
    echo "Install with: npm install -g @sentry/cli"
    exit 1
fi

# Check if .sentryclirc exists
if [ ! -f ".sentryclirc" ]; then
    echo "❌ .sentryclirc not found"
    echo "Create it with your Sentry auth token and org/project info"
    echo "See: docs/SENTRY_SETUP.md"
    exit 1
fi

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")
RELEASE="noor@${VERSION}"

echo "Creating Sentry release: ${RELEASE}"
echo ""

# Create release
echo "1️⃣ Creating release..."
sentry-cli releases new "${RELEASE}"

# Associate commits
echo "2️⃣ Associating commits..."
sentry-cli releases set-commits "${RELEASE}" --auto

# Finalize release
echo "3️⃣ Finalizing release..."
sentry-cli releases finalize "${RELEASE}"

echo ""
echo "✅ Sentry release ${RELEASE} created and finalized"
echo ""
echo "View release: https://sentry.io/releases/${RELEASE}/"
