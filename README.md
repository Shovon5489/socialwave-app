# 🌊 SocialWave — Social Media Platform

![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=flat-square&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)

> **SocialWave** is a full-stack social media platform built with the MERN stack (MongoDB, Express.js, React, Node.js). It delivers a feature-rich, responsive social networking experience — complete with posts, stories, friends, real-time notifications, hashtags, and privacy controls.

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure register, login, and logout with token-based sessions
- 📝 **Rich Posts** — Create, edit, and delete posts with text, images, and videos
- ❤️ **Interactions** — Like, comment, reply to comments, and share posts
- 👥 **Friend System** — Send, accept, and decline friend requests
- 👁️ **Follow / Unfollow** — Follow users independently of friendship
- 🔔 **Notifications** — Real-time notification feed for likes, comments, friend requests, and more
- 📖 **Stories** — 24-hour ephemeral photo and video stories with viewer tracking
- 🔍 **Search** — Full-text search across users and posts
- 🏷️ **Hashtags** — Hashtag extraction, clickable tags, and trending hashtags
- 👤 **Profile Management** — Avatar, cover photo, bio, location, website, and date of birth
- 📱 **Responsive Design** — Mobile-first layout that works on any screen size
- 🔒 **Privacy Controls** — Set each post to public, friends-only, or private
- 💾 **Bookmarks** — Save and revisit posts from your personal collection
- 🌐 **Infinite Scroll** — Smooth, paginated feed with automatic loading

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + Vite | UI framework and build tool |
| **Frontend** | Tailwind CSS | Utility-first styling |
| **Frontend** | React Router v6 | Client-side routing |
| **Frontend** | Axios | HTTP client for API requests |
| **Frontend** | Context API + useReducer | Global state management |
| **Backend** | Node.js + Express.js | REST API server |
| **Backend** | Multer | File upload handling |
| **Backend** | express-validator | Request input validation |
| **Auth** | JWT (jsonwebtoken) | Stateless authentication |
| **Auth** | bcryptjs | Password hashing |
| **Database** | MongoDB | NoSQL document database |
| **Database** | Mongoose | ODM for MongoDB |

---

## 📁 Project Structure

```
socialwave/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── postController.js
│   │   │   ├── notificationController.js
│   │   │   └── searchController.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Post.js
│   │   │   ├── Notification.js
│   │   │   └── Story.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── posts.js
│   │   │   ├── notifications.js
│   │   │   └── search.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── upload.js
│   │   ├── utils/
│   │   │   └── seedData.js
│   │   └── server.js
│   ├── uploads/
│   │   └── .gitkeep
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   ├── post/
│   │   │   ├── user/
│   │   │   ├── story/
│   │   │   └── ui/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Notifications.jsx
│   │   │   └── Search.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
├── uploads/
│   └── .gitkeep
├── .gitignore
├── README.md
├── PROJECT_REPORT.md
└── DEPLOYMENT.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher — [Download](https://nodejs.org/)
- **MongoDB** v7+ running locally, or a [MongoDB Atlas](https://www.mongodb.com/atlas) account
- **Git** — [Download](https://git-scm.com/)
- **npm** v9+ (bundled with Node.js)

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/yourusername/socialwave.git
cd socialwave
```

**2. Set up the backend**

```bash
cd backend
npm install
cp .env.example .env
# Open .env and configure your MongoDB URI and JWT secret
```

**3. Set up the frontend**

```bash
cd ../frontend
npm install
cp .env.example .env
# Open .env and verify VITE_API_URL points to your backend
```

**4. Seed sample data (optional)**

```bash
cd ../backend
node src/utils/seedData.js
```

**5. Start the development servers**

Open two terminal windows:

```bash
# Terminal 1 — Backend (from /backend)
npm run dev

# Terminal 2 — Frontend (from /frontend)
npm run dev
```

**6. Open in browser**

