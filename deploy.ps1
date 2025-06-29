# Quick Deploy Script for Typing Game (PowerShell)
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

# Backend deployment preparation
Write-Host ""
Write-Host "📦 Preparing Backend..." -ForegroundColor Cyan
Set-Location "typing-game-backend"

# Check if package.json exists
if (-not (Test-Path "package.json")) {
    Write-Error "package.json not found in backend directory"
    exit 1
}

# Initialize git if not already initialized
if (-not (Test-Path ".git")) {
    Write-Status "Initializing git for backend..."
    git init
    git add .
    git commit -m "Initial commit for Render deployment"
} else {
    Write-Warning "Git already initialized in backend"
}

Set-Location ".."

# Frontend deployment preparation
Write-Host ""
Write-Host "🎨 Preparing Frontend..." -ForegroundColor Cyan
Set-Location "typing-game"

# Check if package.json exists
if (-not (Test-Path "package.json")) {
    Write-Error "package.json not found in frontend directory"
    exit 1
}

# Initialize git if not already initialized
if (-not (Test-Path ".git")) {
    Write-Status "Initializing git for frontend..."
    git init
    git add .
    git commit -m "Initial commit for Vercel deployment"
} else {
    Write-Warning "Git already initialized in frontend"
}

Set-Location ".."

Write-Status "Deployment preparation completed!"
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Create GitHub repositories:"
Write-Host "   - typing-game-backend"
Write-Host "   - typing-game-frontend"
Write-Host ""
Write-Host "2. Push code to GitHub:"
Write-Host "   Backend:"
Write-Host "   cd typing-game-backend"
Write-Host "   git remote add origin https://github.com/yourusername/typing-game-backend.git"
Write-Host "   git branch -M main"
Write-Host "   git push -u origin main"
Write-Host ""
Write-Host "   Frontend:"
Write-Host "   cd typing-game"
Write-Host "   git remote add origin https://github.com/yourusername/typing-game-frontend.git"
Write-Host "   git branch -M main"
Write-Host "   git push -u origin main"
Write-Host ""
Write-Host "3. Deploy on Render (Backend):"
Write-Host "   - Go to render.com"
Write-Host "   - New + > Web Service"
Write-Host "   - Connect GitHub and select typing-game-backend repo"
Write-Host ""
Write-Host "4. Deploy on Vercel (Frontend):"
Write-Host "   - Go to vercel.com"
Write-Host "   - New Project > Import Git Repository"
Write-Host "   - Select typing-game-frontend repo"
Write-Host ""
Write-Host "5. Configure Environment Variables (see DEPLOYMENT.md for details)"
Write-Host ""
Write-Status "For detailed instructions, check DEPLOYMENT.md"
