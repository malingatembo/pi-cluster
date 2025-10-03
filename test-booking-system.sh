#!/bin/bash

# Comprehensive Booking System Test Suite
# Run all tests and generate report

BASE_URL="http://10.0.0.100"
API_URL="${BASE_URL}/booking-api"
ADMIN_URL="${BASE_URL}/admin-panel"

echo "=========================================="
echo "Shuma Booking System - Test Suite"
echo "=========================================="
echo ""

# Test 1: Backend Health
echo "Test 1: Backend API Health Check"
echo "-----------------------------------"
HEALTH=$(curl -s ${API_URL}/api/health)
if echo "$HEALTH" | jq -e '.status == "healthy"' > /dev/null 2>&1; then
    echo "✅ PASS - Backend is healthy"
    echo "$HEALTH" | jq .
else
    echo "❌ FAIL - Backend health check failed"
    echo "$HEALTH"
fi
echo ""

# Test 2: Admin Login
echo "Test 2: Admin Login"
echo "-----------------------------------"
LOGIN_RESPONSE=$(curl -s -X POST ${API_URL}/api/admin/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}')

if echo "$LOGIN_RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
    echo "✅ PASS - Admin login successful"
    TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
    echo "Token: ${TOKEN:0:50}..."
else
    echo "❌ FAIL - Admin login failed"
    echo "$LOGIN_RESPONSE" | jq .
    exit 1
fi
echo ""

# Test 3: Create Booking
echo "Test 3: Create Booking via API"
echo "-----------------------------------"
BOOKING_RESPONSE=$(curl -s -X POST ${API_URL}/api/bookings \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Test User",
        "email": "test@example.cz",
        "phone": "+420 987 654 321",
        "service": "swedish",
        "duration": 60,
        "preferred_date": "2025-10-20",
        "preferred_time": "10:00",
        "message": "Automated test booking"
    }')

if echo "$BOOKING_RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
    echo "✅ PASS - Booking created successfully"
    BOOKING_ID=$(echo "$BOOKING_RESPONSE" | jq -r '.booking.id')
    echo "Booking ID: $BOOKING_ID"
    echo "$BOOKING_RESPONSE" | jq '.booking'
else
    echo "❌ FAIL - Booking creation failed"
    echo "$BOOKING_RESPONSE" | jq .
fi
echo ""

# Test 4: Get Admin Statistics
echo "Test 4: Admin Statistics"
echo "-----------------------------------"
STATS_RESPONSE=$(curl -s ${API_URL}/api/admin/stats \
    -H "Authorization: Bearer $TOKEN")

if echo "$STATS_RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
    echo "✅ PASS - Statistics retrieved"
    echo "$STATS_RESPONSE" | jq '.stats'
else
    echo "❌ FAIL - Statistics retrieval failed"
    echo "$STATS_RESPONSE" | jq .
fi
echo ""

# Test 5: Get All Bookings
echo "Test 5: Get All Bookings (Admin)"
echo "-----------------------------------"
BOOKINGS_RESPONSE=$(curl -s "${API_URL}/api/admin/bookings?limit=10" \
    -H "Authorization: Bearer $TOKEN")

if echo "$BOOKINGS_RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
    echo "✅ PASS - Bookings retrieved"
    BOOKING_COUNT=$(echo "$BOOKINGS_RESPONSE" | jq '.total')
    echo "Total bookings: $BOOKING_COUNT"
    echo "$BOOKINGS_RESPONSE" | jq '.bookings[] | {id, name, service, status}'
else
    echo "❌ FAIL - Bookings retrieval failed"
    echo "$BOOKINGS_RESPONSE" | jq .
fi
echo ""

# Test 6: Update Booking Status
echo "Test 6: Update Booking Status"
echo "-----------------------------------"
if [ ! -z "$BOOKING_ID" ]; then
    UPDATE_RESPONSE=$(curl -s -X PATCH ${API_URL}/api/admin/bookings/${BOOKING_ID} \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"status":"confirmed"}')

    if echo "$UPDATE_RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
        echo "✅ PASS - Booking status updated to 'confirmed'"
        echo "$UPDATE_RESPONSE" | jq '.booking | {id, name, status}'
    else
        echo "❌ FAIL - Booking update failed"
        echo "$UPDATE_RESPONSE" | jq .
    fi
else
    echo "⚠️  SKIP - No booking ID available"
fi
echo ""

# Test 7: Database Persistence
echo "Test 7: Database Persistence Check"
echo "-----------------------------------"
DB_CHECK=$(kubectl exec -n shuma-website $(kubectl get pod -n shuma-website -l app=shuma-postgres -o jsonpath='{.items[0].metadata.name}') -- psql -U shuma_admin -d shuma_bookings -t -c "SELECT COUNT(*) FROM bookings;" 2>/dev/null)

if [ ! -z "$DB_CHECK" ]; then
    DB_COUNT=$(echo "$DB_CHECK" | tr -d ' ')
    echo "✅ PASS - Database accessible"
    echo "Total bookings in database: $DB_COUNT"
else
    echo "❌ FAIL - Database check failed"
fi
echo ""

# Test 8: Admin Panel Accessibility
echo "Test 8: Admin Panel Web Access"
echo "-----------------------------------"
ADMIN_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" ${ADMIN_URL})

if [ "$ADMIN_RESPONSE" = "200" ]; then
    echo "✅ PASS - Admin panel accessible"
    echo "URL: ${ADMIN_URL}"
else
    echo "❌ FAIL - Admin panel returned HTTP $ADMIN_RESPONSE"
fi
echo ""

# Test 9: Main Website Accessibility
echo "Test 9: Main Website Access"
echo "-----------------------------------"
WEBSITE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" ${BASE_URL}/shuma)

if [ "$WEBSITE_RESPONSE" = "200" ]; then
    echo "✅ PASS - Website accessible"
    echo "URL: ${BASE_URL}/shuma"
else
    echo "❌ FAIL - Website returned HTTP $WEBSITE_RESPONSE"
fi
echo ""

# Summary
echo "=========================================="
echo "Test Suite Complete"
echo "=========================================="
echo ""
echo "Access Points:"
echo "  - Main Website:   ${BASE_URL}/shuma"
echo "  - Admin Panel:    ${ADMIN_URL}"
echo "  - Backend API:    ${API_URL}"
echo ""
echo "Admin Credentials:"
echo "  - Username: admin"
echo "  - Password: admin123"
echo ""
