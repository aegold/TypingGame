# 📚 Typing Game Backend - API Documentation

## 📋 Mục lục

1. [Tổng quan](#tổng-quan)
2. [Công nghệ sử dụng](#công-nghệ-sử-dụng)
3. [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
4. [Database Models](#database-models)
5. [Authentication & Authorization](#authentication--authorization)
6. [API Endpoints](#api-endpoints)
7. [Middleware](#middleware)
8. [Scripts & Tools](#scripts--tools)
9. [Error Handling](#error-handling)
10. [Security](#security)
11. [Deployment](#deployment)

---

## 🎯 Tổng quan

Backend API cho ứng dụng Typing Game - một hệ thống học gõ phím tương tác được xây dựng trên Node.js và Express.js.

### Thông tin cơ bản

- **Framework**: Express.js 5.1.0
- **Database**: MongoDB (Mongoose 8.16.0)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt/bcryptjs
- **API Version**: 1.0.0
- **Default Port**: 5000

### Tính năng chính

- ✅ User authentication (đăng ký, đăng nhập)
- ✅ Lesson management (CRUD operations)
- ✅ Category management
- ✅ Score tracking & history
- ✅ Leaderboard system với time filtering
- ✅ Admin dashboard
- ✅ Rate limiting
- ✅ CORS support

---

## 🛠️ Công nghệ sử dụng

### Core Dependencies

| Package        | Version | Mục đích                      |
| -------------- | ------- | ----------------------------- |
| `express`      | ^5.1.0  | Web framework                 |
| `mongoose`     | ^8.16.0 | MongoDB ODM                   |
| `jsonwebtoken` | ^9.0.2  | JWT authentication            |
| `bcrypt`       | ^6.0.0  | Password hashing              |
| `bcryptjs`     | ^3.0.2  | Password hashing (fallback)   |
| `cors`         | ^2.8.5  | Cross-origin resource sharing |
| `dotenv`       | ^16.5.0 | Environment variables         |

### Dev Dependencies

| Package   | Version | Mục đích                |
| --------- | ------- | ----------------------- |
| `nodemon` | ^3.0.0  | Development auto-reload |

---

## 🏗️ Kiến trúc hệ thống

### Cấu trúc thư mục

```
typing-game-backend/
├── index.js                 # Entry point, server setup
├── package.json            # Dependencies & scripts
├── .env                    # Environment variables (không commit)
├── models/                 # Mongoose schemas
│   ├── user.js            # User model
│   ├── lesson.js          # Lesson model
│   └── category.js        # Category model
├── routes/                 # API route handlers
│   ├── auth.js            # Authentication routes
│   ├── user.js            # User profile & score
│   ├── lesson.js          # Lesson CRUD
│   ├── category.js        # Category CRUD
│   ├── admin.js           # Admin routes
│   ├── leaderboard.js     # Leaderboard system
│   └── seed.js            # Database seeding
├── middleware/             # Express middleware
│   ├── auth.js            # JWT authentication
│   └── adminAuth.js       # Admin authorization
├── createAdmin.js          # Script tạo admin user
└── seedLessons.js         # Script seed sample data
```

### Request Flow

```
Client Request
    ↓
Express Server (index.js)
    ↓
Rate Limiting Middleware
    ↓
CORS Middleware
    ↓
Route Handler (/api/*)
    ↓
Authentication Middleware (nếu cần)
    ↓
Admin Authorization (nếu cần)
    ↓
Controller Logic
    ↓
Database Operations (MongoDB)
    ↓
Response (JSON)
```

---

## 💾 Database Models

### 1. User Model (`models/user.js`)

Schema quản lý thông tin người dùng, điểm số và lịch sử chơi game.

#### Schema Structure

```javascript
{
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  totalScore: {
    type: Number,
    default: 0,
    min: 0
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  history: [{
    gameId: { type: String, required: true },
    score: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now }
  }],
  createdAt: Date,    // Auto-generated
  updatedAt: Date     // Auto-generated
}
```

#### Indexes

- `username`: Unique index (tự động)
- `totalScore`: Descending index (cho leaderboard)
- `history.date`: Descending index (cho time-based queries)

#### Ví dụ Document

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "john_doe",
  "password": "$2b$10$...", // Hashed password
  "totalScore": 1250,
  "isAdmin": false,
  "history": [
    {
      "gameId": "lesson_001",
      "score": 150,
      "date": "2025-10-15T10:30:00.000Z"
    },
    {
      "gameId": "lesson_002",
      "score": 200,
      "date": "2025-10-15T11:45:00.000Z"
    }
  ],
  "createdAt": "2025-10-01T08:00:00.000Z",
  "updatedAt": "2025-10-15T11:45:00.000Z"
}
```

---

### 2. Lesson Model (`models/lesson.js`)

Schema quản lý bài học gõ phím với nhiều loại game khác nhau.

#### Schema Structure

```javascript
{
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  videoUrl: {
    type: String,
    required: false,
    default: "",
    trim: true
  },
  words: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: "Words must be a non-empty array"
    }
  },
  gameType: {
    type: String,
    required: true,
    enum: [
      'letterTyper',
      'wordTyper',
      'paragraphTyper',
      'vietnameseLetterTyper'
    ]
  },
  timer: {
    type: Number,
    required: true,
    default: 30,
    min: 1,
    max: 600
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: false
  },
  order: {
    type: Number,
    default: 0,
    min: 0
  },
  createdAt: Date,    // Auto-generated
  updatedAt: Date     // Auto-generated
}
```

#### Game Types & Words Format

| Game Type               | Words Format                   | Ví dụ                                     |
| ----------------------- | ------------------------------ | ----------------------------------------- |
| `letterTyper`           | Array of arrays of characters  | `[["f", " ", "f"], ["j", "k"]]`           |
| `wordTyper`             | Array of strings               | `["hello", "world", "typing"]`            |
| `paragraphTyper`        | Array of strings (sentences)   | `["This is a sentence.", "Another one."]` |
| `vietnameseLetterTyper` | Array of Vietnamese characters | `["á", "à", "ả", "ã", "ạ"]`               |

#### Indexes

- `gameType`: Index for filtering
- `createdAt`: Descending index

#### Ví dụ Document

```json
{
  "_id": "507f1f77bcf86cd799439012",
  "title": "Bài 1: Làm quen với hàng phím cơ bản",
  "videoUrl": "https://youtube.com/watch?v=...",
  "words": [
    ["f", " ", "f", " ", "f"],
    ["j", " ", "j", " ", "j"]
  ],
  "gameType": "letterTyper",
  "timer": 30,
  "category": "507f1f77bcf86cd799439015",
  "order": 1,
  "createdAt": "2025-10-01T08:00:00.000Z",
  "updatedAt": "2025-10-01T08:00:00.000Z"
}
```

---

### 3. Category Model (`models/category.js`)

Schema quản lý phân loại bài học.

#### Schema Structure

```javascript
{
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    default: "",
    maxlength: 500
  },
  order: {
    type: Number,
    default: 0,
    min: 0
  },
  color: {
    type: String,
    trim: true,
    default: "#888888"
  },
  createdAt: Date,    // Auto-generated
  updatedAt: Date     // Auto-generated
}
```

#### Indexes

- `name`: Unique index
- `order`: Index for sorting

#### Ví dụ Document

```json
{
  "_id": "507f1f77bcf86cd799439015",
  "name": "Bài học cơ bản",
  "description": "Các bài học dành cho người mới bắt đầu",
  "order": 1,
  "color": "#4CAF50",
  "createdAt": "2025-10-01T08:00:00.000Z",
  "updatedAt": "2025-10-01T08:00:00.000Z"
}
```

---

## 🔐 Authentication & Authorization

### JWT Authentication Flow

```
1. User đăng ký/đăng nhập
   ↓
2. Server validate credentials
   ↓
3. Server tạo JWT token (expires in 24h)
   ↓
4. Client lưu token (localStorage)
   ↓
5. Client gửi token trong header: Authorization: Bearer <token>
   ↓
6. Server verify token qua middleware
   ↓
7. Cho phép truy cập resource
```

### Token Structure

```javascript
// Payload
{
  userId: "507f1f77bcf86cd799439011",
  iat: 1697376000,  // Issued at
  exp: 1697462400   // Expires (24h)
}
```

### Environment Variable

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

⚠️ **Lưu ý bảo mật**: Không bao giờ commit JWT_SECRET vào git!

---

## 📡 API Endpoints

### Base URL

```
Development: http://localhost:5000
Production: https://your-domain.com
API Prefix: /api
```

---

### 🔓 Authentication Routes (`/api/auth`)

#### 1. Register User

Đăng ký tài khoản mới.

**Endpoint**: `POST /api/auth/register`

**Request Body**:

```json
{
  "username": "john_doe",
  "password": "securepass123"
}
```

**Validation**:

- `username`: required, 3-50 characters
- `password`: required, min 6 characters

**Response Success** (201):

```json
{
  "message": "Đăng ký thành công"
}
```

**Response Error** (400):

```json
{
  "error": "Người dùng đã tồn tại"
}
```

**Example cURL**:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","password":"securepass123"}'
```

---

#### 2. Login User

Đăng nhập và nhận JWT token.

**Endpoint**: `POST /api/auth/login`

**Request Body**:

```json
{
  "username": "john_doe",
  "password": "securepass123"
}
```

**Response Success** (200):

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe"
  }
}
```

**Response Error** (401):

```json
{
  "error": "Invalid username or password"
}
```

**Example cURL**:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","password":"securepass123"}'
```

---

### 👤 User Routes (`/api`)

#### 1. Get User Profile

Lấy thông tin profile của user hiện tại (yêu cầu authentication).

**Endpoint**: `GET /api/profile`

**Headers**:

```
Authorization: Bearer <token>
```

**Response Success** (200):

```json
{
  "username": "john_doe",
  "totalScore": 1250,
  "history": [
    {
      "gameId": "lesson_001",
      "score": 150,
      "date": "2025-10-15T10:30:00.000Z",
      "_id": "507f1f77bcf86cd799439020"
    }
  ]
}
```

**Response Error** (401):

```json
{
  "error": "No token provided"
}
```

**Example cURL**:

```bash
curl -X GET http://localhost:5000/api/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

#### 2. Submit Score

Gửi điểm số sau khi hoàn thành một bài học (yêu cầu authentication).

**Endpoint**: `POST /api/score`

**Headers**:

```
Authorization: Bearer <token>
```

**Request Body**:

```json
{
  "lessonId": "507f1f77bcf86cd799439012",
  "score": 150
}
```

**Validation**:

- `lessonId`: required, string
- `score`: required, number >= 0

**Response Success** (200):

```json
{
  "message": "Score updated",
  "totalScore": 1400
}
```

**Response Error** (400):

```json
{
  "error": "Invalid score value"
}
```

**Example cURL**:

```bash
curl -X POST http://localhost:5000/api/score \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"lessonId":"507f1f77bcf86cd799439012","score":150}'
```

---

### 📚 Lesson Routes (`/api/lessons`)

#### 1. Get All Lessons

Lấy danh sách tất cả bài học (public, không cần authentication).

**Endpoint**: `GET /api/lessons`

**Query Parameters**:

- `category` (optional): Filter by category ID

**Example Request**:

```
GET /api/lessons
GET /api/lessons?category=507f1f77bcf86cd799439015
```

**Response Success** (200):

```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Bài 1: Làm quen với hàng phím cơ bản",
    "videoUrl": "https://youtube.com/watch?v=...",
    "words": [["f", " ", "f"]],
    "gameType": "letterTyper",
    "timer": 30,
    "category": "507f1f77bcf86cd799439015",
    "order": 1,
    "createdAt": "2025-10-01T08:00:00.000Z",
    "updatedAt": "2025-10-01T08:00:00.000Z"
  }
]
```

**Example cURL**:

```bash
curl -X GET http://localhost:5000/api/lessons
curl -X GET http://localhost:5000/api/lessons?category=507f1f77bcf86cd799439015
```

---

#### 2. Get Lesson by ID

Lấy chi tiết một bài học (public).

**Endpoint**: `GET /api/lessons/:id`

**Response Success** (200):

```json
{
  "_id": "507f1f77bcf86cd799439012",
  "title": "Bài 1: Làm quen với hàng phím cơ bản",
  "videoUrl": "https://youtube.com/watch?v=...",
  "words": [["f", " ", "f"]],
  "gameType": "letterTyper",
  "timer": 30,
  "category": "507f1f77bcf86cd799439015",
  "order": 1
}
```

**Response Error** (404):

```json
{
  "message": "Lesson not found"
}
```

**Example cURL**:

```bash
curl -X GET http://localhost:5000/api/lessons/507f1f77bcf86cd799439012
```

---

#### 3. Create Lesson (Admin Only)

Tạo bài học mới (yêu cầu admin authentication).

**Endpoint**: `POST /api/lessons`

**Headers**:

```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "title": "Bài học mới",
  "videoUrl": "https://youtube.com/watch?v=...",
  "words": [["a", "b", "c"]],
  "gameType": "letterTyper",
  "timer": 30,
  "category": "507f1f77bcf86cd799439015",
  "order": 5
}
```

**Validation**:

- `title`: required, max 200 characters
- `words`: required, non-empty array
- `gameType`: required, enum ['letterTyper', 'wordTyper', 'paragraphTyper', 'vietnameseLetterTyper']
- `timer`: optional, 1-600 seconds (default: 30)
- `videoUrl`: optional
- `category`: optional, ObjectId
- `order`: optional, number >= 0 (default: 0)

**Response Success** (201):

```json
{
  "_id": "507f1f77bcf86cd799439025",
  "title": "Bài học mới",
  "videoUrl": "https://youtube.com/watch?v=...",
  "words": [["a", "b", "c"]],
  "gameType": "letterTyper",
  "timer": 30,
  "category": "507f1f77bcf86cd799439015",
  "order": 5,
  "createdAt": "2025-10-15T12:00:00.000Z",
  "updatedAt": "2025-10-15T12:00:00.000Z"
}
```

**Response Error** (400):

```json
{
  "message": "Invalid gameType"
}
```

**Response Error** (403):

```json
{
  "message": "Access denied. Admin privileges required."
}
```

**Example cURL**:

```bash
curl -X POST http://localhost:5000/api/lessons \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Bài học mới",
    "words":[["a","b","c"]],
    "gameType":"letterTyper",
    "timer":30,
    "category":"507f1f77bcf86cd799439015",
    "order":5
  }'
```

---

#### 4. Update Lesson (Admin Only)

Cập nhật bài học (yêu cầu admin authentication).

**Endpoint**: `PUT /api/lessons/:id`

**Headers**:

```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body**: (tất cả fields đều optional)

```json
{
  "title": "Bài học đã cập nhật",
  "timer": 45,
  "order": 10
}
```

**Response Success** (200):

```json
{
  "_id": "507f1f77bcf86cd799439012",
  "title": "Bài học đã cập nhật",
  "timer": 45,
  "order": 10,
  "updatedAt": "2025-10-15T12:30:00.000Z"
}
```

**Example cURL**:

```bash
curl -X PUT http://localhost:5000/api/lessons/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Bài học đã cập nhật","timer":45}'
```

---

#### 5. Delete Lesson (Admin Only)

Xóa bài học (yêu cầu admin authentication).

**Endpoint**: `DELETE /api/lessons/:id`

**Headers**:

```
Authorization: Bearer <admin_token>
```

**Response Success** (200):

```json
{
  "message": "Lesson deleted"
}
```

**Response Error** (404):

```json
{
  "message": "Lesson not found"
}
```

**Example cURL**:

```bash
curl -X DELETE http://localhost:5000/api/lessons/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer <admin_token>"
```

---

### 📂 Category Routes (`/api/categories`)

#### 1. Get All Categories

Lấy danh sách tất cả categories (public).

**Endpoint**: `GET /api/categories`

**Response Success** (200):

```json
[
  {
    "_id": "507f1f77bcf86cd799439015",
    "name": "Bài học cơ bản",
    "description": "Các bài học dành cho người mới bắt đầu",
    "order": 1,
    "color": "#4CAF50",
    "createdAt": "2025-10-01T08:00:00.000Z",
    "updatedAt": "2025-10-01T08:00:00.000Z"
  }
]
```

**Example cURL**:

```bash
curl -X GET http://localhost:5000/api/categories
```

---

#### 2. Get Category by ID

Lấy chi tiết một category (public).

**Endpoint**: `GET /api/categories/:id`

**Response Success** (200):

```json
{
  "_id": "507f1f77bcf86cd799439015",
  "name": "Bài học cơ bản",
  "description": "Các bài học dành cho người mới bắt đầu",
  "order": 1,
  "color": "#4CAF50"
}
```

**Response Error** (404):

```json
{
  "message": "Category not found"
}
```

---

#### 3. Create Category (Admin Only)

Tạo category mới (yêu cầu admin authentication).

**Endpoint**: `POST /api/categories`

**Headers**:

```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "name": "Bài học nâng cao",
  "description": "Dành cho người đã có kinh nghiệm",
  "order": 2,
  "color": "#2196F3"
}
```

**Validation**:

- `name`: required, max 100 characters, must be unique
- `description`: optional, max 500 characters
- `order`: optional, number >= 0 (default: 0)
- `color`: optional, hex color code (default: "#888888")

**Response Success** (201):

```json
{
  "_id": "507f1f77bcf86cd799439030",
  "name": "Bài học nâng cao",
  "description": "Dành cho người đã có kinh nghiệm",
  "order": 2,
  "color": "#2196F3",
  "createdAt": "2025-10-15T13:00:00.000Z",
  "updatedAt": "2025-10-15T13:00:00.000Z"
}
```

**Response Error** (400):

```json
{
  "message": "Category name already exists"
}
```

---

#### 4. Update Category (Admin Only)

Cập nhật category (yêu cầu admin authentication).

**Endpoint**: `PUT /api/categories/:id`

**Headers**:

```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "name": "Bài học nâng cao (updated)",
  "description": "Mô tả mới",
  "order": 3,
  "color": "#FF5722"
}
```

**Response Success** (200):

```json
{
  "_id": "507f1f77bcf86cd799439030",
  "name": "Bài học nâng cao (updated)",
  "description": "Mô tả mới",
  "order": 3,
  "color": "#FF5722",
  "updatedAt": "2025-10-15T13:30:00.000Z"
}
```

---

#### 5. Delete Category (Admin Only)

Xóa category (yêu cầu admin authentication). Không thể xóa nếu còn lessons liên quan.

**Endpoint**: `DELETE /api/categories/:id`

**Headers**:

```
Authorization: Bearer <admin_token>
```

**Response Success** (200):

```json
{
  "message": "Category deleted"
}
```

**Response Error** (400):

```json
{
  "message": "Không thể xóa: Category này vẫn còn bài học liên quan."
}
```

---

### 🏆 Leaderboard Routes (`/api`)

#### Get Leaderboard

Lấy bảng xếp hạng người chơi với tùy chọn lọc theo thời gian.

**Endpoint**: `GET /api/leaderboard`

**Query Parameters**:

- `limit` (optional): Số lượng kết quả (1-100, default: 10)
- `period` (optional): Khoảng thời gian ['all', 'month', 'day'] (default: 'all')

**Headers** (optional):

```
Authorization: Bearer <token>
```

Nếu có token, API sẽ trả thêm thông tin xếp hạng của user hiện tại.

**Example Requests**:

```
GET /api/leaderboard
GET /api/leaderboard?limit=20&period=month
GET /api/leaderboard?period=day
```

**Response Success** (200) - Không có token:

```json
{
  "leaderboard": [
    {
      "rank": 1,
      "username": "player_one",
      "totalScore": 5000
    },
    {
      "rank": 2,
      "username": "player_two",
      "totalScore": 4500
    }
  ]
}
```

**Response Success** (200) - Có token:

```json
{
  "leaderboard": [
    {
      "rank": 1,
      "username": "player_one",
      "totalScore": 5000
    },
    {
      "rank": 2,
      "username": "player_two",
      "totalScore": 4500
    }
  ],
  "me": {
    "username": "john_doe",
    "totalScore": 1250,
    "rank": 15,
    "inTop": false
  }
}
```

**Period Filtering Logic**:

| Period  | Description      | Calculation                          |
| ------- | ---------------- | ------------------------------------ |
| `all`   | Tất cả thời gian | Sử dụng `totalScore`                 |
| `month` | 30 ngày gần nhất | Tổng điểm từ `history` trong 30 ngày |
| `day`   | 24 giờ gần nhất  | Tổng điểm từ `history` trong 24 giờ  |

**Example cURL**:

```bash
# Public leaderboard
curl -X GET "http://localhost:5000/api/leaderboard?limit=10&period=month"

# With user ranking
curl -X GET "http://localhost:5000/api/leaderboard?limit=10&period=all" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 🔧 Admin Routes (`/api/admin`)

#### 1. Check Admin Access

Kiểm tra xem user có quyền admin hay không.

**Endpoint**: `GET /api/admin/check`

**Headers**:

```
Authorization: Bearer <admin_token>
```

**Response Success** (200):

```json
{
  "message": "Admin access granted",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "admin1",
    "isAdmin": true
  }
}
```

**Response Error** (403):

```json
{
  "message": "Access denied. Admin privileges required."
}
```

---

#### 2. Get Admin Stats

Lấy thống kê tổng quan (admin only).

**Endpoint**: `GET /api/admin/stats`

**Headers**:

```
Authorization: Bearer <admin_token>
```

**Response Success** (200):

```json
{
  "lessonCount": 25,
  "userCount": 150,
  "lastUpdated": "2025-10-15T14:00:00.000Z"
}
```

**Example cURL**:

```bash
curl -X GET http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer <admin_token>"
```

---

### 🌱 Seed Routes (`/api/seed`)

Routes để seed và quản lý dữ liệu mẫu (dùng cho development/testing).

#### 1. Get Seed Status

Kiểm tra trạng thái database và dữ liệu mẫu.

**Endpoint**: `GET /api/seed/status`

**Response Success** (200):

```json
{
  "success": true,
  "database_status": "connected",
  "lessons_count": 6,
  "needs_seeding": false,
  "sample_lesson": {
    "id": "507f1f77bcf86cd799439012",
    "title": "Bài 1: Làm quen với hàng phím cơ bản",
    "gameType": "letterTyper"
  }
}
```

---

#### 2. Seed Lessons

Tạo dữ liệu bài học mẫu.

**Endpoint**: `POST /api/seed/lessons`

**Response Success** (200) - Nếu đã có data:

```json
{
  "success": true,
  "message": "Database already has 6 lessons. No seeding needed.",
  "lessons_count": 6,
  "action": "skipped"
}
```

**Response Success** (200) - Nếu seed thành công:

```json
{
  "success": true,
  "message": "Lessons seeded successfully!",
  "lessons_count": 6,
  "action": "seeded",
  "lessons": [
    { "id": "507f1f77bcf86cd799439012", "title": "Bài 1: ..." },
    { "id": "507f1f77bcf86cd799439013", "title": "Bài 2: ..." }
  ]
}
```

---

#### 3. Clear All Lessons

Xóa tất cả bài học (cẩn thận - dùng cho testing).

**Endpoint**: `DELETE /api/seed/lessons`

**Response Success** (200):

```json
{
  "success": true,
  "message": "Deleted 6 lessons",
  "deleted_count": 6,
  "action": "cleared"
}
```

---

## 🛡️ Middleware

### 1. Authentication Middleware (`middleware/auth.js`)

Middleware xác thực JWT token cho các route cần authentication.

#### Chức năng:

- ✅ Kiểm tra header `Authorization`
- ✅ Verify JWT token
- ✅ Decode `userId` từ token
- ✅ Thêm `req.userId` vào request

#### Sử dụng:

```javascript
const auth = require("./middleware/auth");

