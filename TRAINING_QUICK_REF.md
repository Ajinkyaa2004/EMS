# Employee Training - Quick Reference

## 🚀 Quick Start

### Access Training Feature
1. Login as Admin: `admin@gmail.com / Admin@123`
2. Click "Training" in sidebar (below "Meetings")
3. Click "Assign Training" to create training task

### Trainee Credentials
- Email: `trainee@gmail.com`
- Password: `Trainee@123`
- Name: Rohan Kumar

## 📋 Admin Actions

### Assign Training Task
```
1. Click "Assign Training" button
2. Fill in:
   - Title (required)
   - Description (required)
   - Select Trainee (required)
   - Deadline (required)
   - Resources (optional)
3. Click "Assign Training"
```

### View Training Tasks
- See all assigned training tasks in table
- Monitor progress (0-100%)
- Check status (pending/in-progress/completed)
- View trainee details

### Delete Training Task
- Click "Delete" button in Actions column
- Confirm deletion

## 🎯 Training Task Lifecycle

```
1. Admin assigns training → Status: pending (0%)
2. Trainee starts → Status: in-progress (0-99%)
3. Trainee completes → Status: completed (100%)
```

## 🔗 API Endpoints

```
GET    /api/training              - All training tasks
GET    /api/training/my-trainings - My training tasks (trainee)
GET    /api/training/trainees     - All trainees
POST   /api/training              - Create training task
PUT    /api/training/:id          - Update training task
DELETE /api/training/:id          - Delete training task
```

## 📊 Features Overview

### ✅ Implemented
- Training task CRUD operations
- Trainee management
- Progress tracking (0-100%)
- Status management (pending/in-progress/completed)
- Resource links
- Deadline tracking
- Admin dashboard integration
- Responsive design

### 🔄 Coming Soon (Trainee Dashboard)
- View assigned tasks
- Update progress
- Mark tasks complete
- View resources
- Track deadlines

## 🎨 UI Components

### Training Tab
- Header with "Assign Training" button
- Training assignment form (modal)
- Training tasks table
- Trainees overview grid

### Color Scheme
- Primary: Blue-to-Indigo gradients
- Status Colors:
  * Green: Completed
  * Yellow: In Progress
  * Gray: Pending

## 📝 Sample Training Tasks

### Example 1: React Basics
```
Title: React Fundamentals
Description: Learn React hooks, components, and state management
Trainee: Rohan Kumar
Deadline: 2 weeks from today
Resources: https://react.dev/learn
```

### Example 2: API Integration
```
Title: RESTful API Development
Description: Learn to build REST APIs with Express and MongoDB
Trainee: Rohan Kumar
Deadline: 3 weeks from today
Resources: https://expressjs.com/guide
```

### Example 3: Database Design
```
Title: MongoDB Schema Design
Description: Master MongoDB schema patterns and best practices
Trainee: Rohan Kumar
Deadline: 1 week from today
Resources: https://www.mongodb.com/docs/manual/
```

## 🔧 Troubleshooting

### Issue: Trainee not showing in dropdown
**Solution:** Run `node create-users.mjs` in backend folder

### Issue: Training tasks not loading
**Solution:** Check backend is running on port 5000

### Issue: Cannot delete training task
**Solution:** Ensure logged in as admin

## 📱 Mobile Support

- Fully responsive design
- Touch-optimized buttons
- Swipeable tables
- Mobile navigation menu

## 🔒 Security

- JWT authentication required
- Admin-only: Create, Delete
- Trainee: View own tasks, Update progress
- Role-based access control

## 📈 Progress Tracking

### Progress Bar Colors
- 0-33%: Red gradient
- 34-66%: Yellow gradient
- 67-100%: Green gradient

### Status Badges
- **Pending**: Gray background
- **In Progress**: Yellow background  
- **Completed**: Green background

## 🎓 Training Employee Info

```json
{
  "firstName": "Rohan",
  "lastName": "Kumar",
  "email": "trainee@gmail.com",
  "password": "Trainee@123",
  "role": "employee",
  "phone": "+1-555-0199",
  "isTrainee": true
}
```

## 🚦 Status

**Backend:** ✅ Ready
**Frontend Admin:** ✅ Ready  
**Frontend Trainee:** ⏳ Coming Soon

---

**Last Updated:** 2025
**Version:** 1.0.0
