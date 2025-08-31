#!/bin/bash

# Smoke test script for Budget Tracker API
# Tests both UI and API endpoints with v0 fallback

set -e

UI_URL="http://localhost:5173"
API_URL="http://localhost:8080"

echo "🔥 Budget Tracker Smoke Tests"
echo "=============================="

# Check UI
echo -n "UI (${UI_URL}): "
if curl -s -o /dev/null -w "%{http_code}" "$UI_URL" | grep -q "200"; then
    echo "✅ OK"
else
    echo "❌ FAIL"
fi

# Check Swagger
echo -n "Swagger (${API_URL}/swagger-ui.html): "
SWAGGER_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/swagger-ui.html")
if [[ "$SWAGGER_CODE" == "200" ]] || [[ "$SWAGGER_CODE" == "302" ]]; then
    echo "✅ OK ($SWAGGER_CODE)"
else
    echo "❌ FAIL ($SWAGGER_CODE)"
fi

# Check API endpoints (authenticated tests)
if [[ -n "$TOKEN" ]]; then
    echo ""
    echo "🔐 Authenticated API Tests"
    echo "--------------------------"
    
    # Test auth status endpoint (v0 with fallback)
    echo -n "Auth Status (/api/v0/auth/status): "
    STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "$API_URL/api/v0/auth/status")
    if [[ "$STATUS_CODE" == "200" ]]; then
        echo "✅ OK (v0)"
    elif [[ "$STATUS_CODE" == "404" ]]; then
        # Fallback to legacy endpoint
        FALLBACK_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "$API_URL/api/auth/status")
        if [[ "$FALLBACK_CODE" == "200" ]]; then
            echo "⚠️  OK (legacy fallback)"
        else
            echo "❌ FAIL (v0: $STATUS_CODE, legacy: $FALLBACK_CODE)"
        fi
    else
        echo "❌ FAIL ($STATUS_CODE)"
    fi
    
    # Test categories endpoint (v0 with fallback)
    echo -n "Categories (/api/v0/categories): "
    CAT_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "$API_URL/api/v0/categories")
    if [[ "$CAT_CODE" == "200" ]]; then
        echo "✅ OK (v0)"
    elif [[ "$CAT_CODE" == "404" ]]; then
        # Fallback to legacy endpoint
        FALLBACK_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "$API_URL/api/categories")
        if [[ "$FALLBACK_CODE" == "200" ]]; then
            echo "⚠️  OK (legacy fallback)"
        else
            echo "❌ FAIL (v0: $CAT_CODE, legacy: $FALLBACK_CODE)"
        fi
    else
        echo "❌ FAIL ($CAT_CODE)"
    fi
    
    # Test subscriptions endpoint (v0 with fallback)
    echo -n "Subscriptions (/api/v0/subscriptions): "
    SUB_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "$API_URL/api/v0/subscriptions")
    if [[ "$SUB_CODE" == "200" ]]; then
        echo "✅ OK (v0)"
    elif [[ "$SUB_CODE" == "404" ]]; then
        # Fallback to legacy endpoint
        FALLBACK_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "$API_URL/api/subscriptions")
        if [[ "$FALLBACK_CODE" == "200" ]]; then
            echo "⚠️  OK (legacy fallback)"
        else
            echo "❌ FAIL (v0: $SUB_CODE, legacy: $FALLBACK_CODE)"
        fi
    else
        echo "❌ FAIL ($SUB_CODE)"
    fi
    
    # Test envelope format on v0 endpoint
    echo -n "Envelope Format (v0 response): "
    AUTH_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/api/v0/auth/status" 2>/dev/null || echo "{}")
    if echo "$AUTH_RESPONSE" | grep -q '"success".*"data".*"timestamp"'; then
        echo "✅ OK (envelope detected)"
    else
        echo "⚠️  PARTIAL (no envelope or endpoint not ready)"
    fi
    
else
    echo ""
    echo "⚠️  TOKEN not set - skipping authenticated tests"
    echo "   Set TOKEN environment variable to test authenticated endpoints"
fi

echo ""
echo "✅ Smoke tests completed"