router.get("/profile", auth, async (req, res) => {
  // req.userId available here
  const user = await User.findById(req.userId);
  res.json(user);
});
```

#### Error Responses:

| Status | Message           | Cause                           |
| ------ | ----------------- | ------------------------------- |
| 401    | No token provided | Missing Authorization header    |
| 401    | Invalid token     | Token expired hoặc không hợp lệ |

---

### 2. Admin Authorization Middleware (`middleware/adminAuth.js`)

Middleware kiểm tra quyền admin cho các route quản trị.

#### Chức năng:

- ✅ Kiểm tra JWT token
- ✅ Verify user tồn tại
- ✅ Kiểm tra `isAdmin = true`
- ✅ Thêm `req.user` vào request

#### Sử dụng:

```javascript
const adminAuth = require("./middleware/adminAuth");

router.post("/lessons", adminAuth, async (req, res) => {
  // req.user available here (full user object)
  const lesson = new Lesson(req.body);
  await lesson.save();
  res.json(lesson);
});
```

#### Error Responses:

| Status | Message                                   | Cause                                 |
| ------ | ----------------------------------------- | ------------------------------------- |
| 401    | Access denied. No token provided.         | Missing token                         |
| 401    | Invalid token. User not found.            | Token hợp lệ nhưng user không tồn tại |
| 401    | Invalid token.                            | Token không hợp lệ hoặc expired       |
| 403    | Access denied. Admin privileges required. | User không có quyền admin             |

---

### 3. Rate Limiting Middleware

Built-in rate limiting để chống spam và DDoS attacks.

#### Cấu hình:

- **Limit**: 100 requests per IP
- **Window**: 60 seconds (1 minute)
- **Storage**: In-memory Map (production nên dùng Redis)

#### Code:

```javascript
const requestCounts = new Map();
const RATE_LIMIT = 100;
const WINDOW_MS = 60 * 1000;

