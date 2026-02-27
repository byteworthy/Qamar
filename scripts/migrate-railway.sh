#!/bin/bash
# Railway Database Migration Script
# Run this to initialize your Railway Postgres database schema

set -e  # Exit on error

echo "🚂 Railway Database Migration"
echo "=============================="
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found"
    echo "   Install with: npm install -g @railway/cli"
    exit 1
fi

echo "✅ Railway CLI found"
echo ""

# Login to Railway
echo "📝 Step 1: Login to Railway"
echo "   (This will open a browser window)"
railway login
echo ""

# Link to project
echo "🔗 Step 2: Link to Qamar project"
echo "   (Select 'Qamar' from the list)"
railway link
echo ""

# Run migrations
echo "🗄️  Step 3: Running database migrations..."
echo "   Creating tables: users, user_sessions, sessions, processed_stripe_events"
railway run npm run db:push
echo ""

# Verify health check
echo "🏥 Step 4: Verifying health check..."
sleep 2
HEALTH_RESPONSE=$(curl -s https://noor-production-9ac5.up.railway.app/api/health)
echo "   Response: $HEALTH_RESPONSE"
echo ""

# Check if database is healthy
if echo "$HEALTH_RESPONSE" | grep -q '"database":true'; then
    echo "✅ SUCCESS! Database is healthy and schema is initialized"
    echo ""
    echo "🎉 Your backend is now fully operational!"
    echo ""
    echo "Next steps:"
    echo "1. Test mobile app: npx expo start"
    echo "2. Try full reflection flow"
    echo "3. Start internal testing"
else
    echo "⚠️  Health check not passing yet"
    echo "   Check Railway logs for any errors"
    echo "   Run: railway logs"
fi
