# Hướng dẫn Setup Project Typing Game

## Yêu cầu hệ thống

Trước khi bắt đầu, đảm bảo máy tính của bạn đã cài đặt:

- **Node.js** (phiên bản 16.0.0 trở lên)
- **npm** (thường đi kèm với Node.js)
- **MongoDB** (có thể cài local hoặc sử dụng MongoDB Atlas)
- **Git** (để clone project)

## Bước 1: Cài đặt Node.js và npm

### Windows:

1. Truy cập [https://nodejs.org/](https://nodejs.org/)
2. Tải về phiên bản LTS
3. Chạy file installer và làm theo hướng dẫn
4. Kiểm tra cài đặt:

```bash
node --version
npm --version
```

### macOS:

```bash
# Sử dụng Homebrew
brew install node

# Hoặc tải từ trang chủ như Windows
```

### Ubuntu/Linux:

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## Bước 2: Cài đặt MongoDB

### Option 1: MongoDB Local (Recommended cho development)

#### Windows:

1. Truy cập [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Tải MongoDB Community Server
3. Chạy installer và làm theo hướng dẫn
4. Khởi động MongoDB service

#### macOS:

```bash
# Sử dụng Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Ubuntu/Linux:

```bash
# Import public key
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -

# Create list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Option 2: MongoDB Atlas (Cloud - Miễn phí)

1. Truy cập [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Tạo tài khoản miễn phí
3. Tạo cluster mới
4. Lấy connection string

## Bước 3: Clone Project

```bash
# Clone repository
git clone https://github.com/aegold/TypingGame.git

# Di chuyển vào thư mục project
cd TypingGame
```

## Bước 4: Setup Backend

```bash
# Di chuyển vào thư mục backend
cd typing-game-backend

# Cài đặt dependencies
npm install
```

### Tạo file .env cho Backend

Tạo file `.env` trong thư mục `typing-game-backend` với nội dung:

```env
# MongoDB Connection
# Nếu dùng MongoDB local:
MONGODB_URI=mongodb://localhost:27017/typing-game

# Nếu dùng MongoDB Atlas, thay thế bằng connection string của bạn:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/typing-game

# JWT Secret (thay đổi thành chuỗi bảo mật của riêng bạn)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend URL (cho CORS)
FRONTEND_URL=http://localhost:3000

# Server Port
PORT=5000
```

### Tạo Admin User

```bash
# Chạy script tạo admin user
node createAdmin.js
```

**Thông tin đăng nhập admin:**

- Username: `admin1`
- Password: `admin123`

### Seed dữ liệu mẫu (Tùy chọn)

```bash
# Tạo dữ liệu lesson mẫu
node seedLessons.js
```

### Khởi động Backend

```bash
# Khởi động server (development mode)
npm run dev

# Hoặc khởi động bình thường
npm start
```

Backend sẽ chạy tại: `http://localhost:5000`

## Bước 5: Setup Frontend

Mở terminal/command prompt mới:

```bash
# Di chuyển vào thư mục frontend (từ thư mục gốc của project)
cd typing-game

# Cài đặt dependencies
npm install

# Khởi động frontend
npm start
```

Frontend sẽ chạy tại: `http://localhost:3000`

## Bước 6: Kiểm tra Project

1. **Kiểm tra Backend**: Truy cập `http://localhost:5000` - bạn sẽ thấy thông báo API đang chạy

2. **Kiểm tra Frontend**: Truy cập `http://localhost:3000` - bạn sẽ thấy trang đăng nhập

3. **Test đăng nhập Admin**:
   - Truy cập `http://localhost:3000`
   - Đăng nhập với `admin1` / `admin123`
   - Sau khi đăng nhập, truy cập `http://localhost:3000/admin` để vào admin dashboard

## Cấu trúc Project

```
TypingGame/
├── typing-game/                 # Frontend (React)
│   ├── public/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/             # Pages (Login, Game, Admin, etc.)
│   │   ├── styles/            # CSS files
│   │   ├── hooks/             # Custom hooks
│   │   ├── utils/             # Utility functions
│   │   └── constants/         # Constants
│   ├── package.json
│   └── ...
├── typing-game-backend/         # Backend (Node.js + Express)
│   ├── models/                # MongoDB models
│   ├── routes/                # API routes
│   ├── middleware/            # Auth middleware
│   ├── index.js               # Main server file
│   ├── createAdmin.js         # Script tạo admin
│   ├── seedLessons.js         # Script seed data
│   ├── package.json
│   └── ...
└── README.md
```

## Các lệnh hữu ích

### Backend Commands:

```bash
cd typing-game-backend

# Khởi động development mode (auto-restart khi có thay đổi)
npm run dev

# Khởi động production mode
npm start

# Tạo admin user mới
node createAdmin.js

# Seed dữ liệu mẫu
node seedLessons.js
```

### Frontend Commands:

```bash
cd typing-game

# Khởi động development server
npm start

# Build cho production
npm run build

# Chạy tests
npm test
```

## Tính năng chính

### Cho Users:

- **Đăng ký/Đăng nhập**: Tạo tài khoản và đăng nhập
- **4 loại game typing**:
  - Letter Typing: Gõ từng chữ cái
  - Word Typing: Gõ từ hoàn chỉnh
  - Paragraph Typing: Gõ đoạn văn
  - Vietnamese Telex: Học gõ Telex tiếng Việt
- **Lessons**: Bài học được phân loại theo categories
- **Scoring**: Hệ thống tính điểm dựa trên tốc độ và độ chính xác
- **Visual/Audio**: Bàn phím ảo, hướng dẫn ngón tay, âm thanh

### Cho Admin:

- **Quản lý Categories**: Tạo, sửa, xóa danh mục bài học
- **Quản lý Lessons**: Tạo, sửa, xóa bài học
- **Video hướng dẫn**: Thêm video YouTube cho bài học
- **Thống kê**: Xem số lượng users và lessons

## Troubleshooting

### Lỗi MongoDB Connection:

```bash
# Kiểm tra MongoDB có đang chạy không
# Windows:
net start MongoDB

# macOS:
brew services start mongodb-community

# Linux:
sudo systemctl start mongod
```

### Lỗi Port đã được sử dụng:

```bash
# Kiểm tra process đang dùng port 5000
# Windows:
netstat -ano | findstr :5000

# macOS/Linux:
lsof -i :5000

# Kill process nếu cần
# Windows:
taskkill /PID <PID> /F

# macOS/Linux:
kill -9 <PID>
```

### Lỗi npm install:

```bash
# Xóa node_modules và package-lock.json, sau đó cài lại
rm -rf node_modules package-lock.json
npm install

# Hoặc sử dụng npm cache clean
npm cache clean --force
npm install
```

### Lỗi CORS:

- Đảm bảo `FRONTEND_URL` trong file `.env` của backend đúng
- Kiểm tra frontend đang chạy đúng port (3000)

## Hỗ trợ

Nếu gặp vấn đề, hãy kiểm tra:

1. Console browser (F12) cho lỗi frontend
2. Terminal backend cho lỗi API
3. MongoDB logs
4. Network tab trong DevTools cho API calls