app.use((req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();

  if (!requestCounts.has(clientIP)) {
    requestCounts.set(clientIP, { count: 1, resetTime: now + WINDOW_MS });
  } else {
    const clientData = requestCounts.get(clientIP);
    if (now > clientData.resetTime) {
      clientData.count = 1;
      clientData.resetTime = now + WINDOW_MS;
    } else {
      clientData.count++;
      if (clientData.count > RATE_LIMIT) {
        return res.status(429).json({ error: "Too many requests" });
      }
    }
  }
  next();
});
```

#### Response khi bị rate limit:

**Status**: 429 Too Many Requests

```json
{
  "error": "Too many requests"
}
```

---

### 4. CORS Middleware

Cấu hình Cross-Origin Resource Sharing để cho phép frontend gọi API.

#### Cấu hình:

```javascript
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
```

#### Environment Variable:

```env
FRONTEND_URL=http://localhost:3000
```

---

## 🔧 Scripts & Tools

### 1. Create Admin Script (`createAdmin.js`)

Script tạo admin user để quản trị hệ thống.

#### Chức năng:

- ✅ Kết nối MongoDB
- ✅ Kiểm tra admin đã tồn tại
- ✅ Tạo admin user mới với credentials mặc định
- ✅ Hash password với bcrypt

#### Thông tin Admin mặc định:

```
Username: admin1
Password: admin123
isAdmin: true
```

⚠️ **Lưu ý**: Đổi password ngay sau lần đăng nhập đầu tiên!

#### Sử dụng:

```bash
node createAdmin.js
```

#### Output:

```
Connecting to MongoDB...
Connected to MongoDB
Admin user created successfully!
Username: admin1
Password: admin123
Please change the password after first login!
Disconnected from MongoDB
```

---

### 2. Seed Lessons Script (`seedLessons.js`)

Script để seed dữ liệu bài học mẫu vào database.

#### Chức năng:

- ✅ Tạo 6 bài học mẫu với các loại game khác nhau
- ✅ Kiểm tra dữ liệu đã tồn tại
- ✅ Insert batch data

#### Sample Lessons:

1. Bài 1: Làm quen với hàng phím cơ bản (letterTyper)
2. Bài 2: Luyện tập phím nâng cao (letterTyper)
3. Bài 3: Đánh từ cơ bản (wordTyper)
4. Bài 4: Đánh đoạn văn (paragraphTyper)
5. Bài 5: Luyện tập số (letterTyper)
6. Bài 6: Ký tự đặc biệt (letterTyper)

#### Sử dụng:

```bash
node seedLessons.js
# hoặc
npm run seed
```

---

### 3. NPM Scripts

Các command có sẵn trong `package.json`:

| Command        | Description                                 |
| -------------- | ------------------------------------------- |
| `npm start`    | Khởi động server production mode            |
| `npm run dev`  | Khởi động server development mode (nodemon) |
| `npm run seed` | Chạy seedLessons.js                         |
| `npm test`     | Placeholder cho tests                       |

#### Development Mode:

```bash
npm run dev
```

Sử dụng `nodemon` để tự động restart server khi có thay đổi code.

---

## ⚠️ Error Handling

### Error Response Format

Tất cả errors đều trả về JSON format:

```json
{
  "error": "Error message",
  "message": "Detailed message",
  "details": "Additional details (optional)"
}
```

### HTTP Status Codes

| Code | Meaning               | When to use                         |
| ---- | --------------------- | ----------------------------------- |
| 200  | OK                    | Request thành công                  |
| 201  | Created               | Tạo resource mới thành công         |
| 400  | Bad Request           | Invalid input, validation failed    |
| 401  | Unauthorized          | Missing hoặc invalid authentication |
| 403  | Forbidden             | User không có quyền truy cập        |
| 404  | Not Found             | Resource không tồn tại              |
| 429  | Too Many Requests     | Rate limit exceeded                 |
| 500  | Internal Server Error | Server error                        |

### Common Error Scenarios

#### 1. Authentication Errors

```json
// No token
{
  "error": "No token provided"
}