Navigate to [http://localhost:3000](http://localhost:3000)

> Backend API is available at [http://localhost:5000/api](http://localhost:5000/api)

---

## 📡 API Documentation

All API responses follow this standard format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### 🔐 Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | ❌ | Register a new account |
| `POST` | `/api/auth/login` | ❌ | Login and receive JWT |
| `POST` | `/api/auth/logout` | ✅ | Logout (client-side token removal) |
| `GET` | `/api/auth/me` | ✅ | Get current authenticated user |

**Register example:**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"johndoe","email":"john@example.com","password":"secret123","firstName":"John","lastName":"Doe"}'
```

### 👤 Users (`/api/users`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/users/:id` | ✅ | Get user profile |
| `PUT` | `/api/users/profile` | ✅ | Update own profile |
| `POST` | `/api/users/:id/friend-request` | ✅ | Send friend request |
| `PUT` | `/api/users/:id/friend-request/accept` | ✅ | Accept friend request |
| `DELETE` | `/api/users/:id/friend-request` | ✅ | Decline/cancel friend request |
| `DELETE` | `/api/users/:id/unfriend` | ✅ | Unfriend a user |
| `POST` | `/api/users/:id/follow` | ✅ | Follow a user |
| `DELETE` | `/api/users/:id/follow` | ✅ | Unfollow a user |
| `GET` | `/api/users/:id/friends` | ✅ | List user's friends |
| `GET` | `/api/users/:id/followers` | ✅ | List user's followers |
| `POST` | `/api/users/avatar` | ✅ | Upload avatar image |
| `POST` | `/api/users/cover` | ✅ | Upload cover photo |

### 📝 Posts (`/api/posts`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/posts/feed` | ✅ | Get paginated home feed |
| `POST` | `/api/posts` | ✅ | Create a new post |
| `GET` | `/api/posts/:id` | ✅ | Get single post |
| `PUT` | `/api/posts/:id` | ✅ | Edit own post |
| `DELETE` | `/api/posts/:id` | ✅ | Delete own post |
| `POST` | `/api/posts/:id/like` | ✅ | Like / unlike a post |
| `POST` | `/api/posts/:id/comments` | ✅ | Add a comment |
| `DELETE` | `/api/posts/:id/comments/:commentId` | ✅ | Delete a comment |
| `POST` | `/api/posts/:id/comments/:commentId/replies` | ✅ | Reply to a comment |
| `POST` | `/api/posts/:id/share` | ✅ | Share / repost |
| `GET` | `/api/posts/user/:userId` | ✅ | Get user's posts |
| `GET` | `/api/posts/hashtag/:tag` | ✅ | Get posts by hashtag |
| `POST` | `/api/posts/:id/save` | ✅ | Save / unsave a post |
| `GET` | `/api/posts/saved` | ✅ | Get saved posts |

### 🔔 Notifications (`/api/notifications`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/notifications` | ✅ | Get all notifications |
| `PUT` | `/api/notifications/:id/read` | ✅ | Mark notification as read |
| `PUT` | `/api/notifications/read-all` | ✅ | Mark all as read |
| `DELETE` | `/api/notifications/:id` | ✅ | Delete a notification |

### 🔍 Search (`/api/search`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/search?q=keyword` | ✅ | Search users and posts |
| `GET` | `/api/search/users?q=keyword` | ✅ | Search users only |
| `GET` | `/api/search/posts?q=keyword` | ✅ | Search posts only |
| `GET` | `/api/search/hashtags/trending` | ✅ | Get trending hashtags |

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `5000` | Port the server listens on |
| `MONGODB_URI` | Yes | — | MongoDB connection string |
| `JWT_SECRET` | Yes | — | Secret key for signing JWTs |
| `JWT_EXPIRE` | No | `7d` | JWT expiry duration |
| `NODE_ENV` | No | `development` | Runtime environment |
| `FRONTEND_URL` | No | `http://localhost:3000` | CORS allowed origin |
| `MAX_FILE_SIZE` | No | `10485760` | Max upload size in bytes (10 MB) |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Base URL for the backend API |
| `VITE_APP_NAME` | No | Display name of the application |
| `VITE_APP_VERSION` | No | Application version string |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a Pull Request against `main`

Please follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">Built with ❤️ using the MERN Stack</p>
