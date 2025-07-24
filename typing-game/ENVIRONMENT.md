# Environment Configuration Guide

## 📁 File Structure

```
typing-game/
├── .env                 # Base environment (development default)
├── .env.development     # Development specific
├── .env.production      # Production specific
└── check-env.sh         # Environment checking script
```

## 🌍 Environment Files

### `.env` (Development Default)

```bash
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENV=development
```

### `.env.development`

```bash
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENV=development
```

### `.env.production`

```bash
# Thay đổi URL này khi deploy
REACT_APP_API_URL=https://your-domain.com/api
REACT_APP_ENV=production
```

## 🚀 Scripts

```bash
# Development
npm start                 # Chạy với .env hoặc .env.development
npm run start:dev         # Explicitly development

# Production Build
npm run build             # Build thông thường
npm run build:prod        # Build với production environment

# Debug
npm run check-env         # Kiểm tra cấu hình môi trường
```

## 🔧 Configuration

### Development Mode

- API URL: `http://localhost:5000`
- Shows environment debugger (top-right corner)
- Console logs API URL

### Production Mode

- API URL: From `REACT_APP_API_URL` environment variable
- No debug information
- Optimized build

## 📝 How to Deploy

### 1. Development

```bash
npm start
```

### 2. Production Build

```bash
# Set your production API URL
export REACT_APP_API_URL=https://your-api-domain.com

# Or edit .env.production file
# Then build
npm run build:prod
```

### 3. Using with Nginx Proxy

If you're using nginx as reverse proxy:

**Option A: API on same domain**

```bash
REACT_APP_API_URL=/api
```

**Option B: Different subdomain**

```bash
REACT_APP_API_URL=https://api.your-domain.com
```

**Option C: Different port**

```bash
REACT_APP_API_URL=https://your-domain.com:5000
```

## 🐛 Debug

1. **Check current environment**:

   ```bash
   npm run check-env
   ```

2. **In development**, look for the debug panel in top-right corner

3. **Check console** for API URL logs (development only)

4. **Verify build variables**:
   ```bash
   # After build, check build/static/js files for your API URL
   grep -r "your-api-url" build/static/js/
   ```

## ⚠️ Security Notes

- Never commit `.env.production` with real credentials
- Use environment variables in CI/CD for production builds
- The `.env` files are for React app only (not server-side)