// Invalid token
{
  "error": "Invalid token"
}

// User not found
{
  "error": "User not found"
}
```

#### 2. Validation Errors

```json
// Missing required field
{
  "error": "Username và password là bắt buộc"
}

// Invalid format
{
  "message": "Invalid gameType"
}

// Duplicate entry
{
  "error": "Người dùng đã tồn tại"
}
```

#### 3. Authorization Errors

```json
// Not admin
{
  "message": "Access denied. Admin privileges required."
}

// Cannot delete (constraint)
{
  "message": "Không thể xóa: Category này vẫn còn bài học liên quan."
}
```

#### 4. Rate Limit Errors

```json
{
  "error": "Too many requests"
}
```

### Error Logging

Tất cả errors đều được log ra console:

```javascript
console.error("Error description:", err);
```

Production nên sử dụng logging service như Winston, Morgan, hoặc cloud logging.

---

## 🔒 Security

### 1. Password Security

#### Hashing Algorithm

- **Library**: bcrypt / bcryptjs
- **Salt Rounds**: 10
- **Algorithm**: bcrypt (Blowfish-based)

#### Implementation:

```javascript
// Registration
const hashedPassword = await bcrypt.hash(password, 10);

// Login
const match = await bcrypt.compare(password, user.password);
```

#### Security Features:

- ✅ Salted hashing (random salt per password)
- ✅ Slow hashing (computationally expensive)
- ✅ Rainbow table resistant

---

### 2. JWT Security

#### Configuration:

```javascript
const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
  expiresIn: "24h",
});
```

#### Security Features:

- ✅ Secret key từ environment variable
- ✅ Token expiration (24 hours)
- ✅ Signed tokens (tamper-proof)

#### Best Practices:

- 🔐 Không lưu sensitive data trong payload
- 🔐 Secret key phải random và đủ dài (min 32 characters)
- 🔐 Sử dụng HTTPS trong production
- 🔐 Refresh token mechanism (TODO)

---

### 3. Input Validation

#### Mongoose Schema Validation:

```javascript
username: {
  type: String,
  required: true,
  unique: true,
  trim: true,
  minlength: 3,
  maxlength: 50
}
```

#### Custom Validation:

```javascript
if (!username || !password) {
  return res.status(400).json({
    error: "Username và password là bắt buộc",
  });
}

