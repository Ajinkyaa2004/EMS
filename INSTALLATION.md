# Complete Installation Guide

## Prerequisites

Before starting, ensure you have:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** 9+ (comes with Node.js)
- **MongoDB** 7.0+ ([Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Git** (optional, for version control)
- **Docker** (optional, for containerized setup)

### Verify Installation

```bash
node --version    # Should be v18.0.0 or higher
npm --version     # Should be 9.0.0 or higher
mongod --version  # Should be 7.0.0 or higher (if installed locally)
```

---

## Installation Methods

### Method 1: Docker (Recommended - Easiest)

#### Prerequisites
- Docker Desktop installed ([Download](https://www.docker.com/products/docker-desktop))

#### Steps

1. **Navigate to project directory**
```bash
cd C:\Users\yash\CascadeProjects\ems-app
```

2. **Start all services**
```bash
docker-compose up -d
```

3. **Wait for services to initialize** (30-60 seconds)
```bash
docker-compose logs -f
```

4. **Verify services are running**
```bash
docker-compose ps
```

Expected output:
```
NAME                COMMAND                  STATUS
ems-mongodb         mongod                   Up 2 minutes
ems-backend         npm start                Up 1 minute
ems-frontend        serve -s dist -l 5173   Up 1 minute
```

5. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

6. **Stop services**
```bash
docker-compose down
```

---

### Method 2: Manual Installation (Detailed)

#### Step 1: Install MongoDB

**Option A: Local Installation**

**Windows:**
1. Download MongoDB Community Edition from https://www.mongodb.com/try/download/community
2. Run the installer
3. Choose "Install MongoDB as a Service"
4. MongoDB will start automatically

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
sudo apt-get update
sudo apt-get install -y mongodb
sudo systemctl start mongodb
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a cluster
4. Get connection string
5. Update `MONGODB_URI` in backend `.env`

#### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd C:\Users\yash\CascadeProjects\ems-app\backend

# Install dependencies
npm install

# Create environment file
copy .env.example .env

# Edit .env file with your settings
# Windows: notepad .env
# macOS/Linux: nano .env
```

**Edit `.env` file:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ems
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_in_production
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

**Start backend server:**
```bash
npm run dev
```

Expected output:
```
🚀 Server running on http://localhost:5000
✅ MongoDB connected
```

#### Step 3: Frontend Setup (New Terminal)

```bash
# Navigate to frontend directory
cd C:\Users\yash\CascadeProjects\ems-app\frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Expected output:
```
  VITE v5.0.8  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

#### Step 4: Access Application

Open your browser and go to: **http://localhost:5173**

---

## Post-Installation Setup

### 1. Create Admin Account

1. Open http://localhost:5173
2. Click on **Admin** role
3. Click **Create Account**
4. Fill in details:
   - First Name: `John`
   - Last Name: `Doe`
   - Email: `admin@example.com`
   - Password: `Admin@123`
5. Click **Create Account**

### 2. Verify Installation

**Test Backend API:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@example.com\",\"password\":\"Admin@123\"}"
```

Expected response:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "admin@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "admin"
  }
}
```

**Test Frontend:**
- Login page loads ✓
- Can create account ✓
- Can login ✓
- Dashboard displays ✓

### 3. Create Test Data

Follow the **QUICKSTART.md** guide to:
- Create a client
- Create a project
- Create an employee
- Post updates

---

## Troubleshooting

### MongoDB Connection Issues

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:27017`

**Solutions:**
```bash
# Windows - Start MongoDB service
net start MongoDB

# macOS - Start MongoDB
brew services start mongodb-community

# Linux - Start MongoDB
sudo systemctl start mongod

# Verify MongoDB is running
mongosh  # Should connect successfully
```

### Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution - Windows:**
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or change port in backend .env
# PORT=5001
```

**Solution - macOS/Linux:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### Frontend Can't Connect to Backend

**Error:** `Failed to fetch from http://localhost:5000`

**Solutions:**
1. Verify backend is running: http://localhost:5000/api/health
2. Check CORS settings in `backend/src/index.ts`
3. Check firewall settings
4. Try restarting both services

### npm Install Fails

**Error:** `npm ERR! code ERESOLVE`

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Use legacy peer deps
npm install --legacy-peer-deps

# Or upgrade npm
npm install -g npm@latest
```

### TypeScript Compilation Errors

**Error:** `Cannot find module 'express'`

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Or install types separately
npm install --save-dev @types/express @types/node
```

---

## Development Workflow

### Terminal 1: MongoDB
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Terminal 2: Backend
```bash
cd backend
npm run dev
```

### Terminal 3: Frontend
```bash
cd frontend
npm run dev
```

### Access Points
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- MongoDB: localhost:27017

---

## Building for Production

### Backend Build
```bash
cd backend
npm run build
npm start
```

### Frontend Build
```bash
cd frontend
npm run build
npm run preview
```

### Docker Build
```bash
docker-compose -f docker-compose.yml build
docker-compose -f docker-compose.yml up -d
```

---

## Environment Variables Reference

### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/ems

# Authentication
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here

# CORS
CORS_ORIGIN=http://localhost:5173

# File Upload (Optional)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=your_bucket_name

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Employee Monitoring System
```

---

## Verification Checklist

- [ ] Node.js 18+ installed
- [ ] MongoDB running
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Backend server running on :5000
- [ ] Frontend server running on :5173
- [ ] Can access http://localhost:5173
- [ ] Can create admin account
- [ ] Can login successfully
- [ ] Dashboard displays correctly
- [ ] API health check passes

---

## Next Steps

1. ✅ Installation complete
2. 📖 Read QUICKSTART.md for feature walkthrough
3. 🧪 Create test data and explore features
4. 📚 Review PROJECT_SUMMARY.md for architecture
5. 🚀 Deploy to production (see README.md)

---

## Support

If you encounter issues:

1. **Check logs**
   - Backend: Terminal where `npm run dev` is running
   - Frontend: Browser console (F12)
   - MongoDB: Check MongoDB logs

2. **Review documentation**
   - README.md - Main documentation
   - SETUP.md - Detailed setup
   - QUICKSTART.md - Quick start
   - PROJECT_SUMMARY.md - Architecture

3. **Common issues**
   - Port conflicts: Change PORT in .env
   - MongoDB connection: Verify MongoDB is running
   - CORS errors: Check CORS_ORIGIN in .env
   - Module not found: Run `npm install` again

---

**Installation Complete! 🎉**

Start exploring the Employee Monitoring System!
