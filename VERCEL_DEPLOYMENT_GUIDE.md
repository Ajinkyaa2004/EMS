# Vercel Deployment Guide for EMS Application

## ⚠️ CRITICAL ISSUES FOUND - MUST FIX BEFORE DEPLOYMENT

### 🔴 **HIGH PRIORITY FIXES NEEDED:**

## 1. Replace ALL Hardcoded localhost URLs

**Files that need updating (20+ occurrences):**

### Frontend Files with hardcoded `http://localhost:5000`:
- `frontend/src/pages/employee/Dashboard.tsx` (9 occurrences)
- `frontend/src/pages/freelancer/Dashboard.tsx` (4 occurrences)
- `frontend/src/pages/admin/ProjectDetail.tsx` (1 occurrence)
- `frontend/src/pages/trainee/Dashboard.tsx` (2 occurrences)
- `frontend/src/components/RealtimeActivityMonitor.tsx` (1 occurrence)
- `frontend/src/components/AttendanceRegister.tsx` (1 occurrence)
- `frontend/src/components/PointsSummary.tsx` (2 occurrences)
- `frontend/src/components/AttendanceCard.tsx` (1 occurrence)
- More in other files...

### ✅ WHAT I'VE ALREADY FIXED:
1. Created `frontend/src/config/api.ts` with environment variable support
2. Updated `frontend/src/context/AuthContext.tsx` to use the config
3. Created `.env` files for frontend
4. Created `vercel.json` for backend

### 🔧 WHAT YOU NEED TO DO:

## Step 1: Replace Hardcoded URLs in ALL Files

**Replace this pattern:**
```typescript
const response = await axios.get('http://localhost:5000/api/...'
```

**With this:**
```typescript
import { API_BASE_URL } from '../config/api';
const response = await axios.get(`${API_BASE_URL}/...`
```

OR use fetch:
```typescript
import { API_URL } from '../config/api';
const response = await fetch(`${API_URL}/api/...`
```

### Files to Update:

#### 1. frontend/src/pages/employee/Dashboard.tsx
Replace all 9 instances of `'http://localhost:5000/api/` with `\`${API_BASE_URL}/`

#### 2. frontend/src/pages/freelancer/Dashboard.tsx
Replace all 4 instances

#### 3. frontend/src/pages/trainee/Dashboard.tsx
Replace all 2 instances

#### 4. frontend/src/pages/admin/ProjectDetail.tsx
Replace 1 instance

#### 5. frontend/src/components/RealtimeActivityMonitor.tsx
Replace `'http://localhost:5000/api/` with `\`${API_URL}/api/`

#### 6. frontend/src/components/AttendanceRegister.tsx
Replace 1 instance

#### 7. frontend/src/components/PointsSummary.tsx
Replace 2 instances

#### 8. frontend/src/components/AttendanceCard.tsx
Replace 1 instance

#### 9. Search for ANY other files with hardcoded URLs

## Step 2: Update Backend CORS Configuration

**File: `backend/src/index.ts`**

Current:
```typescript
origin: ['http://localhost:5173', 'http://localhost:5174', process.env.CORS_ORIGIN || 'http://localhost:5173'],
```

Change to:
```typescript
origin: process.env.NODE_ENV === 'production' 
  ? [process.env.CORS_ORIGIN || 'https://your-frontend-url.vercel.app']
  : ['http://localhost:5173', 'http://localhost:5174'],
```

## Step 3: Set Up MongoDB Atlas

Your current MongoDB is localhost. For production:

1. Create a MongoDB Atlas account (free tier): https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Get the connection string
4. Add to Vercel environment variables

## Step 4: Deploy Backend to Vercel

### Backend Deployment Steps:

1. **Go to Vercel Dashboard**: https://vercel.com
2. **Import Repository**: Click "New Project" → Import your GitHub repo
3. **Configure Backend**:
   - Root Directory: `backend`
   - Framework Preset: Other
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Add Environment Variables in Vercel**:
   ```
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ems
   JWT_SECRET=your_super_secret_jwt_key_min_32_chars_long
   JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_chars
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   ```

5. **Deploy**: Click "Deploy"

6. **Copy the backend URL** (e.g., `https://your-backend.vercel.app`)

## Step 5: Deploy Frontend to Vercel

### Frontend Deployment Steps:

1. **Import Repository Again** (separate project)
2. **Configure Frontend**:
   - Root Directory: `frontend`
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Add Environment Variable in Vercel**:
   ```
   VITE_API_BASE_URL=https://your-backend-url.vercel.app/api
   ```

4. **Deploy**: Click "Deploy"

## Step 6: Update URLs After Deployment

After both are deployed:

1. **Update Backend CORS** environment variable with actual frontend URL
2. **Redeploy backend**
3. **Update Frontend** `.env.production` if needed
4. **Redeploy frontend**

## Step 7: Test Everything

Test all features:
- ✅ Login/Logout
- ✅ Admin Dashboard
- ✅ Employee Dashboard
- ✅ Client Dashboard
- ✅ Attendance System
- ✅ Points System
- ✅ Tasks
- ✅ Projects
- ✅ Messages
- ✅ Meetings

## 🚨 IMPORTANT NOTES:

1. **Database**: You MUST use MongoDB Atlas for production (localhost won't work on Vercel)
2. **LocalStorage**: Meetings are stored in localStorage - this is NOT ideal for production. Consider moving to database.
3. **JWT Secrets**: Use strong, unique secrets in production (minimum 32 characters)
4. **CORS**: Must configure properly or frontend won't be able to talk to backend

## Alternative: Single Vercel Deployment

If you want both frontend and backend in one project:

Create `vercel.json` at root:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "backend/dist/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/dist/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/dist/$1"
    }
  ]
}
```

## Files Created/Updated:

✅ `frontend/.env` - Local development environment variables
✅ `frontend/.env.example` - Template for environment variables  
✅ `frontend/.env.production` - Production environment variables (update with real URL)
✅ `frontend/src/config/api.ts` - Centralized API configuration
✅ `backend/vercel.json` - Vercel configuration for backend
✅ Updated `frontend/src/context/AuthContext.tsx` to use config

## What You Still Need to Do:

❌ Replace ALL hardcoded `http://localhost:5000` in 20+ files
❌ Update backend CORS configuration
❌ Set up MongoDB Atlas
❌ Deploy to Vercel
❌ Configure environment variables in Vercel dashboard
❌ Test thoroughly

## Quick Command to Find All Hardcoded URLs:

```bash
# In project root:
grep -r "http://localhost:5000" frontend/src/
grep -r "http://localhost:5173" backend/src/
```

## Need Help?

If you get stuck, common issues:
1. **CORS errors**: Check CORS_ORIGIN environment variable
2. **404 errors**: Check API_BASE_URL is correct
3. **Database connection**: Verify MongoDB Atlas connection string
4. **Authentication fails**: Check JWT_SECRET is set in Vercel

Good luck with deployment! 🚀