if (password.length < 6) {
  return res.status(400).json({
    error: "Password phải có ít nhất 6 ký tự",
  });
}
```

#### MongoDB Injection Prevention:

Mongoose tự động escape special characters, nhưng nên:

- ✅ Validate input format
- ✅ Use parameterized queries
- ✅ Sanitize user input

---

### 4. CORS Security

```javascript
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
```

#### Security Features:

- ✅ Whitelist specific origin
- ✅ Support credentials (cookies)
- ✅ Prevent unauthorized cross-origin requests

---

### 5. Rate Limiting

Giới hạn số requests để chống:

- 🛡️ Brute force attacks
- 🛡️ DDoS attacks
- 🛡️ API abuse

**Current Implementation**: 100 requests/minute per IP

**Production Recommendation**: Sử dụng Redis-based rate limiting với `express-rate-limit`.

---

### 6. Data Size Limits

```javascript
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
```

Giới hạn payload size để chống:

- 🛡️ Memory exhaustion attacks
- 🛡️ Excessive data uploads

---

### 7. Security Headers

**TODO**: Implement security headers với `helmet.js`:

```javascript
const helmet = require("helmet");
app.use(helmet());
```

Headers nên có:

- `X-Frame-Options`
- `X-Content-Type-Options`
- `Strict-Transport-Security` (HTTPS only)
- `Content-Security-Policy`

---

### 8. Environment Variables

Sensitive data được lưu trong `.env`:

```env
# NEVER commit to git!
MONGODB_URI=mongodb://localhost:27017/typing-game
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
FRONTEND_URL=http://localhost:3000
PORT=5000
```

#### Security Checklist:

- ✅ Add `.env` to `.gitignore`
- ✅ Use strong JWT_SECRET (min 32 chars)
- ✅ Different secrets per environment
- ✅ Rotate secrets periodically

---

## 🚀 Deployment

### Environment Setup

#### 1. Environment Variables

Tạo file `.env` với các biến sau:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/typing-game
# Hoặc MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/typing-game

# JWT Secret (thay đổi cho production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars

# Frontend URL
FRONTEND_URL=https://your-frontend-domain.com

# Server Port
PORT=5000

# API Prefix (optional)
API_PREFIX=/api
```

