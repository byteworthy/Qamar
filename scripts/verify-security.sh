#!/bin/bash

# Qamar Security Verification Script
# Checks all implemented security measures before deployment

echo "🔒 Qamar Security Verification"
echo "=============================="
echo ""

PASSED=0
FAILED=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check() {
    if [ $2 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $1"
        ((FAILED++))
    fi
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# =============================================================================
# 1. Check for hardcoded secrets
# =============================================================================

echo "1. Checking for hardcoded secrets..."
! grep -r "sk-ant-api" --include="*.ts" --include="*.js" --include="*.tsx" --exclude-dir=node_modules --exclude-dir=.git client/ > /dev/null 2>&1
check "No hardcoded Anthropic API keys in client code" $?

! grep -r "ANTHROPIC_API_KEY.*=" --include="*.ts" --include="*.js" --include="*.tsx" --exclude-dir=node_modules --exclude-dir=.git client/ | grep -v "process.env" > /dev/null 2>&1
check "No hardcoded ANTHROPIC_API_KEY assignments in client" $?

# =============================================================================
# 2. Check SecureStore implementation
# =============================================================================

echo ""
echo "2. Checking SecureStore implementation..."

test -f "client/lib/secure-storage.ts"
check "SecureStore wrapper module exists" $?

grep -q "from.*secure-storage" client/lib/storage.ts
check "storage.ts imports from secure-storage wrapper" $?

grep -q "secureStorage.setItem" client/lib/storage.ts
check "storage.ts uses SecureStore.setItem" $?

grep -q "from.*secure-storage" client/lib/notifications.ts
check "notifications.ts imports from secure-storage wrapper" $?

grep -q "SECURE_KEYS" client/lib/notifications.ts
check "notifications.ts uses secure keys constants" $?

# =============================================================================
# 3. Check biometric authentication
# =============================================================================

echo ""
echo "3. Checking biometric authentication..."

test -f "client/lib/biometric-auth.ts"
check "Biometric auth module exists" $?

grep -q "expo-local-authentication" client/lib/biometric-auth.ts
check "Biometric module imports expo-local-authentication" $?

grep -q "authenticateWithBiometric" client/App.tsx
check "App.tsx imports biometric auth" $?

grep -q "BiometricGuard" client/App.tsx
check "App.tsx uses BiometricGuard component" $?

grep -q "NSFaceIDUsageDescription" app.json
check "app.json has Face ID usage description" $?

grep -q "USE_BIOMETRIC" app.json
check "app.json has Android biometric permissions" $?

# =============================================================================
# 4. Check jailbreak detection
# =============================================================================

echo ""
echo "4. Checking jailbreak/root detection..."

test -f "client/lib/device-security.ts"
check "Device security module exists" $?

grep -q "jail-monkey" client/lib/device-security.ts
check "Device security uses jail-monkey" $?

grep -q "checkDeviceSecurity" client/App.tsx
check "App.tsx imports device security check" $?

grep -q "personal reflection entries" client/lib/device-security.ts
check "Device security uses reflection/growth language" $?

# =============================================================================
# 5. Check screenshot prevention
# =============================================================================

echo ""
echo "5. Checking screenshot prevention..."

test -f "client/hooks/useScreenProtection.ts"
check "Screenshot protection hook exists" $?

grep -q "expo-screen-capture" client/hooks/useScreenProtection.ts
check "Screenshot hook uses expo-screen-capture" $?

grep -q "useScreenProtection" client/screens/ThoughtCaptureScreen.tsx
check "ThoughtCaptureScreen uses screenshot protection" $?

grep -q "useScreenProtection" client/screens/HistoryScreen.tsx
check "HistoryScreen uses screenshot protection" $?

grep -q "useScreenProtection" client/screens/InsightsScreen.tsx
check "InsightsScreen uses screenshot protection" $?

grep -q "useScreenProtection" client/screens/ReframeScreen.tsx
check "ReframeScreen uses screenshot protection" $?

grep -q "useScreenProtection" client/screens/IntentionScreen.tsx
check "IntentionScreen uses screenshot protection" $?

# =============================================================================
# 6. Check console.log removal
# =============================================================================

echo ""
echo "6. Checking console.log removal in production..."

grep -q "transform-remove-console" babel.config.js
check "Babel configured to remove console.logs" $?

grep -q "NODE_ENV === \"production\"" babel.config.js
check "Console removal only in production" $?

grep -q "exclude.*error.*warn" babel.config.js
check "Console.error and console.warn preserved" $?

# Check for sensitive console.logs in code
SENSITIVE_LOGS=$(grep -r "console.log.*token\|console.log.*password\|console.log.*key" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules --exclude-dir=.git client/ 2>/dev/null | grep -v "__DEV__" | wc -l)
[ "$SENSITIVE_LOGS" -eq 0 ]
check "No unprotected sensitive console.logs" $?

# =============================================================================
# 7. Check .env security
# =============================================================================

echo ""
echo "7. Checking environment variable security..."

grep -q "^\.env$" .gitignore
check ".env in .gitignore" $?

! git log --all --full-history --source --pretty=format: --name-only -- .env 2>/dev/null | grep -q .env
check ".env never committed to git" $?

# =============================================================================
# 8. Check security documentation
# =============================================================================

echo ""
echo "8. Checking security documentation..."

test -f "SECURITY.md"
check "SECURITY.md exists" $?

test -f "PRIVACY_POLICY.md"
check "PRIVACY_POLICY.md exists" $?

grep -q "reflection" SECURITY.md
check "SECURITY.md uses reflection/growth language" $?

grep -q "reflection and personal growth" PRIVACY_POLICY.md
check "PRIVACY_POLICY.md uses reflection/growth positioning" $?

# =============================================================================
# 9. Check Expo plugin configuration
# =============================================================================

echo ""
echo "9. Checking Expo plugin configuration..."

grep -q "expo-secure-store" app.json
check "expo-secure-store plugin configured" $?

grep -q "expo-local-authentication" app.json
check "expo-local-authentication plugin configured" $?

# =============================================================================
# Summary
# =============================================================================

echo ""
echo "=============================="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ ALL SECURITY CHECKS PASSED!${NC}"
    echo -e "${GREEN}✓ APP STORE READY${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}✗ SECURITY ISSUES FOUND${NC}"
    echo -e "${RED}✗ FIX ISSUES BEFORE DEPLOYMENT${NC}"
    exit 1
fi
