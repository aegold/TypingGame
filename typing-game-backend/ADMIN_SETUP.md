# Hướng dẫn Setup Admin Dashboard

## 1. Tạo file .env

Tạo file `.env` trong thư mục `typing-game-backend` với nội dung:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/typing-game

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Server Port
PORT=5000
```

## 2. Tạo Admin User

Chạy script để tạo admin user:

```bash
cd typing-game-backend
node createAdmin.js
```

Thông tin đăng nhập admin:

- Username: `admin`
- Password: `admin123`

## 3. Seed dữ liệu mẫu (tùy chọn)

Chạy script để tạo dữ liệu lesson mẫu:

```bash
node seedLessons.js
```

## 4. Khởi động Backend

```bash
npm start
# hoặc
node index.js
```

## 5. Khởi động Frontend

```bash
cd ../typing-game
npm start
```

## 6. Truy cập Admin Dashboard

1. Đăng nhập với tài khoản admin tại: `http://localhost:3000`
2. Truy cập admin dashboard tại: `http://localhost:3000/admin`

## Tính năng Admin Dashboard

- **Tạo bài học mới**: Click "Tạo bài học mới"
- **Chỉnh sửa bài học**: Click "Chỉnh sửa" trên bài học
- **Xóa bài học**: Click "Xóa" trên bài học
- **Xem danh sách**: Tất cả bài học hiển thị trong grid

## Các loại Game

1. **letterTyper**: Gõ chữ cái (words là array các ký tự)
2. **wordTyper**: Gõ từ (words là array các từ)
3. **paragraphTyper**: Gõ đoạn văn (words là string dài)

## Format dữ liệu Words

- **JSON Array**: `["a", "b", "c"]` hoặc `["cat", "dog", "bird"]`
- **Text lines**: Mỗi dòng một từ/ký tự

## Lưu ý bảo mật

- Đổi password admin sau khi setup
- Không commit file .env lên git
- Sử dụng JWT_SECRET mạnh trong production
