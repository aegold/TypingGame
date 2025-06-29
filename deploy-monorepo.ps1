# Quick Deploy Script for Typing Game (PowerShell) - Monorepo Version
Write-Host "🚀 Quick Deploy Script for Typing Game" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green

function Write-Status($message) {
    Write-Host "✅ $message" -ForegroundColor Green
}

function Write-Warning($message) {
    Write-Host "⚠️  $message" -ForegroundColor Yellow
}

function Write-Error($message) {
    Write-Host "❌ $message" -ForegroundColor Red
}

# Check if we're in the right directory
if (-not (Test-Path "DEPLOYMENT.md")) {
    Write-Error "Please run this script from the project root directory"
    exit 1
}

Write-Status "Starting deployment process..."
Write-Host ""

Write-Host "📁 Repository Structure:" -ForegroundColor Cyan
Write-Host "Repository: https://github.com/aegold/TypingGame"
Write-Host "Backend: typing-game-backend/"
Write-Host "Frontend: typing-game/"
Write-Host ""

Write-Status "Code already available on GitHub!"
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host ""

Write-Host "🚂 1. Deploy Backend on Render:" -ForegroundColor Green
Write-Host "   - Go to render.com"
Write-Host "   - New + > Web Service"
Write-Host "   - Connect repository: aegold/TypingGame"
Write-Host "   - Root Directory: typing-game-backend"
Write-Host "   - Build Command: npm install"
Write-Host "   - Start Command: npm start"
Write-Host ""

Write-Host "⚡ 2. Deploy Frontend on Vercel:" -ForegroundColor Green
Write-Host "   - Go to vercel.com"
Write-Host "   - New Project"
Write-Host "   - Import repository: aegold/TypingGame"
Write-Host "   - Root Directory: typing-game"
Write-Host "   - Framework: Create React App"
Write-Host ""

Write-Host "🔧 3. Configure Environment Variables:" -ForegroundColor Green
Write-Host "   Backend (Render):"
Write-Host "   - MONGODB_URI"
Write-Host "   - JWT_SECRET"
Write-Host "   - FRONTEND_URL"
Write-Host "   - NODE_ENV=production"
Write-Host "   - PORT=10000"
Write-Host ""
Write-Host "   Frontend (Vercel):"
Write-Host "   - REACT_APP_API_URL=https://your-backend.onrender.com/api"
Write-Host ""
Write-Status "For detailed instructions, check DEPLOYMENT.md"
