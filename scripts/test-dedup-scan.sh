#!/bin/bash
# Test deduplication scan against production API

echo "📊 Testing Deduplication Scan"
echo ""
echo "Sending scan request to https://datum-lake.vercel.app/api/deduplication/scan..."
echo ""

curl -X POST https://datum-lake.vercel.app/api/deduplication/scan \
  -H "Content-Type: application/json" \
  -d '{
    "min_confidence": 0.75,
    "limit": 50
  }' | jq '.'
