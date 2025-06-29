#!/bin/bash

echo "🚀 Quick Deploy Script for Typing Game"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "DEPLOYMENT.md" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Starting deployment process..."

echo ""
echo "� Repository Structure:"
echo "Repository: https://github.com/aegold/TypingGame"
echo "Backend: typing-game-backend/"
echo "Frontend: typing-game/"
echo ""

print_status "Code already available on GitHub!"
echo ""
echo "📋 Next Steps:"
echo ""
echo "🚂 1. Deploy Backend on Render:"
echo "   - Go to render.com"
echo "   - New + > Web Service"
echo "   - Connect repository: aegold/TypingGame"
echo "   - Root Directory: typing-game-backend"
echo "   - Build Command: npm install"
echo "   - Start Command: npm start"
echo ""
echo "⚡ 2. Deploy Frontend on Vercel:"
echo "   - Go to vercel.com"
echo "   - New Project"
echo "   - Import repository: aegold/TypingGame"
echo "   - Root Directory: typing-game"
echo "   - Framework: Create React App"
echo ""
echo "🔧 3. Configure Environment Variables:"
echo "   Backend (Render):"
echo "   - MONGODB_URI"
echo "   - JWT_SECRET"
echo "   - FRONTEND_URL"
echo "   - NODE_ENV=production"
echo "   - PORT=10000"
echo ""
echo "   Frontend (Vercel):"
echo "   - REACT_APP_API_URL=https://your-backend.onrender.com/api"
echo ""
print_status "For detailed instructions, check DEPLOYMENT.md"
