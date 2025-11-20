# Vercel Environment Variables Setup Guide

## Required Backend Environment Variables

You MUST set these environment variables in your Vercel backend project:

### 1. Go to Vercel Dashboard
- Navigate to: https://vercel.com/dashboard
- Select your backend project: `ems-backend-psi`
- Go to Settings > Environment Variables

### 2. Add These Variables:

#### MONGODB_URI (REQUIRED)
- **Name:** `MONGODB_URI`
- **Value:** Your MongoDB connection string (e.g., from MongoDB Atlas)
- **Example:** `mongodb+srv://username:password@cluster.mongodb.net/ems?retryWrites=true&w=majority`
- **Environment:** Production, Preview, Development

#### JWT_SECRET (REQUIRED)
- **Name:** `JWT_SECRET`
- **Value:** A secure random string for JWT token signing
- **Example:** `your_super_secret_jwt_key_change_this_to_something_random_and_secure`
- **Environment:** Production, Preview, Development

#### CORS_ORIGIN (REQUIRED)
- **Name:** `CORS_ORIGIN`
- **Value:** `https://ems-frontend-ten-sandy.vercel.app`
- **Environment:** Production, Preview, Development

#### NODE_ENV (OPTIONAL - Auto-set by Vercel)
- **Name:** `NODE_ENV`
- **Value:** `production`
- **Environment:** Production

### 3. After Setting Environment Variables:
- Click "Save"
- Go to Deployments tab
- Click the three dots on the latest deployment
- Select "Redeploy"
- Choose "Use existing Build Cache: No"

## Required Frontend Environment Variables

### 1. Go to Vercel Dashboard
- Navigate to your frontend project: `ems-frontend-ten-sandy`
- Go to Settings > Environment Variables

### 2. Add This Variable:

#### VITE_API_BASE_URL (REQUIRED)
- **Name:** `VITE_API_BASE_URL`
- **Value:** `https://ems-backend-psi.vercel.app/api`
- **Environment:** Production, Preview, Development

### 3. After Setting Environment Variables:
- Click "Save"
- Go to Deployments tab
- Redeploy the project

## How to Get MongoDB Connection String

If you don't have MongoDB Atlas set up:

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up / Log in
3. Create a free cluster
4. Click "Connect"
5. Choose "Connect your application"
6. Copy the connection string
7. Replace `<password>` with your database password
8. Replace `<dbname>` with `ems`

## Verify Environment Variables Are Set

After deployment, visit:
- Backend health: https://ems-backend-psi.vercel.app/api/health
- Backend root: https://ems-backend-psi.vercel.app/

You should see a JSON response indicating the service is running.

## Common Issues

### Issue: 500 Internal Server Error on login
**Cause:** Missing `MONGODB_URI` or `JWT_SECRET`
**Fix:** Set the environment variables and redeploy

### Issue: CORS Error
**Cause:** `CORS_ORIGIN` not set or incorrect
**Fix:** Set `CORS_ORIGIN=https://ems-frontend-ten-sandy.vercel.app` and redeploy

### Issue: Frontend can't connect to backend
**Cause:** `VITE_API_BASE_URL` not set in frontend
**Fix:** Set `VITE_API_BASE_URL=https://ems-backend-psi.vercel.app/api` in frontend and redeploy