⚠️ **Quan trọng**:

- Đổi `JWT_SECRET` thành chuỗi random và mạnh
- Cập nhật `FRONTEND_URL` đúng với domain frontend
- Sử dụng MongoDB Atlas cho production database

---

### Production Checklist

#### Security

- [ ] Đổi JWT_SECRET thành chuỗi random mạnh (min 32 characters)
- [ ] Đổi password admin mặc định (`admin123`)
- [ ] Enable HTTPS
- [ ] Implement rate limiting với Redis
- [ ] Add helmet.js security headers
- [ ] Enable MongoDB authentication
- [ ] Whitelist specific origins trong CORS
- [ ] Implement refresh token mechanism

#### Database

- [ ] Sử dụng MongoDB Atlas (hoặc managed MongoDB)
- [ ] Enable authentication
- [ ] Backup strategy
- [ ] Connection pooling
- [ ] Index optimization
- [ ] Enable MongoDB Atlas monitoring

#### Performance

- [ ] Enable compression middleware
- [ ] Implement caching (Redis)
- [ ] Use CDN cho static assets (nếu có)
- [ ] Database query optimization
- [ ] Enable Gzip compression

#### Monitoring

- [ ] Setup logging service (Winston, Morgan)
- [ ] Error tracking (Sentry, Rollbar)
- [ ] Performance monitoring (New Relic, DataDog)
- [ ] Health check endpoint
- [ ] Uptime monitoring (UptimeRobot, Pingdom)

