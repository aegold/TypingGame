# Typing Game - Deployment Guide

---

## ✅ DEPLOYMENT STATUS - READY FOR PRODUCTION

**Last Updated:** $(Get-Date -Format "yyyy-MM-dd HH:mm")

**All Issues Fixed:**
- ✅ Missing `public` folder issue resolved
- ✅ CORS configuration fixed
- ✅ API endpoint mismatches corrected (all use `/api` prefix)
- ✅ Environment variables documented
- ✅ Deployment troubleshooting guide added

---

## 🎯 Quick Start - Monorepo Deployment

Repository: `https://github.com/aegold/TypingGame`

### ⚡ Quick Steps:

1. **Render (Backend):**

   - Repository: `aegold/TypingGame`
   - Root Directory: `typing-game-backend`
   - Build: `npm install`
   - Start: `npm start`

2. **Vercel (Frontend):**

   - Repository: `aegold/TypingGame`
   - Root Directory: `typing-game`
   - Framework: Create React App

3. **Environment Variables (QUAN TRỌNG):**

   **Backend (Render) - Add vào Environment tab:**

   ```bash
   MONGODB_URI=mongodb+srv://aegold:bishe123@cluster0.y3dcdi3.mongodb.net/typing-game?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=typing-game-super-secret-jwt-key-2024-production-render-deployment
   FRONTEND_URL=https://typing-game-fe.vercel.app
   NODE_ENV=production
   PORT=10000
   ```

   **Frontend (Vercel) - Add vào Environment Variables:**

   ```bash
   REACT_APP_API_URL=https://typing-game-backend-oegb.onrender.com/api
   ```

   ⚠️ **CRITICAL:** 
   - `MONGODB_URI` phải có `mongodb+srv://` ở đầu!
   - `FRONTEND_URL` phải match EXACT domain Vercel!
   - `REACT_APP_API_URL` phải match EXACT domain Render!

🚀 **Script hỗ trợ:** Chạy `./deploy-monorepo.ps1` hoặc `./deploy.sh` để xem hướng dẫn chi tiết.

---

## 📋 FINAL DEPLOYMENT CHECKLIST

### Before Deploying:
- [ ] All code pushed to GitHub: `https://github.com/aegold/TypingGame`
- [ ] Backend environment variables set on Render
- [ ] Frontend environment variables set on Vercel
- [ ] Verify `FRONTEND_URL` matches exact Vercel domain

### After Deploying:
- [ ] Backend health check: `https://typing-game-backend-oegb.onrender.com/health`
- [ ] Frontend loads: `https://typing-game-fe.vercel.app`
- [ ] Test registration: Create new account
- [ ] Test login: Login with created account
- [ ] Test lessons: Access lessons page and play game
- [ ] Check browser console for CORS/404 errors

### If Issues Occur:
1. **CORS Error:** Check `FRONTEND_URL` on Render matches exact Vercel domain
2. **404 API Errors:** All API calls now use `/api` prefix (fixed)
3. **Build Failures:** Check Root Directory settings and environment variables

---

## 🚀 Deploy lên Render (Backend) và Vercel (Frontend)

### 📋 Yêu cầu trước khi deploy

