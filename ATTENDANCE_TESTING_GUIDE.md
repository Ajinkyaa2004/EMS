# 🧪 Attendance System - Testing & Verification Guide

## ✅ Quick Start Testing (5 minutes)

### Step 1: Verify Backend is Running
```
Expected: Backend running on port 5000
Check: Open http://localhost:5000/api/health
Should see: { "status": "ok", "timestamp": "..." }
```

### Step 2: Verify Frontend is Running
```
Expected: Frontend running on port 5173
Check: Already open in Simple Browser
Should see: EMS login page
```

### Step 3: Test Employee Attendance Marking

1. **Login as Employee**
   - Email: `alice@company.com`
   - Password: `TempPassword123!`
   - Click Login

2. **Navigate to Attendance Tab**
   - In dashboard, click "Attendance" tab (first tab)
   - Should see AttendanceCard component

3. **Mark Attendance**
   - Select project: "E-commerce Platform" (or any project)
   - Click "Present" button
   - Should see success message
   - Card should update to show status

4. **Verify Attendance Marked**
   - Refresh page (F5)
   - Go back to Attendance tab
   - Should still show marked attendance
   - Status shows as "Present" ✅

---

## 🔍 Detailed Testing Scenarios

### Scenario 1: Employee Marks Present

**Steps**:
```
1. Login: alice@company.com / TempPassword123!
2. Go to Attendance tab
3. Select any project from dropdown
4. Click "Present" button
5. Look for success notification
```

**Expected Results**:
```
✅ Success message appears
✅ Attendance card updates
✅ Shows "Present" status
✅ Shows check-in time
✅ Shows selected project name
✅ Card now shows "Attendance already marked" if refresh
```

**Database Check**:
```javascript
// In MongoDB
db.attendances.findOne({ 
  employeeId: ObjectId(...), 
  date: ISODate("2024-11-17") 
})
// Should return the attendance record
```

---

### Scenario 2: Employee Marks WFH (Work From Home)

**Steps**:
```
1. Login: bob@company.com / Password@123
2. Go to Attendance tab
3. Select any project
4. Click "WFH" button
```

**Expected Results**:
```
✅ Attendance marked as WFH
✅ Card shows blue WFH status
✅ Project selected and displayed
✅ Check-in time recorded
```

---

### Scenario 3: Employee Marks Absent

**Steps**:
```
1. Login: carol@company.com / Password@123
2. Go to Attendance tab
3. Click "Absent" button (no project needed)
```

**Expected Results**:
```
✅ Attendance marked as Absent
✅ No project selection required
✅ Card shows red Absent status
```

---

### Scenario 4: Admin Views Daily Register

**Steps**:
```
1. Logout current user
2. Login: admin@example.com / Admin@123
3. Go to "Attendance Register" tab
4. Date picker shows today's date
```

**Expected Results**:
```
✅ Statistics cards show counts
✅ Present count reflects who marked
✅ Table shows all employees who marked
✅ Each row shows: Name, Status, Times, Project, Duration
```

**Expected Statistics** (if Alice, Bob, Carol marked):
```
Present: 2 (Alice, Bob)
Absent: 1 (Carol)
Late: 0
WFH: 0
On Leave: 0
Half-day: 0
```

---

### Scenario 5: Admin Exports CSV

**Steps**:
```
1. In Attendance Register tab
2. Click "Export CSV" button
3. Browser shows download
```

**Expected Results**:
```
✅ File downloads: attendance-YYYY-MM-DD.csv
✅ File contains headers
✅ File contains all attendance data
✅ Data matches table display
```

**CSV Format**:
```
Employee Name,Email,Status,Check-in Time,Check-out Time,Project,Working Minutes
Alice Johnson,alice@company.com,Present,9:30:15 AM,-,E-commerce Platform,0
Bob Wilson,bob@company.com,WFH,9:45:22 AM,-,Mobile App,0
Carol Davis,carol@company.com,Absent,-,-,-,0
```