---

### Deployment Platforms

#### 1. Heroku

**Procfile**:

```
web: node index.js
```

**Commands**:

```bash
heroku create typing-game-api
heroku config:set MONGODB_URI=<your-mongodb-uri>
heroku config:set JWT_SECRET=<your-jwt-secret>
heroku config:set FRONTEND_URL=<your-frontend-url>
git push heroku main
```

---

#### 2. Railway

1. Connect GitHub repository
2. Set environment variables trong Railway dashboard
3. Deploy tự động khi push to main

---

#### 3. Render

1. Create new Web Service
2. Connect GitHub repository
3. Build command: `npm install`
4. Start command: `node index.js`
5. Set environment variables
6. Deploy

---

#### 4. VPS (DigitalOcean, AWS EC2, etc.)

**Setup Steps**:

```bash
# 1. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Install MongoDB
# (Hoặc sử dụng MongoDB Atlas)

# 3. Clone repository
git clone https://github.com/your-repo/typing-game-backend.git
cd typing-game-backend

# 4. Install dependencies
npm install --production

# 5. Setup environment variables
nano .env

# 6. Install PM2
sudo npm install -g pm2

# 7. Start server với PM2
pm2 start index.js --name typing-game-api

# 8. Setup PM2 startup
pm2 startup
pm2 save

# 9. Setup Nginx reverse proxy (optional)
sudo apt install nginx
sudo nano /etc/nginx/sites-available/typing-game-api
```

**Nginx Configuration**:

```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

### Health Check Endpoint

**Recommendation**: Thêm health check endpoint:

```javascript
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});
```

---

### Backup Strategy

#### MongoDB Backup

**Automated backup script**:

```bash
#!/bin/bash
# backup-mongodb.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"
DB_NAME="typing-game"

