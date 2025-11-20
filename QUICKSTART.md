# EMS Quick Start Guide

## 🚀 Fast Setup (5 minutes)

### Option 1: Using Docker (Recommended)

```bash
# Clone/navigate to project
cd ems-app

# Start all services
docker-compose up -d

# Wait for services to start (30 seconds)
sleep 30

# Access the app
# Frontend: http://localhost:5173
# Backend API: http://localhost:5000
# MongoDB: localhost:27017
```

### Option 2: Manual Setup

#### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and set:
# MONGODB_URI=mongodb://localhost:27017/ems
# JWT_SECRET=your_secret_key_here

# Start MongoDB (in another terminal)
mongod

# Run backend
npm run dev
# Server runs on http://localhost:5000
```

#### Frontend Setup (in another terminal)
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# App runs on http://localhost:5173
```

## 📝 First Steps

### 1. Access the Application
- Open http://localhost:5173 in your browser

### 2. Create Your First Account
- Click on **Admin** role
- Click **Create Account**
- Fill in details:
  - First Name: John
  - Last Name: Doe
  - Email: admin@example.com
  - Password: Admin@123
- Click **Create Account**

### 3. Login
- You'll be redirected to Admin Dashboard
- Welcome! You're now logged in as Admin

### 4. Create a Client
- Navigate to **Clients** section
- Click **Add Client**
- Fill in:
  - Name: Acme Corp
  - Type: Tech Company
  - Email: contact@acmecorp.com
  - Contact Person: Jane Smith

### 5. Create a Project
- Navigate to **Projects**
- Click **New Project**
- Fill in:
  - Title: Website Redesign
  - Description: Redesign company website
  - Client: Acme Corp
  - Priority: High
  - Status: Active
  - Start Date: Today
  - End Date: 30 days from now
  - Estimated Hours: 160

### 6. Create an Employee
- Navigate to **Employees**
- Click **Add Employee**
- Fill in:
  - First Name: Alice
  - Last Name: Johnson
  - Email: alice@company.com
  - Phone: +1-555-0123

### 7. Assign Employee to Project
- Go to Project Details
- Click **Edit**
- Select Alice as Lead Assignee
- Save

### 8. Employee Posts Update
- Logout (click Logout button)
- Login as Employee:
  - Email: alice@company.com
  - Password: TempPassword123!
- Click **Add Update**
- Fill in:
  - Project: Website Redesign
  - Summary: Completed homepage design mockups
  - Checklist: 
    - Design mockups ✓
    - Client review pending
  - Next Plan: Await client feedback
- Click **Submit**

### 9. View Updates as Admin
- Logout and login as Admin
- Go to Project Details
- See Alice's update in the timeline

## 🔐 Test Accounts

### Admin Account
- Email: `admin@example.com`
- Password: `Admin@123`
- Role: Admin

### Employee Account
- Email: `alice@company.com`
- Password: `TempPassword123!`
- Role: Employee

### Client Account
- Email: `client@acmecorp.com`
- Password: `Client@123`
- Role: Client

## 📊 API Testing

### Test Login Endpoint
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin@123"
  }'
```

### Get Projects
```bash
curl -X GET http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🛠️ Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure MongoDB is running
```bash
# Windows
mongod

# macOS (if installed via Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**: Kill the process using the port
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

### Frontend Can't Connect to Backend
- Check if backend is running on http://localhost:5000
- Check CORS settings in backend/src/index.ts
- Verify API_URL in frontend environment

## 📚 Next Steps

1. **Explore Admin Dashboard**
   - View analytics and KPIs
   - Manage employees and clients
   - Create and track projects

2. **Employee Features**
   - Post daily updates
   - Upload attachments
   - View assigned projects
   - Track training progress

3. **Client Features**
   - View project progress
   - Access project files
   - View timelines

4. **Advanced Features**
   - Automation & Messaging
   - Audit Logs
   - Export Data
   - Real-time Notifications

## 📞 Support

For issues or questions:
1. Check the main README.md
2. Review SETUP.md for detailed configuration
3. Check browser console for errors
4. Check backend logs in terminal

## 🎯 Key Features Checklist

- ✅ Multi-role authentication (Admin, Employee, Client)
- ✅ Project management with CRUD operations
- ✅ Employee management
- ✅ Daily updates with attachments
- ✅ Client management
- ✅ Role-based dashboards
- ✅ Audit logging
- ✅ Responsive design
- ⏳ Real-time notifications (coming soon)
- ⏳ Advanced analytics (coming soon)
- ⏳ File storage integration (coming soon)

---

**Happy monitoring! 🎉**
