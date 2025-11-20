# Attendance System - Quick Start Guide

## 🚀 Getting Started

The school-style attendance system is now integrated into your EMS. Here's how to use it:

---

## For Employees

### Step 1: Access Attendance Tab
1. Log in as an employee (e.g., `alice@company.com` / `TempPassword123!`)
2. On your dashboard, click the **"Attendance"** tab (first tab)

### Step 2: Mark Your Attendance
1. **Select a Project** from the dropdown list
   - This is the project you'll be working on today
   - Required for: Present, Late, WFH
   - Optional for: Absent, On Leave, Half-day

2. **Choose Your Status**:
   - 🟢 **Present**: Working at office on selected project
   - 🟡 **Late**: Arrived late but working on selected project
   - 🔵 **WFH**: Working from home on selected project
   - 🔴 **Absent**: Not working today (no project needed)
   - 🟠 **Half-day**: Working only part of the day
   - 🟣 **On Leave**: On approved leave (no project needed)

3. **Click the Button**
   - Once submitted, you'll see a confirmation
   - Your attendance is now tracked

### Step 3: View Your Status
- Once marked, your attendance card shows:
  - ✅ Your attendance status
  - 📅 Check-in time
  - 📊 Project you selected

---

## For Admins

### Access Point 1: Attendance Register

**Path**: Admin Dashboard → **"Attendance Register"** Tab

**Features**:
1. **Select a Date**
   - Use the date picker to view any day's attendance
   - Default: Today's date

2. **View Statistics**
   - See counts of each attendance status
   - Present, Absent, Late, WFH, On Leave, Half-day

3. **Review Register**
   - Table shows all employees' attendance
   - Includes: Name, Status, Check-in, Check-out, Project, Duration

4. **Export CSV**
   - Click "Export CSV" button
   - Downloads attendance data as spreadsheet
   - Perfect for HR records

---

### Access Point 2: Real-time Activity Monitor

**Path**: Admin Dashboard → **"Real-time Activity"** Tab

**Features**:
1. **Active Sessions**
   - See which employees are currently working
   - Shows: Name, Project, Status (Active/Idle/Offline)
   - Session duration in real-time
   - Last activity timestamp

2. **Today's Attendance Summary**
   - Quick view of today's attendance
   - Employee name, status, project, check-in time

3. **Auto-Refresh**
   - Enable/disable auto-refresh checkbox
   - Updates every 10 seconds
   - Manual refresh button available

---

## Test Data Available

Use these credentials to test:

**Employees:**
- `alice@company.com` / `TempPassword123!`
- `bob@company.com` / `Password@123`
- `carol@company.com` / `Password@123`
- `david@company.com` / `Password@123`

**Admin:**
- `admin@example.com` / `Admin@123`

**Sample Projects** (pre-created):
- E-commerce Platform
- Mobile App Development
- Cloud Infrastructure
- AI Integration
- And more...

---

## Workflow Example

### Employee Flow:
```
1. Login as Alice (alice@company.com)
2. Go to "Attendance" tab
3. Select "E-commerce Platform" project
4. Click "Present" button
5. See confirmation: "Attendance marked as Present"
6. Your card shows: ✅ Present, 9:30 AM, E-commerce Platform
```

### Admin Flow:
```
1. Login as Admin (admin@example.com)
2. Go to "Attendance Register" tab
3. See date picker (default: today)
4. View statistics: 4 Present, 0 Absent, etc.
5. Scroll table to see: Alice marked Present on E-commerce Platform
6. Click "Export CSV" to download attendance record
7. Switch to "Real-time Activity" tab
8. See Alice's active session: Alice → E-commerce Platform → Active
```

---

## Key Features Explained

### ✅ Attendance Status
- **Present**: Employee at office, working on selected project
- **Late**: Employee arrived late but marked present
- **WFH**: Working from home on selected project
- **Absent**: Employee not working
- **Half-day**: Worked only part of the day
- **On Leave**: On approved leave

### 🎯 Project Selection
- Each attendance can be linked to a specific project
- Helps track which project each employee worked on
- Shows in both attendance register and real-time monitor

### ⏱️ Activity Status
- **Active**: Employee is actively working (pulsing green)
- **Idle**: Session open but no recent activity
- **Offline**: Session ended or employee gone

### 📊 Statistics
- Automatically calculated attendance statistics
- Color-coded status badges
- Exportable data in CSV format

---

## Common Tasks

### View Today's Attendance (Admin)
1. Go to "Attendance Register" tab
2. Date picker should show today
3. Scroll through the table

### Export Weekly Attendance (Admin)
1. Go to "Attendance Register" tab
2. Click "Export CSV" button
3. Opens download in your browser

### Check Who's Currently Working (Admin)
1. Go to "Real-time Activity" tab
2. View "Active Sessions" section
3. See employees, projects, and status

### Mark Attendance Late (Employee)
1. Go to "Attendance" tab
2. Select your project
3. Click "Late" button
4. System tracks as late but session starts

---

## Important Notes

⚠️ **One Attendance Per Day**
- Can only mark attendance once per day
- If marked, status shows "Attendance already marked for today"
- Contact admin if need to change

⚠️ **Project Required for Working Statuses**
- Cannot mark Present/Late/WFH without selecting a project
- Absent/On Leave/Half-day don't require project selection

⚠️ **Real-time Data**
- Real-time Activity data refreshes every 10 seconds
- Manual refresh available via button

---

## Troubleshooting

### "Please select a project first"
- You're trying to mark Present/Late/WFH without selecting a project
- Choose a project from dropdown first

### "Attendance already marked for today"
- You've already marked attendance today
- Wait until tomorrow to mark again

### "Must mark attendance first"
- If trying to start a project session through API
- Mark attendance from "Attendance" tab first

### CSV Export Not Working
- Check browser allows downloads
- Try right-click → "Save As"
- Ensure pop-ups not blocked

---

## What's Tracked

✅ **Per Employee Daily**
- Attendance status
- Check-in time
- Check-out time
- Selected project
- Working minutes
- Attendance notes

✅ **Per Project Session**
- Employee
- Project
- Session start/end time
- Status (Active/Idle/Offline)
- Last activity time
- Total active minutes

✅ **Per Admin Dashboard**
- Daily statistics count
- Real-time employee activity
- Project assignments
- Duration tracking

---

## API Integration (For Developers)

All attendance data can be accessed via REST APIs:

```bash
# Mark attendance
POST /api/attendance/mark
{
  "status": "Present",
  "selectedProjectId": "project_id",
  "notes": "Optional notes"
}

# Get today's attendance
GET /api/attendance/today

# Admin: Get daily register
GET /api/attendance/admin/date/2024-11-17

# Get real-time activity
GET /api/attendance/admin/realtime
```

See `ATTENDANCE_SYSTEM_DOCUMENTATION.md` for complete API reference.

---

## Next Steps

1. ✅ Test marking attendance as an employee
2. ✅ View attendance register as admin
3. ✅ Monitor real-time activity
4. ✅ Export CSV records
5. 🔄 Consider integrations:
   - Email notifications on absences
   - Slack status updates
   - Weekly reports
   - Analytics dashboards

---

**Questions?** Check the full documentation in `ATTENDANCE_SYSTEM_DOCUMENTATION.md`