mongodump --uri="$MONGODB_URI" --db="$DB_NAME" --out="$BACKUP_DIR/$DATE"

# Keep only last 7 days of backups
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;
```

**Cron job** (chạy mỗi ngày lúc 2am):

```bash
0 2 * * * /path/to/backup-mongodb.sh
```

---

## 📊 Database Indexes

### User Collection

```javascript
// Indexes tự động
db.users.createIndex({ username: 1 }, { unique: true });

// Indexes cho performance
db.users.createIndex({ totalScore: -1 });
db.users.createIndex({ "history.date": -1 });
```

### Lesson Collection

```javascript
// Indexes cho queries
db.lessons.createIndex({ gameType: 1 });
db.lessons.createIndex({ category: 1, order: 1 });
db.lessons.createIndex({ createdAt: -1 });
```

### Category Collection

```javascript
// Indexes
db.categories.createIndex({ name: 1 }, { unique: true });
db.categories.createIndex({ order: 1 });
```

---

## 🧪 Testing

### Manual Testing với cURL

#### 1. Register & Login Flow

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'

# Login
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}' \
  | jq -r '.token')

echo $TOKEN
```

#### 2. Test Authenticated Endpoints

```bash
# Get profile
curl -X GET http://localhost:5000/api/profile \
  -H "Authorization: Bearer $TOKEN"

# Submit score
curl -X POST http://localhost:5000/api/score \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lessonId":"test_lesson","score":100}'
```

#### 3. Test Public Endpoints

```bash
# Get lessons
curl -X GET http://localhost:5000/api/lessons

# Get categories
curl -X GET http://localhost:5000/api/categories

# Get leaderboard
curl -X GET "http://localhost:5000/api/leaderboard?limit=5&period=month"
```

---

### Postman Collection

**Recommendation**: Tạo Postman collection với:

- Environment variables (BASE_URL, TOKEN)
- Pre-request scripts để auto-refresh token
- Tests để validate responses

---

## 📝 API Changelog

### Version 1.0.0 (Current)

**Initial Release** - October 2025

Features:

- ✅ User authentication (register, login)
- ✅ User profile & score tracking
- ✅ Lesson CRUD operations
- ✅ Category management
- ✅ Leaderboard with time filtering
- ✅ Admin dashboard
- ✅ Rate limiting
- ✅ CORS support
- ✅ Seed data scripts

---

## 🔮 Future Improvements

### Planned Features

1. **Authentication**

   - [ ] Refresh token mechanism
   - [ ] Password reset via email
   - [ ] OAuth integration (Google, Facebook)
   - [ ] Two-factor authentication (2FA)

2. **API Features**

   - [ ] Pagination cho list endpoints
   - [ ] Search & filtering
   - [ ] Sorting options
   - [ ] File upload (avatar, certificates)
   - [ ] WebSocket support (real-time features)

3. **Security**

   - [ ] Helmet.js security headers
   - [ ] Redis-based rate limiting
   - [ ] Request validation với Joi/Yup
   - [ ] SQL injection prevention enhancements
   - [ ] CSRF protection

4. **Performance**

   - [ ] Redis caching layer
   - [ ] Database query optimization
   - [ ] Response compression
   - [ ] CDN integration

5. **Monitoring**

   - [ ] Winston logging
   - [ ] Sentry error tracking
   - [ ] Performance metrics
   - [ ] API analytics

6. **Testing**

   - [ ] Unit tests (Jest)
   - [ ] Integration tests
   - [ ] E2E tests
   - [ ] Load testing

7. **Documentation**
   - [ ] Swagger/OpenAPI documentation
   - [ ] API versioning
   - [ ] Changelog automation

---

## 🆘 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed

**Error**: `MongooseError: Failed to connect to MongoDB`

**Solutions**:

```bash
# Check MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Check connection string
echo $MONGODB_URI

# Test connection
mongo $MONGODB_URI
```

---

#### 2. JWT Token Invalid

**Error**: `401 Invalid token`

**Causes**:

- Token expired (> 24h old)
- Wrong JWT_SECRET
- Token format incorrect

**Solutions**:

```bash
# Check token expiration
# Decode JWT at https://jwt.io

# Re-login to get new token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"pass"}'
```

---

#### 3. Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::5000`

**Solutions**:

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5000
kill -9 <PID>

# Or change PORT in .env
PORT=5001
```

---

#### 4. CORS Errors

**Error**: `Access to fetch at ... has been blocked by CORS policy`

**Solutions**:

- Check `FRONTEND_URL` trong `.env` đúng với origin của frontend
- Restart server sau khi thay đổi `.env`
- Check CORS middleware configuration

---

#### 5. Admin Access Denied

**Error**: `403 Access denied. Admin privileges required.`

**Solutions**:

```bash
# Create admin user
node createAdmin.js

# Or manually update user
mongo
use typing-game
db.users.updateOne(
  { username: "your_username" },
  { $set: { isAdmin: true } }
)
```

---

## 📞 Support & Contact

### Reporting Issues

Nếu gặp vấn đề:

1. Check [Troubleshooting](#troubleshooting) section
2. Check console logs cho error messages
3. Check MongoDB logs
4. Create issue trên GitHub repository

### Contributing

Contributions are welcome! Please:

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 🙏 Credits

**Developed by**: Typing Game Team  
**Version**: 1.0.0  
**Last Updated**: October 15, 2025

**Technologies**: Node.js, Express.js, MongoDB, JWT

---

**Happy Coding! 🚀**
