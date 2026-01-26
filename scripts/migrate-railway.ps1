# Railway Database Migration Script (Windows PowerShell)
# Run this to initialize your Railway Postgres database schema

Write-Host "🚂 Railway Database Migration" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Check if Railway CLI is installed
$railwayCmd = Get-Command railway -ErrorAction SilentlyContinue
if (-not $railwayCmd) {
    Write-Host "❌ Railway CLI not found" -ForegroundColor Red
    Write-Host "   Install with: npm install -g @railway/cli" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Railway CLI found" -ForegroundColor Green
Write-Host ""

# Login to Railway
Write-Host "📝 Step 1: Login to Railway" -ForegroundColor Cyan
Write-Host "   (This will open a browser window)" -ForegroundColor Gray
railway login
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Login failed" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Link to project
Write-Host "🔗 Step 2: Link to Noor project" -ForegroundColor Cyan
Write-Host "   (Select 'Noor' from the list)" -ForegroundColor Gray
railway link
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Link failed" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Run migrations
Write-Host "🗄️  Step 3: Running database migrations..." -ForegroundColor Cyan
Write-Host "   Creating tables: users, user_sessions, sessions, processed_stripe_events" -ForegroundColor Gray
railway run npm run db:push
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Migration failed" -ForegroundColor Red
    Write-Host "   Check Railway logs: railway logs" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Verify health check
Write-Host "🏥 Step 4: Verifying health check..." -ForegroundColor Cyan
Start-Sleep -Seconds 2
$healthResponse = Invoke-RestMethod -Uri "https://noor-production-9ac5.up.railway.app/api/health" -Method Get -ErrorAction SilentlyContinue
Write-Host "   Response: $($healthResponse | ConvertTo-Json -Compress)" -ForegroundColor Gray
Write-Host ""

# Check if database is healthy
if ($healthResponse.checks.database -eq $true) {
    Write-Host "✅ SUCCESS! Database is healthy and schema is initialized" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Your backend is now fully operational!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Test mobile app: npx expo start" -ForegroundColor White
    Write-Host "2. Try full reflection flow" -ForegroundColor White
    Write-Host "3. Start internal testing" -ForegroundColor White
} else {
    Write-Host "⚠️  Health check not passing yet" -ForegroundColor Yellow
    Write-Host "   Check Railway logs for any errors" -ForegroundColor Gray
    Write-Host "   Run: railway logs" -ForegroundColor Yellow
}
