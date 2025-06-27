# Typing Game Project

Một dự án game gõ phím hoàn chỉnh với frontend React và backend Node.js/Express.

## 🎯 Tính năng

### Frontend (React)
- **Typing Game**: Game gõ từ vựng với timer
- **Paragraph Typing Game**: Game gõ đoạn văn dài
- **Virtual Keyboard**: Bàn phím ảo với highlight phím
- **Dashboard**: Theo dõi tiến độ và thống kê
- **Lessons**: Hệ thống bài học có cấp độ
- **Authentication**: Đăng ký/đăng nhập người dùng

### Backend (Node.js/Express)
- **REST API**: Endpoints cho user, lessons, auth
- **MongoDB**: Database lưu trữ user và lessons
- **JWT Authentication**: Bảo mật với JSON Web Token
- **Middleware**: Auth middleware và error handling

## 🚀 Cài đặt và chạy

### Frontend
```bash
cd typing-game
npm install
npm start
```

### Backend
```bash
cd typing-game-backend
npm install
npm start
```

## 📁 Cấu trúc dự án

```
gameproject/
├── typing-game/                 # Frontend React
│   ├── public/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/             # Pages components
│   │   ├── styles/            # CSS files
│   │   ├── api/               # API calls
│   │   ├── lessons/           # Lessons data
│   │   └── resources/         # Static resources
│   └── package.json
├── typing-game-backend/         # Backend Node.js
│   ├── models/                # Database models
│   ├── routes/                # API routes
│   ├── middleware/            # Express middleware
│   ├── index.js              # Server entry point
│   └── package.json
└── README.md
```

## 🔧 Công nghệ sử dụng

### Frontend
- React.js
- Tailwind CSS
- Axios
- React Router

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs

## 🎮 Gameplay

1. **Word Typing**: Gõ các từ vựng xuất hiện trong thời gian giới hạn
2. **Paragraph Typing**: Gõ hoàn chỉnh đoạn văn dài với độ chính xác cao
3. **Virtual Keyboard**: Bàn phím ảo hỗ trợ highlight phím đang nhấn
4. **Progress Tracking**: Theo dõi WPM, độ chính xác, điểm số

## 🏆 Tính năng đặc biệt

- **MonkeyType-inspired UI**: Giao diện tối ưu theo phong cách MonkeyType
- **Real-time Highlighting**: Highlight phím ảo theo thời gian thực
- **Auto-scroll**: Tự động scroll đến vị trí đang gõ
- **Responsive Design**: Tương thích mọi thiết bị
- **Focus Management**: Quản lý focus tối ưu khi gõ phím

## 📊 Stats Tracking

- Words Per Minute (WPM)
- Accuracy Percentage
- Correct/Incorrect Characters
- Time Remaining
- Score System

## 🤝 Đóng góp

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.
