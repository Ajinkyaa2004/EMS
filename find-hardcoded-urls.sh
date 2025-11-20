#!/bin/bash

# Script to find all hardcoded localhost URLs in the project

echo "🔍 Searching for hardcoded localhost URLs..."
echo ""

echo "📁 Frontend files with http://localhost:5000:"
echo "-------------------------------------------"
grep -r "http://localhost:5000" frontend/src/ --include="*.ts" --include="*.tsx" | wc -l | xargs echo "Total occurrences:"
grep -r "http://localhost:5000" frontend/src/ --include="*.ts" --include="*.tsx"

echo ""
echo "📁 Backend files with http://localhost:"
echo "---------------------------------------"
grep -r "http://localhost" backend/src/ --include="*.ts" | wc -l | xargs echo "Total occurrences:"
grep -r "http://localhost" backend/src/ --include="*.ts"

echo ""
echo "✅ All hardcoded URLs listed above need to be replaced!"
echo "📖 See VERCEL_DEPLOYMENT_GUIDE.md for instructions"
