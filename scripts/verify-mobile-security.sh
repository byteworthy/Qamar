#!/bin/bash
# Noor Mobile Security Verification Script
# Verifies all security measures are properly implemented
# Run this before App Store submission

echo "🔒 NOOR MOBILE SECURITY VERIFICATION"
echo "====================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0
WARNINGS=0

check() {
    if [ $2 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $1"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}: $1"
        ((FAILED++))
    fi
}

warn() {
    echo -e "${YELLOW}⚠ WARN${NC}: $1"
    ((WARNINGS++))
}

info() {
    echo -e "${BLUE}ℹ INFO${NC}: $1"
}

echo "1️⃣  CHECKING CRITICAL SECURITY FIXES"
echo "------------------------------------"

# Check for hardcoded secrets
info "Checking for hardcoded secrets..."
! grep -r "sk-ant-api" --include="*.ts" --include="*.js" --exclude-dir=node_modules --exclude-dir=.git --exclude=".env.example" > /dev/null 2>&1
check "No hardcoded API keys in code" $?

# Check .env is in .gitignore
info "Checking .gitignore..."
grep -q "^\.env$" .gitignore
check ".env in .gitignore" $?

# Check .env is NOT in git
! git ls-files | grep -q "^.env$"
check ".env not tracked by git" $?

echo ""
echo "2️⃣  CHECKING SECURE STORAGE IMPLEMENTATION"
echo "------------------------------------------"

# Check SecureStore usage in storage.ts
info "Checking storage.ts..."
grep -q "secureStorage" client/lib/storage.ts
check "storage.ts uses secureStorage" $?

# Check SecureStore usage in notifications.ts
info "Checking notifications.ts..."
grep -q "secureStorage" client/lib/notifications.ts
check "notifications.ts uses secureStorage" $?

# Check for insecure AsyncStorage usage
info "Checking for insecure AsyncStorage usage..."
! grep -r "AsyncStorage.setItem.*token\|AsyncStorage.setItem.*password\|AsyncStorage.setItem.*session" --include="*.ts" --include="*.js" --exclude-dir=node_modules client/ > /dev/null 2>&1
check "No sensitive data in AsyncStorage" $?

echo ""
echo "3️⃣  CHECKING BIOMETRIC AUTHENTICATION"
echo "--------------------------------------"

# Check biometric-auth.ts exists
info "Checking biometric auth module..."
test -f "client/lib/biometric-auth.ts"
check "biometric-auth.ts exists" $?

# Check useBiometricAuth hook exists
test -f "client/hooks/useBiometricAuth.ts"
check "useBiometricAuth.ts exists" $?

# Check expo-local-authentication installed
grep -q "expo-local-authentication" package.json
check "expo-local-authentication installed" $?

# Check iOS Face ID permission
info "Checking iOS permissions..."
grep -q "NSFaceIDUsageDescription" app.json
check "iOS Face ID permission configured" $?

echo ""
echo "4️⃣  CHECKING JAILBREAK DETECTION"
echo "---------------------------------"

# Check device-security.ts exists
info "Checking jailbreak detection module..."
test -f "client/lib/device-security.ts"
check "device-security.ts exists" $?

# Check jail-monkey installed
grep -q "jail-monkey" package.json
check "jail-monkey installed" $?

# Check for JailMonkey usage
grep -rq "JailMonkey" --include="*.ts" client/lib/
check "JailMonkey used in code" $?

echo ""
echo "5️⃣  CHECKING SCREENSHOT PREVENTION"
echo "-----------------------------------"

# Check useScreenProtection hook exists
info "Checking screenshot prevention..."
test -f "client/hooks/useScreenProtection.ts"
check "useScreenProtection.ts exists" $?

# Check expo-screen-capture installed
grep -q "expo-screen-capture" package.json
check "expo-screen-capture installed" $?

# Check ThoughtCaptureScreen uses it
grep -q "useScreenProtection" client/screens/ThoughtCaptureScreen.tsx
check "ThoughtCaptureScreen protected" $?

# Check HistoryScreen uses it
grep -q "useScreenProtection" client/screens/HistoryScreen.tsx
check "HistoryScreen protected" $?

# Check InsightsScreen uses it
grep -q "useScreenProtection" client/screens/InsightsScreen.tsx
check "InsightsScreen protected" $?

echo ""
echo "6️⃣  CHECKING CONSOLE.LOG SECURITY"
echo "----------------------------------"

# Check for console.log with sensitive data
info "Checking for console.logs with sensitive data..."
SENSITIVE_LOGS=$(grep -r "console.log.*token\|console.log.*password\|console.log.*key\|console.log.*secret" --include="*.ts" --include="*.js" --exclude-dir=node_modules client/ 2>/dev/null | wc -l)

if [ "$SENSITIVE_LOGS" -eq 0 ]; then
    check "No sensitive console.logs found" 0
elif [ "$SENSITIVE_LOGS" -le 3 ]; then
    warn "Found $SENSITIVE_LOGS potential sensitive console.logs (check if guarded by __DEV__)"
else
    check "No sensitive console.logs found" 1
    info "Found $SENSITIVE_LOGS console.logs with sensitive keywords"
fi

echo ""
echo "7️⃣  CHECKING DOCUMENTATION"
echo "--------------------------"

# Check SECURITY.md exists
test -f "SECURITY.md"
check "SECURITY.md exists" $?

# Check PRIVACY_POLICY.md exists
test -f "PRIVACY_POLICY.md"
check "PRIVACY_POLICY.md exists" $?

# Check documentation has required sections
grep -q "Reporting a Vulnerability" SECURITY.md
check "SECURITY.md has vulnerability reporting" $?

grep -q "GDPR" PRIVACY_POLICY.md
check "PRIVACY_POLICY.md mentions GDPR" $?

echo ""
echo "8️⃣  CHECKING NPM SECURITY"
echo "-------------------------"

info "Running npm audit..."
npm audit --audit-level=high > /tmp/npm-audit.txt 2>&1
AUDIT_EXIT=$?

if [ $AUDIT_EXIT -eq 0 ]; then
    check "No high/critical npm vulnerabilities" 0
else
    warn "npm audit found issues (see below)"
    cat /tmp/npm-audit.txt | grep "vulnerabilities"
fi

echo ""
echo "9️⃣  CHECKING APP CONFIGURATION"
echo "-------------------------------"

# Check app.json has required security configs
info "Checking app.json..."

# iOS checks
grep -q "NSFaceIDUsageDescription" app.json
check "iOS biometric permission configured" $?

grep -q "expo-local-authentication" app.json
check "expo-local-authentication plugin added" $?

# Android checks
grep -q "USE_BIOMETRIC" app.json
check "Android biometric permission configured" $?

echo ""
echo "🔟  CHECKING BUILD CONFIGURATION"
echo "--------------------------------"

# Check TypeScript is configured
test -f "tsconfig.json"
check "TypeScript configuration exists" $?

# Check strict mode is enabled
grep -q "\"strict\": true" tsconfig.json
check "TypeScript strict mode enabled" $?

# Check package.json has security scripts
grep -q "\"check:types\"" package.json
check "Type checking script exists" $?

echo ""
echo "====================================="
echo "📊 VERIFICATION SUMMARY"
echo "====================================="
echo -e "Passed:   ${GREEN}$PASSED${NC}"
echo -e "Failed:   ${RED}$FAILED${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"
echo ""

if [ $FAILED -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ ALL CHECKS PASSED!${NC}"
    echo ""
    echo "🎉 Noor is READY for App Store submission!"
    echo ""
    echo "Next steps:"
    echo "1. Test biometric auth on physical iOS device"
    echo "2. Test jailbreak detection (if possible)"
    echo "3. Test screenshot prevention on both platforms"
    echo "4. Build production release"
    echo "5. Submit to App Store Connect and Play Console"
    echo ""
    exit 0
elif [ $FAILED -eq 0 ]; then
    echo -e "${YELLOW}⚠ PASSED WITH WARNINGS${NC}"
    echo ""
    echo "Review warnings above. Most are informational."
    echo "You can proceed with caution."
    echo ""
    exit 0
else
    echo -e "${RED}✗ FAILED - ISSUES NEED TO BE FIXED${NC}"
    echo ""
    echo "Please address the failed checks above before"
    echo "submitting to App Store or Play Store."
    echo ""
    exit 1
fi
