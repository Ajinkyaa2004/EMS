# 🚀 DEPLOYMENT FIX CHECKLIST

## ✅ Changes Made to Fix Login Errors

### Backend Changes:
1. ✅ Fixed CORS configuration to allow your frontend domain (`https://ems-frontend-ten-sandy.vercel.app`)
2. ✅ Added proper error logging for MongoDB connection issues
3. ✅ Created Vercel serverless function entry point (`/api/index.ts`)
4. ✅ Updated `vercel.json` to use the correct entry point
5. ✅ Added root health check endpoint
6. ✅ Added 404 handler for better debugging
7. ✅ Improved error messages in login route
8. ✅ Added MongoDB connection state checking

### Frontend Status:
- ✅ `.env.production` already correctly configured with backend URL

## 🎯 ACTION REQUIRED: Set Environment Variables on Vercel

### Backend Environment Variables (CRITICAL - Must be set!):

Go to https://vercel.com/dashboard → Select `ems-backend-psi` → Settings → Environment Variables

Add these 3 variables:

1. **MONGODB_URI**
   - Value: Your MongoDB Atlas connection string
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/ems?retryWrites=true&w=majority`
   - Environment: Production ✅

2. **JWT_SECRET**
   - Value: Any long random string (keep it secret!)
   - Example: `8f3a9b2c5d7e1f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2c4d6e8f0a2c`
   - Environment: Production ✅

3. **CORS_ORIGIN**
   - Value: `https://ems-frontend-ten-sandy.vercel.app`
   - Environment: Production ✅

### Frontend Environment Variables:

Go to https://vercel.com/dashboard → Select `ems-frontend-ten-sandy` → Settings → Environment Variables

1. **VITE_API_BASE_URL**
   - Value: `https://ems-backend-psi.vercel.app/api`
   - Environment: Production ✅

## 📋 Deployment Steps:

### Step 1: Commit and Push Changes
```bash
cd /Users/ajinkya/Downloads/ems-app2.0\ 2
git add .
git commit -m "Fix: Backend CORS, Vercel config, and error handling for production"
git push origin main
```

### Step 2: Set Backend Environment Variables
1. Go to Vercel Dashboard
2. Click on `ems-backend-psi` project
3. Settings → Environment Variables
4. Add MONGODB_URI, JWT_SECRET, CORS_ORIGIN (see values above)
5. Click Save

### Step 3: Set Frontend Environment Variables
1. Go to Vercel Dashboard
2. Click on `ems-frontend-ten-sandy` project
3. Settings → Environment Variables
4. Add VITE_API_BASE_URL: `https://ems-backend-psi.vercel.app/api`
5. Click Save

### Step 4: Redeploy Both Projects
1. **Backend**: Go to Deployments → Latest deployment → Three dots → Redeploy → Uncheck "Use existing Build Cache"
2. **Frontend**: Go to Deployments → Latest deployment → Three dots → Redeploy → Uncheck "Use existing Build Cache"

### Step 5: Test the Deployment
1. Visit: https://ems-backend-psi.vercel.app/
   - Should see API info JSON
2. Visit: https://ems-backend-psi.vercel.app/api/health
   - Should see: `{"status":"ok","timestamp":"...","mongodb":"connected","environment":"production"}`
3. Visit: https://ems-frontend-ten-sandy.vercel.app/
   - Try logging in with admin credentials

## 🧪 Testing Login

### Admin Credentials (if you've created them):
- Email: `admin@ems.com`
- Password: `admin123` (or whatever you set)

### If No Users Exist:
You need to create users first. Options:

1. **Run the creation script locally** (connects to your MongoDB):
   ```bash
   cd backend
   node create-production-users.mjs
   ```

2. **Or manually add a user** via MongoDB Atlas web interface

## 🔍 Troubleshooting

### If login still fails:

1. **Check Backend Logs**:
   - Go to Vercel Dashboard → ems-backend-psi → Deployments → Latest → View Function Logs
   - Look for error messages

2. **Check if environment variables are set**:
   - Visit: https://ems-backend-psi.vercel.app/api/health
   - If `mongodb: "disconnected"`, check MONGODB_URI

3. **Check CORS errors**:
   - Open browser console on frontend
   - If you see CORS errors, verify CORS_ORIGIN is set correctly

4. **Check MongoDB connection**:
   - Make sure your MongoDB Atlas cluster allows connections from anywhere (0.0.0.0/0)
   - Or add Vercel's IP ranges

## 📝 Important Notes:

- ⚠️ The environment variables are REQUIRED for the app to work
- ⚠️ After setting env vars, you MUST redeploy
- ⚠️ MongoDB Atlas must allow external connections
- ⚠️ Make sure you have at least one user created in the database

## ✅ Success Indicators:

- [ ] Backend health endpoint returns `mongodb: "connected"`
- [ ] Frontend loads without console errors
- [ ] Login page shows no CORS errors
- [ ] Login with valid credentials works
- [ ] JWT token is stored in localStorage
- [ ] Dashboard loads after successful login

---

Need help with MongoDB Atlas setup? See: VERCEL_ENV_SETUP.md
