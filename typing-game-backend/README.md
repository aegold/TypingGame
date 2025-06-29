# Typing Game Backend

## Cài đặt

```bash
npm install
```

## Environment Variables

Tạo file `.env` với nội dung:

```
MONGODB_URI=mongodb://localhost:27017/typing-game
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
FRONTEND_URL=http://localhost:3000
```

## Chạy ứng dụng

### Development mode:

```bash
npm run dev
```

### Production mode:

```bash
npm start
```

## Seed dữ liệu mẫu

```bash
node seedLessons.js
```

## API Endpoints

### Authentication

- `POST /api/register` - Đăng ký tài khoản
- `POST /api/login` - Đăng nhập

### User

- `GET /api/profile` - Lấy thông tin user (yêu cầu auth)
- `POST /api/score` - Cập nhật điểm (yêu cầu auth)

### Lessons

- `GET /api/lessons` - Lấy tất cả bài học
- `GET /api/lessons/:id` - Lấy chi tiết bài học
- `POST /api/lessons` - Tạo bài học mới
- `PUT /api/lessons/:id` - Cập nhật bài học
- `DELETE /api/lessons/:id` - Xóa bài học

## Database Schema

### User

```javascript
{
  username: String (required, unique, 3-50 chars),
  password: String (required, min 6 chars, hashed),
  totalScore: Number (default: 0),
  history: [{
    gameId: String,
    score: Number,
    date: Date
  }]
}
```

### Lesson

```javascript
{
  title: String (required, max 200 chars),
  videoUrl: String (optional),
  words: Mixed (required, array),
  gameType: String (letterTyper|wordTyper|paragraphTyper),
  timer: Number (required, 1-600 seconds)
}
```

## Security Features

- Password hashing với bcrypt
- JWT authentication với expiration
- Input validation
- Rate limiting (100 requests/minute)
- CORS protection
- Error handling
