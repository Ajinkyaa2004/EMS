# ✅ POST-ENVIRONMENT VARIABLE CHECKLIST

## You've Set Environment Variables - Great! ✅

Now follow these steps:

## Step 1: Trigger Redeploy ⚠️ CRITICAL

1. Go to: https://vercel.com/dashboard
2. Click on: **ems-backend-psi**
3. Click: **Deployments** tab
4. Find the most recent deployment
5. Click: **Three dots (...)** → **Redeploy**
6. **UNCHECK**: "Use existing Build Cache" ❌
7. Click: **Redeploy** button
8. Wait 2-3 minutes for deployment to complete

## Step 2: Monitor Deployment

Watch the deployment logs:
1. Stay on the Deployments page
2. Click on the deployment that's running
3. Watch the "Building" and "Function Logs" tabs
4. Look for:
   - ✅ "Build Completed"
   - ✅ "Deployment Ready"

## Step 3: Check for Errors

If deployment fails, check logs for:
- TypeScript compilation errors
- Missing dependencies
- Module import errors

Common issue: If you see "Cannot find module" errors, the `api/index.ts` file needs proper imports.

## Step 4: Test Endpoints

After deployment completes (status shows "Ready"), test:

### Test 1: Root Endpoint
```bash
curl https://ems-backend-psi.vercel.app/
```
**Expected**: JSON with API info and endpoints

### Test 2: Health Check
```bash
curl https://ems-backend-psi.vercel.app/api/health
```
**Expected**: 
```json
{
  "status": "ok",
  "timestamp": "...",
  "mongodb": "connected",
  "environment": "production"
}
```

### Test 3: Login Endpoint
```bash
curl -X POST https://ems-backend-psi.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ems.com","password":"admin123"}'
```
**Expected**: 
```json
{
  "message": "Login successful",
  "token": "eyJ...",
  "user": {...}
}
```

## Step 5: Test Frontend Login

1. Go to: https://ems-frontend-ten-sandy.vercel.app/
2. Try to login with:
   - Email: `admin@ems.com`
   - Password: `admin123`
3. Should redirect to dashboard

## 🔍 Troubleshooting

### If you see "FUNCTION_INVOCATION_FAILED":
- The deployment is still in progress OR
- There's a build/runtime error
- Check the Function Logs in Vercel dashboard

### If MongoDB shows "disconnected":
- Double-check MONGODB_URI is correct
- Make sure you redeployed after setting env vars
- Check MongoDB Atlas allows 0.0.0.0/0 network access

### If login still returns 500:
- Check Vercel Function Logs for error details
- Verify users exist in database (run create-production-users.mjs)
- Make sure JWT_SECRET is set

### If CORS errors persist:
- Verify CORS_ORIGIN = `https://ems-frontend-ten-sandy.vercel.app`
- Make sure backend redeployed with new code

## 📝 Current Environment Variables

Backend should have:
- ✅ MONGODB_URI: `mongodb+srv://dhumalajinkya2004_db_user:YkM387UK07DJoCI3@projects.rkmjjpd.mongodb.net/ems?retryWrites=true&w=majority`
- ✅ CORS_ORIGIN: `https://ems-frontend-ten-sandy.vercel.app`
- ✅ JWT_SECRET: `285a1b56273a83d7992588f4772b8d1f30b0d51e07ca2fbeadc32352e96cdb1e`

## ⏱️ Typical Timeline

- Set env vars: **Done** ✅
- Trigger redeploy: **2-3 minutes**
- Deployment complete: **3-5 minutes total**
- Test endpoints: **Immediate**
- Frontend login works: **Immediate after backend is ready**

---

**Current Status**: Waiting for you to redeploy backend on Vercel!

After you click "Redeploy", wait 3-5 minutes then test the health endpoint.