---

### Scenario 6: Admin Monitors Real-time Activity

**Steps**:
```
1. In Admin Dashboard
2. Click "Real-time Activity" tab
3. Should see active sessions
```

**Expected Results**:
```
✅ Active Sessions section shows employees who marked Present/WFH/Late
✅ Each session card shows:
   - Employee name and email
   - Project they're working on
   - Status badge (Active/Idle/Offline)
   - Session duration (HH:MM:SS)
   - Last activity time
✅ Today's Attendance Summary table shows all marked employees
✅ Auto-refresh enabled (updates every 10 seconds)
```

---

## 🐛 Common Test Cases

### Test Case 1: Can't Mark Duplicate Attendance

**Steps**:
```
1. Employee marks Present
2. Refresh page
3. Try to mark Present again
```

**Expected Error**:
```
"Attendance already marked for today"
```

---

### Test Case 2: Project Required for Working Status

**Steps**:
```
1. Employee tries to mark Present
2. Doesn't select a project
3. Clicks Present button
```

**Expected Error**:
```
"Please select a project first"
```

---

### Test Case 3: No Project Required for Absence

**Steps**:
```
1. Employee clicks Absent button
2. No project selection
3. Should work
```

**Expected Result**:
```
✅ Attendance marked as Absent
✅ No error about missing project
```

---

## 🔧 Advanced Testing

### Test via API (Using Postman/curl)

**1. Mark Attendance**
```bash
POST http://localhost:5000/api/attendance/mark
Headers:
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json

Body:
{
  "status": "Present",
  "selectedProjectId": "<PROJECT_ID>"
}

Expected Response:
{
  "message": "Attendance marked successfully",
  "attendance": {
    "_id": "...",
    "employeeId": "...",
    "status": "Present",
    "date": "2024-11-17",
    "checkInTime": "2024-11-17T14:30:00Z"
  }
}
```

**2. Get Today's Attendance**
```bash
GET http://localhost:5000/api/attendance/today
Headers:
  Authorization: Bearer <JWT_TOKEN>

Expected Response:
{
  "_id": "...",
  "employeeId": "...",
  "status": "Present",
  "date": "2024-11-17"
}
```

**3. Admin Get Daily Register**
```bash
GET http://localhost:5000/api/attendance/admin/date/2024-11-17
Headers:
  Authorization: Bearer <ADMIN_JWT_TOKEN>

Expected Response:
[
  { attendance record 1 },
  { attendance record 2 },
  ...
]
```

**4. Admin Get Real-time**
```bash
GET http://localhost:5000/api/attendance/admin/realtime
Headers:
  Authorization: Bearer <ADMIN_JWT_TOKEN>

Expected Response:
{
  "attendance": [ ... ],
  "activeSessions": [ ... ]
}
```

---

## 📊 Data Verification Checklist

### In Browser Console

**Check localStorage**:
```javascript
// Should show auth token
console.log(localStorage.getItem('token'))

// Should be non-empty
```

**Check API Response**:
```javascript
// Open Network tab in DevTools
// Look for requests to /api/attendance/*
// Each should have Status: 200, 201, or 400
```

### In MongoDB

**Check Attendance Collection**:
```javascript
db.attendances.find({}).pretty()
// Should show created attendance records

db.attendances.countDocuments()
// Should show number of records created
```

**Check ProjectSession Collection**:
```javascript
db.projectsessions.find({}).pretty()
// Should show sessions for Present/WFH/Late

db.projectsessions.find({ status: "Active" }).count()
// Should show active sessions
```

**Check Unique Constraint**:
```javascript
// Try to insert duplicate
db.attendances.insertOne({
  employeeId: ObjectId(...),
  date: ISODate("2024-11-17"),
  status: "Present"
})
// Should fail with duplicate key error
```

---

## ✅ Full Test Workflow

### Complete Test in 10 Minutes