1. **GitHub account**
2. **Render account** (đăng ký tại [render.com](https://render.com))
3. **Vercel account** (đăng ký tại [vercel.com](https://vercel.com))
4. **MongoDB Atlas account** (đăng ký tại [mongodb.com/atlas](https://mongodb.com/atlas))

---

## 🗄️ Bước 1: Chuẩn bị MongoDB Atlas (Chi tiết)

### 📋 Hướng dẫn từng bước:

**Bước 1.1: Tạo Account & Cluster**

1. **Đăng nhập MongoDB Atlas** tại [mongodb.com/atlas](https://mongodb.com/atlas)
2. **Tạo organization & project** (nếu chưa có)
3. **Tạo cluster mới:**
   - Chọn **"Build a Database"**
   - Chọn **"M0 Sandbox"** (Free tier)
   - Chọn provider: **AWS/Google Cloud/Azure**
   - Chọn region gần Vietnam: **Singapore (ap-southeast-1)**
   - Cluster name: `Cluster0` (default)
   - Click **"Create Cluster"**

**Bước 1.2: Tạo Database User**

1. **Trong cluster dashboard, click "Database Access"**
2. **Click "Add New Database User"**
3. **Authentication Method:** Password
4. **Username:** `aegold`
5. **Password:** `bishe123` (hoặc generate random)
6. **Database User Privileges:**
   - Chọn **"Read and write to any database"**
   - Hoặc **"Atlas admin"** cho full access
7. **Click "Add User"**

**Bước 1.3: Network Access (Whitelist IPs)**

1. **Click "Network Access" ở sidebar**
2. **Click "Add IP Address"**
3. **Có 3 options:**
   ```
   Option 1: Add Current IP Address (chỉ máy bạn)
   Option 2: Allow Access from Anywhere (0.0.0.0/0) ← CHỌN CÁI NÀY
   Option 3: Add IP Address (nhập manual)
   ```
4. **Chọn "Allow Access from Anywhere"**
5. **Comment:** `Render + Vercel deployment`
6. **Click "Confirm"**

   **Kết quả:** Sẽ thấy entry như này:

   ```
   IP Address: 0.0.0.0/0
   Comment: Render + Vercel deployment
   Status: Active
   ```

**Bước 1.4: Get Connection String**

1. **Quay lại "Database" > "Clusters"**
2. **Click "Connect" trên cluster**
3. **Chọn "Connect your application"**
4. **Driver:** Node.js, Version: 4.1 or later
5. **Copy connection string:**
   ```
   mongodb+srv://aegold:<password>@cluster0.y3dcdi3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```
6. **Replace `<password>` với `bishe123`:**
   ```
   mongodb+srv://aegold:bishe123@cluster0.y3dcdi3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```
7. **Thêm database name `/typing-game`:**
   ```
   mongodb+srv://aegold:bishe123@cluster0.y3dcdi3.mongodb.net/typing-game?retryWrites=true&w=majority&appName=Cluster0
   ```

---

## 🔍 Bước 1 (Cách ngắn gọn)

1. **Đăng nhập MongoDB Atlas** tại [mongodb.com/atlas](https://mongodb.com/atlas)
2. **Tạo cluster mới** (chọn Free tier M0)
3. **Tạo database user:**
   - Username: `aegold`
   - Password: `bishe123` (hoặc password mạnh hơn)
   - Role: `Atlas admin` hoặc `Read and write to any database`
4. **Whitelist IP addresses (Network Access):**

   **Cách làm:**

   - Trong MongoDB Atlas dashboard, click **"Network Access"** ở sidebar trái
   - Click **"Add IP Address"**
   - Chọn **"Allow Access from Anywhere"**
   - Hoặc nhập manually: `0.0.0.0/0`
   - Click **"Confirm"**

   **Giải thích:**

   - `0.0.0.0/0` = Cho phép tất cả IP addresses kết nối
   - Cần thiết vì Render sử dụng dynamic IPs
   - Trong production thật nên giới hạn IP cụ thể để bảo mật hơn

   **Alternative (Bảo mật hơn):**

   - Chỉ add IP ranges của Render nếu biết cụ thể
   - Nhưng `0.0.0.0/0` đơn giản hơn cho development

5. **Tạo database:**
   - Database name: `typing-game`
   - Collection name: `lessons` (sẽ tự tạo khi seed data)
6. **Copy connection string:**
   ```
   mongodb+srv://aegold:bishe123@cluster0.y3dcdi3.mongodb.net/typing-game?retryWrites=true&w=majority&appName=Cluster0
   ```

⚠️ **Bảo mật:** Trong production thật, nên:

- Dùng password phức tạp hơn
- Hạn chế IP access thay vì 0.0.0.0/0
- Tạo user riêng cho từng ứng dụng

---

## 🚂 Bước 2: Deploy Backend lên Render

### 2.1. Chuẩn bị code

⚠️ **Lưu ý:** Repository đã tồn tại tại: `https://github.com/aegold/TypingGame`

Code đã sẵn sàng deploy, bao gồm cả frontend và backend trong cùng 1 repository.

Cấu trúc repository:

```
TypingGame/
├── typing-game/          (Frontend - React)
├── typing-game-backend/  (Backend - Node.js)
└── DEPLOYMENT.md
```

### 2.2. Deploy trên Render

1. **Đăng nhập [render.com](https://render.com)**
2. **Click "New +" > "Web Service"**
3. **Connect Repository:**
   - Chọn **"Connect to GitHub"**
   - Authorize Render to access GitHub
   - Chọn repository `aegold/TypingGame`
4. **Cấu hình Service:**
   - **Name:** `typing-game-backend`
   - **Region:** Oregon (US West) hoặc Frankfurt (EU Central)
   - **Branch:** `main`
   - **Root Directory:** `typing-game-backend` ← **QUAN TRỌNG**
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. **Click "Create Web Service"**

⚠️ **Quan trọng:** Phải set **Root Directory** = `typing-game-backend` vì backend nằm trong subfolder.

### 2.3. Cấu hình Environment Variables

Trong Render dashboard, vào **Environment** tab và thêm:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/typing-game?retryWrites=true&w=majority
JWT_SECRET=typing-game-super-secret-jwt-key-2024-production-render-deployment
FRONTEND_URL=https://your-frontend-app.vercel.app
NODE_ENV=production
PORT=10000
```

**💡 Về JWT_SECRET:**

- **Là gì:** Chuỗi bí mật để ký JWT tokens cho authentication
- **Tự tạo:** Bạn có thể dùng giá trị trên hoặc tạo random string ít nhất 32 ký tự
- **Bảo mật:** KHÔNG bao giờ commit vào Git, chỉ lưu trong environment variables

**🎲 Cách tạo JWT_SECRET mới (tùy chọn):**

```bash
# Cách 1: Sử dụng Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Cách 2: Sử dụng PowerShell
[System.Web.Security.Membership]::GeneratePassword(64, 0)

# Cách 3: Online generator (search "JWT secret generator")
```

**Ví dụ MONGODB_URI thực tế:**

```
MONGODB_URI=mongodb+srv://aegold:bishe123@cluster0.y3dcdi3.mongodb.net/typing-game?retryWrites=true&w=majority&appName=Cluster0
```

⚠️ **Lưu ý quan trọng về MongoDB URI:**

- Phải có tên database (`/typing-game`) sau cluster name
- Nếu không có tên database, sẽ kết nối tới database mặc định `test`
- Đảm bảo user `aegold` có quyền read/write trên database `typing-game`

⚠️ **Lưu ý về Render:**

- **PORT=10000** - Render yêu cầu port cụ thể
- **Free tier** có giới hạn 750 hours/month
- Service sẽ "sleep" sau 15 phút không hoạt động (cold start ~30 giây)
- Database connections có thể timeout do cold start - backend cần handle reconnection

### 2.4. Custom Domain (Optional)

- Trong Render, vào **Settings** > **Custom Domains**
- Sẽ có domain tự động: `https://your-app-name.onrender.com`

---

## ⚡ Bước 3: Deploy Frontend lên Vercel

### 3.1. Chuẩn bị code

⚠️ **Lưu ý:** Sử dụng cùng repository: `https://github.com/aegold/TypingGame`

Frontend nằm trong thư mục `typing-game/` của repository.

### 3.2. Deploy trên Vercel

1. **Đăng nhập [vercel.com](https://vercel.com)**
2. **Click "New Project"**
3. **Import repository:**
   - Chọn repository `aegold/TypingGame`
   - **Root Directory:** `typing-game` ← **QUAN TRỌNG**
4. **Cấu hình Project:**
   - **Project Name:** `typing-game-frontend`
   - **Framework Preset:** `Create React App`
   - **Root Directory:** `typing-game` (confirm lại)
5. **Click "Deploy"**

⚠️ **Quan trọng:** Phải set **Root Directory** = `typing-game` vì frontend nằm trong subfolder.

### 3.3. Cấu hình Environment Variables

Trong Vercel dashboard, vào **Settings** > **Environment Variables**:

```
REACT_APP_API_URL=https://your-backend-app.onrender.com/api
```

### 3.4. Redeploy

Sau khi thêm environment variables, click **"Redeploy"**

---

## 🔧 Bước 4: Cấu hình CORS

⚠️ **CRITICAL:** FRONTEND_URL phải match EXACT domain của Vercel

1. **Get exact Vercel domain:**
   - Vào Vercel Dashboard > Project > Settings > Domains
   - Copy domain, ví dụ: `https://typing-game-fe.vercel.app`

2. **Update FRONTEND_URL trên Render:**
   ```
   FRONTEND_URL=https://typing-game-fe.vercel.app
   ```
   (Thay thế bằng domain thực tế của bạn)

3. **Save Changes** - Render sẽ auto-restart service

⚠️ **Common mistake:** Domain không khớp sẽ gây CORS policy error

---

## 📊 Bước 5: Seed Database (Optional)

1. Trong Render dashboard, vào **Environment** tab
2. Click vào latest deployment
3. Vào **Shell** tab hoặc sử dụng Render CLI
4. Run command: `npm run seed`

Hoặc dùng Render CLI:

```bash
# Render CLI installation and usage
npm install -g @render/cli
render auth login
render shell
npm run seed
```

---

## 🔍 Bước 6: Test Deployment

1. Truy cập frontend URL: `https://your-app-name.vercel.app`
2. Test các chức năng:
   - Đăng ký tài khoản
   - Đăng nhập
   - Chơi game
   - Lưu điểm

---

## 🛠️ Troubleshooting

### Backend không kết nối được database:

**Lỗi thường gặp:**

```
MongoNetworkError: connection refused
MongooseServerSelectionError: Could not connect to any servers
```

### Backend không kết nối được database:

**Lỗi thường gặp:**

```
MongoNetworkError: connection refused
MongooseServerSelectionError: Could not connect to any servers
MongoParseError: Invalid connection string
Error: Authentication failed
```

**Giải pháp theo thứ tự ưu tiên:**

**1. Network Access (IP Whitelist) - Lỗi phổ biến nhất:**

- ✅ Vào MongoDB Atlas > **Network Access**
- ✅ Phải có entry: `0.0.0.0/0` với status **Active**
- ✅ Nếu chưa có, click **"Add IP Address"** > **"Allow Access from Anywhere"**
- ✅ Đợi 1-2 phút để changes take effect

**2. Connection String Format:**

- ✅ Phải có database name: `/typing-game`
- ✅ Format đúng:
  ```
  mongodb+srv://aegold:bishe123@cluster0.y3dcdi3.mongodb.net/typing-game?retryWrites=true&w=majority
  ```
- ✅ Không được có spaces hoặc newlines

**3. Database User Permissions:**

- ✅ Vào MongoDB Atlas > **Database Access**
- ✅ User `aegold` phải có role: **"Read and write to any database"**
- ✅ Password phải chính xác: `bishe123`

**4. Test Connection:**

- ✅ Download **MongoDB Compass**
- ✅ Test connection string trước khi deploy
- ✅ Nếu Compass connect được thì deployment cũng sẽ work

**5. Render Logs:**

- ✅ Check Render > Dashboard > Service > Logs
- ✅ Tìm error message cụ thể về MongoDB connection

### Frontend không gọi được API:

**Lỗi thường gặp:**

```
Network Error
CORS policy error
```

**Giải pháp:**

- ✅ Verify REACT_APP_API_URL trong Vercel (phải có `/api` ở cuối)
- ✅ Check CORS configuration trong Render (FRONTEND_URL phải khớp domain Vercel)
- ✅ Check Network tab trong browser DevTools
- ✅ Verify Render backend đang chạy (check logs)

### ❌ CORS Policy Error - Access-Control-Allow-Origin:

**Error message cụ thể:**
```
Access to XMLHttpRequest at 'https://typing-game-backend-oegb.onrender.com/register' 
from origin 'https://typing-game-fe.vercel.app' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
The 'Access-Control-Allow-Origin' header has a value 'https://typing-game.vercel.app' 
that is not equal to the supplied origin.
```

**🔍 Nguyên nhân:**
- Backend CORS được cấu hình cho domain khác với frontend actual domain
- `FRONTEND_URL` trên Render không khớp với Vercel deployment URL

**💡 Cách fix ngay:**

1. **Kiểm tra domain Vercel thực tế:**
   - Vào Vercel Dashboard > Project > Settings > Domains
   - Copy exact URL: `https://typing-game-fe.vercel.app`

2. **Cập nhật FRONTEND_URL trên Render:**
   - Vào Render Dashboard > Service > Environment
   - Edit `FRONTEND_URL` = `https://typing-game-fe.vercel.app`
   - Click "Save Changes"

3. **Service sẽ auto-restart**, check logs để verify

**✅ Verify fix:**
- Backend logs không có CORS errors
- Frontend có thể call API thành công
- Registration/login hoạt động

**🚨 Alternative domains:**
Nếu có multiple Vercel domains, có thể set multiple origins trong backend code:
```javascript
// Trong index.js backend
const allowedOrigins = [
  'https://typing-game-fe.vercel.app',
  'https://typing-game.vercel.app', 
  'http://localhost:3000'
];
```

### Render deployment failed:

**Lỗi thường gặp:**

```
Build failed
Start command not found
Service unavailable (503)
```

**Giải pháp:**

- ✅ Check logs trong Render dashboard > Service > Logs
- ✅ Verify package.json có script `"start": "node index.js"`
- ✅ Check Node version compatibility (sử dụng Node 16+)
- ✅ Ensure tất cả dependencies được install
- ✅ Verify PORT environment variable = 10000
- ✅ Backend phải listen trên `process.env.PORT || 10000`

### Render Cold Start Issues:

**Lỗi:**

```
Service sleeping - first request slow
MongoDB connection timeout on cold start
```

**Giải pháp:**

- ✅ Implement MongoDB reconnection logic
- ✅ Set MongoDB connectTimeoutMS = 30000
- ✅ Add health check endpoint `/health`
- ✅ Consider upgrading to paid plan để tránh cold start

---

## 🔐 Environment Variables Explained

### **Backend (Render) Environment Variables:**

| Variable       | Mô tả                                  | Ví dụ                                                                                                |
| -------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `MONGODB_URI`  | Connection string tới MongoDB Atlas    | `mongodb+srv://aegold:bishe123@cluster0.y3dcdi3.mongodb.net/typing-game?retryWrites=true&w=majority` |
| `JWT_SECRET`   | Chuỗi bí mật để ký JWT tokens (tự tạo) | `typing-game-super-secret-jwt-key-2024-production-render-deployment`                                 |
| `FRONTEND_URL` | URL của frontend trên Vercel           | `https://typing-game-frontend.vercel.app`                                                            |
| `NODE_ENV`     | Môi trường runtime                     | `production`                                                                                         |
| `PORT`         | Port mà Render yêu cầu                 | `10000`                                                                                              |

### **Frontend (Vercel) Environment Variables:**

| Variable            | Mô tả                           | Ví dụ                                          |
| ------------------- | ------------------------------- | ---------------------------------------------- |
| `REACT_APP_API_URL` | URL của backend API trên Render | `https://typing-game-backend.onrender.com/api` |

### **🛡️ Bảo mật Environment Variables:**

- ✅ **KHÔNG** commit file `.env` vào Git
- ✅ Sử dụng `.env.example` để hướng dẫn
- ✅ JWT_SECRET phải dài ít nhất 32 ký tự
- ✅ Mỗi environment (dev/prod) nên có JWT_SECRET khác nhau
- ✅ MONGODB_URI chứa password - giữ bí mật

### **📝 Cách tạo JWT_SECRET mạnh:**
