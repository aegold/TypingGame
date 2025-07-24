#!/bin/bash

# Script to check environment configuration
echo "Environment Configuration Check"
echo "================================"

echo "Current directory: $(pwd)"
echo "NODE_ENV: ${NODE_ENV:-'not set'}"
echo "REACT_APP_API_URL: ${REACT_APP_API_URL:-'not set'}"
echo "REACT_APP_ENV: ${REACT_APP_ENV:-'not set'}"

echo ""
echo "Environment files:"
if [ -f ".env" ]; then
    echo "[OK] .env exists"
    echo "   Content preview:"
    head -3 .env | sed 's/^/   /'
else
    echo "[ERROR] .env not found"
fi

if [ -f ".env.development" ]; then
    echo "[OK] .env.development exists"
else
    echo "[ERROR] .env.development not found"
fi

if [ -f ".env.production" ]; then
    echo "[OK] .env.production exists"
else
    echo "[ERROR] .env.production not found"
fi

echo ""
echo "Available scripts:"
echo "   npm start           - Start development server"
echo "   npm run build       - Build for production"
echo "   npm run build:prod  - Build for production with production env"