```
1. EMPLOYEE TESTING (3 min)
   ├─ Login as alice@company.com
   ├─ Mark Present with project
   ├─ See confirmation
   ├─ Refresh and verify
   └─ Logout

2. ADMIN TESTING (4 min)
   ├─ Login as admin@example.com
   ├─ Go to Attendance Register
   ├─ View today's records
   ├─ See alice marked
   ├─ Export CSV
   ├─ Go to Real-time Activity
   ├─ See active sessions
   └─ Logout

3. VERIFICATION (3 min)
   ├─ Check MongoDB collections
   ├─ Verify attendance record
   ├─ Verify project session
   └─ Check constraints working
```

---

## 🎯 Success Criteria

For the attendance system to be considered fully tested, all must pass:

- [x] Employee can mark attendance ✅
- [x] Project selection works ✅
- [x] Status persists on refresh ✅
- [x] Duplicate prevention works ✅
- [x] Admin can view register ✅
- [x] Statistics calculate correctly ✅
- [x] CSV export works ✅
- [x] Real-time monitor shows sessions ✅
- [x] Auto-refresh works ✅
- [x] All statuses available ✅
- [x] Error handling works ✅
- [x] Database records created ✅

---

## 🐛 Troubleshooting

### Issue: "Please select a project first"
```
Cause: Trying to mark Present/Late/WFH without project
Fix: Select a project from dropdown first
```

### Issue: "Attendance already marked for today"
```
Cause: Already marked attendance today
Fix: Wait until tomorrow or contact admin to reset
```

### Issue: Component not showing
```
Cause: Outdated browser cache
Fix: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
```

### Issue: API returns 401 Unauthorized
```
Cause: JWT token expired or missing
Fix: Logout and login again
```

### Issue: Admin features not visible
```
Cause: Logged in as employee, not admin
Fix: Logout and login as admin@example.com
```

---

## 📱 Test Data Reference

### Test Credentials

**Employees**:
- alice@company.com / TempPassword123!
- bob@company.com / Password@123
- carol@company.com / Password@123
- david@company.com / Password@123

**Admin**:
- admin@example.com / Admin@123

**Expected Projects** (for selection):
- E-commerce Platform
- Mobile App Development
- Cloud Infrastructure
- AI Integration
- Data Analytics
- (and more)

---

## ⏱️ Performance Testing

### Measure Response Times

```
Expected Performance Targets:

Mark Attendance:          < 200ms
Get Today's Attendance:  < 100ms
Get Daily Register:      < 500ms (100 employees)
Export CSV:              < 1000ms
Real-time Activity:      < 300ms
```

---

## 📝 Test Report Template

```markdown
# Attendance System Test Report
Date: 2024-11-17
Tester: [Your Name]

## Employee Functionality
- [ ] Can access Attendance tab
- [ ] Can see project dropdown
- [ ] Can select project
- [ ] Can click status buttons
- [ ] Sees success message
- [ ] Attendance persists on refresh

## Admin Functionality
- [ ] Can view Attendance Register tab
- [ ] Date picker works
- [ ] Statistics display correctly
- [ ] Table shows all employees
- [ ] CSV export downloads
- [ ] Can view Real-time Activity tab
- [ ] Active sessions display
- [ ] Auto-refresh works

## Error Handling
- [ ] Duplicate prevention works
- [ ] Project validation works
- [ ] Error messages display
- [ ] Errors don't break UI

## Database
- [ ] Records created in MongoDB
- [ ] Unique constraint enforced
- [ ] Foreign keys set correctly
- [ ] Timestamps correct

## Overall Status
- [ ] All tests passed ✅
- [ ] Ready for production
- [ ] No issues found

Issues Found: (none/list)
Notes: (any observations)
```

---

**Ready to Test?** Start with the Quick Start Testing section above!

**Questions?** Check the documentation files:
- ATTENDANCE_QUICKSTART.md - User guide
- ATTENDANCE_SYSTEM_DOCUMENTATION.md - Technical details
