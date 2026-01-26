# Railway Database Setup Script
# Run this to create tables in your Railway Postgres database

Write-Host "🚂 Railway Database Setup" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# Check if Railway CLI is authenticated
$authCheck = railway whoami 2>&1
if ($authCheck -match "Unauthorized") {
    Write-Host "⚠️  Railway CLI not authenticated" -ForegroundColor Yellow
    Write-Host "   Opening browser for authentication..." -ForegroundColor Gray
    railway login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Authentication failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Authentication successful" -ForegroundColor Green
    Write-Host ""
}

# Link to project
Write-Host "🔗 Linking to Noor project..." -ForegroundColor Cyan
$linkCheck = railway status 2>&1
if ($linkCheck -match "not linked") {
    railway link
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to link project" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ Project linked" -ForegroundColor Green
Write-Host ""

# Execute SQL
Write-Host "📊 Creating database tables..." -ForegroundColor Cyan
$sqlContent = Get-Content -Path "create-tables.sql" -Raw
$sqlContent | railway run psql --command "$sqlContent"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Tables created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🏥 Verifying health check..." -ForegroundColor Cyan
    Start-Sleep -Seconds 2

    try {
        $health = Invoke-RestMethod -Uri "https://noor-production-9ac5.up.railway.app/api/health"
        if ($health.checks.database -eq $true) {
            Write-Host "✅ Health check passed!" -ForegroundColor Green
            Write-Host ""
            Write-Host "🎉 Backend is fully operational!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Next steps:" -ForegroundColor Cyan
            Write-Host "1. Test mobile app: npx expo start" -ForegroundColor White
            Write-Host "2. Start internal testing" -ForegroundColor White
        } else {
            Write-Host "⚠️  Health check shows database: false" -ForegroundColor Yellow
            Write-Host "   Check Railway logs for errors" -ForegroundColor Gray
        }
    } catch {
        Write-Host "⚠️  Could not verify health check" -ForegroundColor Yellow
        Write-Host "   Manually check: https://noor-production-9ac5.up.railway.app/api/health" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ Failed to create tables" -ForegroundColor Red
    Write-Host "   Check the error message above" -ForegroundColor Gray
}
