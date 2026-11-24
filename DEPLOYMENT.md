# 🚀 SocialWave — Deployment Guide

This guide provides comprehensive, step-by-step instructions to run SocialWave locally and deploy it to production platforms (Vercel, Render/Railway, and MongoDB Atlas) with zero cost.

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Database Setup (MongoDB Atlas)](#database-setup-mongodb-atlas)
4. [Backend Deployment (Render)](#backend-deployment-render)
5. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
6. [GitHub Repository Setup](#github-repository-setup)
7. [Environment Variables Reference](#environment-variables-reference)
8. [Verifying Deployment & Testing](#verifying-deployment--testing)

---

## 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn**
- **Git** installed on your machine
- Free accounts on:
  - [GitHub](https://github.com)
  - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
  - [Render](https://render.com) (or Railway)
  - [Vercel](https://vercel.com)

---

## 2. Local Development Setup

### Step 1: Clone or Navigate to the Project
```bash
cd socialwave
```

### Step 2: Set up Backend
```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` with your values:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/socialwave
JWT_SECRET=super_secret_jwt_key_development_only_12345
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Step 3: Seed Sample Data
```bash
node src/utils/seedData.js
```
*Creates 5 test users with posts, friendships, and comments.*
*Default password for all sample accounts: `password123`*

### Step 4: Run Backend Server
```bash
npm run dev
# Server will run on http://localhost:5000
```

### Step 5: Set up Frontend
In a new terminal:
```bash
cd frontend
npm install
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 6: Run Frontend Server
```bash
npm run dev
# React app will open on http://localhost:3000 (or http://localhost:5173)
```

---

## 3. Database Setup (MongoDB Atlas)

1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Click **Build a Database** and select the **M0 Free Tier**.
3. Choose your closest region and click **Create**.
4. In **Security Quickstart**:
   - Create a database user (e.g. `socialwave_admin` with a strong password).
   - Under **Network Access**, click **Add IP Address** → Choose **Allow Access from Anywhere (`0.0.0.0/0`)** so hosting providers can connect.
5. Go to **Database** → **Connect** → **Drivers** (Node.js).
6. Copy your connection string:
   ```text
   mongodb+srv://socialwave_admin:<password>@cluster0.xxxxx.mongodb.net/socialwave?retryWrites=true&w=majority
   ```

---

## 4. Backend Deployment (Render)

1. Push your code to your GitHub repository (see [Section 6](#github-repository-setup)).
2. Go to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** → **Web Service**.
4. Connect your GitHub repository.
5. Configure the service:
   - **Name**: `socialwave-api`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
   - **Plan**: `Free`
6. Add **Environment Variables**:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGODB_URI`: *Your MongoDB Atlas connection URI*
   - `JWT_SECRET`: *A secure random string (at least 32 characters)*
   - `JWT_EXPIRE`: `7d`
   - `FRONTEND_URL`: *Your Vercel URL (e.g. `https://socialwave.vercel.app`)*
7. Click **Create Web Service**.
8. Once built, copy your live backend URL (e.g., `https://socialwave-api.onrender.com`).

---

## 5. Frontend Deployment (Vercel)

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** → **Project**.
3. Import your GitHub repository.
4. Configure project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://socialwave-api.onrender.com/api` (use your live backend URL from Step 4)
6. Click **Deploy**.
7. Vercel will build and assign you a live domain (e.g. `https://socialwave-app.vercel.app`).

*Note: Go back to Render environment variables and ensure `FRONTEND_URL` is set to this newly created Vercel URL so CORS allows requests.*

---

## 6. GitHub Repository Setup

To upload the project to GitHub as required:

```bash
cd C:\Users\stead\.gemini\antigravity\scratch\socialwave

# Initialize git repository
git init

# Add all files
git add .

# Initial commit
git commit -m "feat: complete SocialWave full-stack platform with docs and deployment configs"

# Add your GitHub remote repository
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/socialwave.git

# Push to main branch
git branch -M main
git push -u origin main
```

---

## 7. Environment Variables Reference

### Backend (`backend/.env`)
| Variable | Description | Example |
|---|---|---|
| `PORT` | Port server listens on | `5000` |
| `MONGODB_URI` | MongoDB connection URI | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for JWT signing | `random_secret_32_chars` |
| `JWT_EXPIRE` | Token validity duration | `7d` |
| `NODE_ENV` | Environment mode | `production` / `development` |
| `FRONTEND_URL` | Allowed client URL for CORS | `https://socialwave.vercel.app` |

### Frontend (`frontend/.env`)
| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Base API endpoint URL | `https://api.example.com/api` |

---

## 8. Verifying Deployment & Testing

1. **Sign Up**: Navigate to your live Vercel URL and create a new account via the Register page.
2. **Profile**: Update your avatar, bio, and location.
3. **Post Creation**: Create a text post and a post with photos.
4. **Interactions**: Like, comment, and share posts.
5. **Search**: Search for usernames or hashtags (`#tech`, `#photography`).
6. **Responsive Check**: Open the site on mobile or use Chrome DevTools device mode to verify responsive layout.
