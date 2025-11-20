# 🗄️ MongoDB Atlas Setup (5 minutes)

## Quick Setup for Your EMS App

### Step 1: Create MongoDB Atlas Account
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with Google/GitHub or email
3. Choose **FREE tier** (M0)

### Step 2: Create a Cluster
1. After login, click "Create" or "Build a Database"
2. Choose **FREE tier** (M0 Sandbox)
3. Choose a cloud provider (AWS recommended)
4. Choose a region close to you
5. Click "Create Cluster" (takes 1-3 minutes)

### Step 3: Create Database User
1. Click "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `emsadmin`
5. Password: Generate a secure password (or use: `EMS@2024!Secure`)
6. **SAVE THIS PASSWORD!** You'll need it for the connection string
7. Database User Privileges: Select "Read and write to any database"
8. Click "Add User"

### Step 4: Allow Network Access
1. Click "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for Vercel)
4. This adds `0.0.0.0/0` (required for Vercel serverless functions)
5. Click "Confirm"

### Step 5: Get Connection String
1. Click "Database" in left sidebar
2. Click "Connect" button on your cluster
3. Choose "Connect your application"
4. Choose "Node.js" as driver
5. Copy the connection string, it looks like:
   ```
   mongodb+srv://emsadmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **IMPORTANT**: Replace `<password>` with your actual password from Step 3
7. Add the database name `ems` before the `?`:
   ```
   mongodb+srv://emsadmin:EMS@2024!Secure@cluster0.xxxxx.mongodb.net/ems?retryWrites=true&w=majority
   ```

### Step 6: Test Connection (Optional but Recommended)
```bash
cd /Users/ajinkya/Downloads/ems-app2.0\ 2/backend
```

Create a test file:
```javascript
// test-connection.mjs
import mongoose from 'mongoose';

const MONGODB_URI = 'YOUR_CONNECTION_STRING_HERE';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
```

Run it:
```bash
node test-connection.mjs
```

### Step 7: Add to Vercel
1. Go to Vercel Dashboard
2. Select `ems-backend-psi` project
3. Settings → Environment Variables
4. Add:
   - Name: `MONGODB_URI`
   - Value: Your connection string from Step 5
   - Environment: Production ✅
5. Click "Save"

### Step 8: Create Initial Admin User
After MongoDB is connected and deployed, run locally:

```bash
cd backend

# Create a file: create-admin.mjs
cat > create-admin.mjs << 'EOF'
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Use your production MongoDB URI here
const MONGODB_URI = 'YOUR_MONGODB_URI_HERE';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: String,
  lastName: String,
  role: { type: String, enum: ['admin', 'manager', 'employee', 'freelancer'], default: 'employee' }
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  await mongoose.connect(MONGODB_URI);
  
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await User.create({
    email: 'admin@ems.com',
    password: hashedPassword,
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin'
  });
  
  console.log('✅ Admin created:', admin.email);
  process.exit(0);
}

createAdmin().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
EOF

# Replace YOUR_MONGODB_URI_HERE with your actual URI, then run:
node create-admin.mjs
```

### Your Connection String Format:
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/ems?retryWrites=true&w=majority
```

Example:
```
mongodb+srv://emsadmin:EMS%402024%21Secure@cluster0.abc123.mongodb.net/ems?retryWrites=true&w=majority
```

⚠️ **Note**: Special characters in password need URL encoding:
- `@` → `%40`
- `!` → `%21`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`

---

## Quick Checklist:
- [ ] MongoDB Atlas account created
- [ ] Free cluster created
- [ ] Database user created (save password!)
- [ ] Network access set to 0.0.0.0/0
- [ ] Connection string obtained
- [ ] Password replaced in connection string
- [ ] `/ems` added to connection string
- [ ] Special characters URL encoded
- [ ] Added MONGODB_URI to Vercel
- [ ] Created admin user
- [ ] Redeployed backend on Vercel

After completing all steps, your login should work! 🎉
