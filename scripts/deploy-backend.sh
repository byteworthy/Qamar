#!/bin/bash
# Backend Deployment Script
# Deploys backend to Railway with health check verification

set -e  # Exit on error

echo "🚀 Qamar Backend Deployment"
echo "=========================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI not found${NC}"
    echo "Install with: npm install -g @railway/cli"
    exit 1
fi

# Check if logged in to Railway
if ! railway whoami &> /dev/null; then
    echo -e "${RED}❌ Not logged in to Railway${NC}"
    echo "Run: railway login"
    exit 1
fi

# Get current version
VERSION=$(node -p "require('./package.json').version")
echo -e "${YELLOW}📦 Deploying version: ${VERSION}${NC}"
echo ""

# Run tests
echo "🧪 Running tests..."
npm test
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Tests failed. Deployment cancelled.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Tests passed${NC}"
echo ""

# Type check
echo "🔍 Type checking..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Type check failed. Deployment cancelled.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Type check passed${NC}"
echo ""

# Deploy to Railway
echo "☁️  Deploying to Railway..."
railway up --detach

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Deployment initiated${NC}"
echo ""

# Wait for deployment
echo "⏳ Waiting for deployment to stabilize (30s)..."
sleep 30

# Health check
echo "🏥 Checking health endpoint..."
HEALTH_URL="https://noor-production-9ac5.up.railway.app/api/health"

RESPONSE=$(curl -s -w "\n%{http_code}" $HEALTH_URL)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Health check passed${NC}"
    echo "Response: $BODY"
else
    echo -e "${RED}❌ Health check failed (HTTP $HTTP_CODE)${NC}"
    echo "Response: $BODY"
    echo ""
    echo "Check Railway logs with: railway logs"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Deployment successful!${NC}"
echo ""
echo "Next steps:"
echo "  • Check Railway logs: railway logs"
echo "  • Monitor errors: https://sentry.io"
echo "  • Create release: npm run sentry:release"
