# School-Style Attendance System Implementation

## Overview
A comprehensive attendance tracking system has been implemented in the EMS with school-style marking, project selection, and real-time activity monitoring.

---

## Database Models

### 1. **Attendance Model** (`backend/src/models/Attendance.ts`)
Tracks employee attendance for each day.

**Schema:**
- `employeeId`: Reference to User
- `date`: Date of attendance (unique per employee per day)
- `status`: Enum - `Present`, `Absent`, `Late`, `Half-day`, `On Leave`, `WFH`
- `checkInTime`: Timestamp when attendance is marked
- `checkOutTime`: Timestamp when leaving
- `workingMinutes`: Total working duration
- `selectedProjectId`: Project employee chose to work on
- `notes`: Additional notes
- `markedAt`: When the attendance was marked

**Unique Constraint:** `employeeId` + `date` (one attendance record per employee per day)

---

### 2. **ProjectSession Model** (`backend/src/models/ProjectSession.ts`)
Tracks employee's active work sessions on projects.

**Schema:**
- `employeeId`: Employee working
- `projectId`: Project being worked on
- `attendanceId`: Link to attendance record
- `sessionStartTime`: When session started
- `sessionEndTime`: When session ended
- `status`: Enum - `Active`, `Idle`, `Offline`
- `lastActivityTime`: Last user activity timestamp
- `totalActiveMinutes`: Minutes actively working
- `totalIdleMinutes`: Minutes idle
- `screenActivityLog`: Array of activity events with duration

---

## Backend Routes

### Attendance Routes (`/api/attendance`)

#### Employee Endpoints
- **POST `/mark`** - Mark attendance for the day
  - Body: `{ status, selectedProjectId?, notes? }`
  - Auto-creates project session if `Present`/`WFH`/`Late`
  
- **GET `/today`** - Get today's attendance for current employee
  
- **GET `/date/:date`** - Get attendance for specific date
  
- **GET `/history`** - Get attendance history with date range filter
  - Query: `?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

#### Admin Endpoints
- **GET `/admin/date/:date`** - Get all attendance for a specific date
  - Returns daily register with all employees
  - Sorted by employee name
  
- **GET `/admin/range`** - Get attendance for date range
  - Query: `?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
  - Returns sorted attendance records
  
- **GET `/admin/realtime`** - Get real-time activity snapshot
  - Returns today's attendance
  - Returns all active project sessions
  
- **PUT `/:id/status`** - Update attendance status
  - Body: `{ status }`
  - Ends active sessions if marked Absent/On Leave/Half-day

---

### Project Session Routes (`/api/sessions`)

#### Employee Endpoints
- **POST `/start`** - Start a new project session
  - Body: `{ projectId }`
  - Requires attendance marked for today
  - Prevents multiple concurrent sessions
  
- **POST `/end`** - End current project session
  - Calculates total active minutes
  - Sets status to Offline
  
- **GET `/current`** - Get current active session
  
- **GET `/history`** - Get session history with date range
  - Query: `?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

#### Admin Endpoints
- **GET `/admin/active`** - Get all active sessions across employees
  
- **GET `/admin/summary/:employeeId/:date`** - Session summary for employee on date
  - Returns all sessions and total hours worked

---

## Frontend Components

### 1. **AttendanceCard** (`frontend/src/components/AttendanceCard.tsx`)
Employee attendance marking interface.

**Features:**
- Project selection dropdown (from assigned projects)
- Status buttons: Present, Late, WFH, Absent, Half-day, On Leave
- Check-in/Check-out time display
- Real-time status confirmation
- Error and success messages

**States:**
- Not marked: Shows form to mark attendance
- Marked: Shows attendance summary with badge

---

### 2. **AttendanceRegister** (`frontend/src/components/AttendanceRegister.tsx`)
Admin daily attendance register view.

**Features:**
- Date picker for viewing any day's attendance
- Auto-refresh capability
- Statistics cards showing:
  - Present count
  - Absent count
  - Late count
  - WFH count
  - On Leave count
  - Half-day count
- Attendance table with columns:
  - Employee name & email
  - Status badge (color-coded)
  - Check-in time
  - Check-out time
  - Selected project
  - Working duration
- **CSV Export** functionality to download daily register

---

### 3. **RealtimeActivityMonitor** (`frontend/src/components/RealtimeActivityMonitor.tsx`)
Real-time monitoring of employee activity.

**Features:**
- Active sessions display with:
  - Employee name & email
  - Project they're working on
  - Session status icon (Active/Idle/Offline)
  - Color-coded status badges
  - Session duration in HH:MM:SS format
  - Last activity time
- Today's attendance summary table
- Auto-refresh (10-second interval)
- Manual refresh button
- Auto-refresh toggle

---

## UI Integration

### Employee Dashboard
Added **Attendance Tab** to employee dashboard with:
- Attendance marking interface
- Project selection from assigned projects
- Today's status display

### Admin Dashboard
Added two new tabs:
1. **Attendance Register Tab**
   - View daily attendance records
   - Filter by date
   - Export to CSV
   - Statistics summary

2. **Real-time Activity Tab**
   - Monitor active employee sessions
   - See which projects employees are working on
   - Track activity status (Active/Idle/Offline)
   - View today's attendance snapshot

---

## Attendance Status Reference

| Status | Color | Meaning |
|--------|-------|---------|
| Present | Green | Employee present at office |
| Late | Yellow | Employee arrived late |
| WFH | Blue | Working from home |
| Absent | Red | Employee absent |
| Half-day | Orange | Employee worked half day |
| On Leave | Purple | Employee on leave |

---

## Activity Status Reference

| Status | Indicator | Meaning |
|--------|-----------|---------|
| Active | Pulsing Green | Employee actively working |
| Idle | Yellow Clock | Employee inactive but session open |
| Offline | Red WiFi Off | Employee offline/session ended |

---

## Key Features Implemented

✅ **Attendance Marking**
- Simple one-click marking with status selection
- Required project selection for working statuses
- Time-based check-in/check-out

✅ **Project Tracking**
- Employees choose project when marking present
- Admin sees which project each employee selected
- Auto-creates project session on attendance mark

✅ **Real-time Activity**
- Track employee active sessions
- Monitor active/idle/offline status
- Last activity timestamp
- Session duration tracking

✅ **Admin Monitoring**
- Daily attendance register
- Real-time activity dashboard
- Attendance statistics
- CSV export for records

✅ **Data Persistence**
- All attendance and sessions stored in MongoDB
- Compound index prevents duplicate daily records
- Linked attendance-session relationships

---

## API Endpoints Summary

```
POST   /api/attendance/mark                    → Mark attendance
GET    /api/attendance/today                   → Get today's attendance
GET    /api/attendance/date/:date              → Get date's attendance
GET    /api/attendance/history                 → Get history
GET    /api/attendance/admin/date/:date        → Daily register
GET    /api/attendance/admin/range             → Date range register
GET    /api/attendance/admin/realtime          → Real-time snapshot
PUT    /api/attendance/:id/status              → Update status

POST   /api/sessions/start                     → Start session
POST   /api/sessions/end                       → End session
GET    /api/sessions/current                   → Current session
GET    /api/sessions/history                   → Session history
GET    /api/sessions/admin/active              → All active sessions
GET    /api/sessions/admin/summary/:emp/:date  → Employee summary
```

---

## Testing Checklist

- [ ] Employee marks Present with project selection
- [ ] Attendance marked and visible on dashboard
- [ ] Admin can view daily attendance register
- [ ] Admin can export attendance to CSV
- [ ] Real-time activity shows active sessions
- [ ] Session status updates (Active/Idle/Offline)
- [ ] Changing attendance status ends sessions
- [ ] Unique attendance per employee per day enforced
- [ ] Project sessions link correctly to attendance
- [ ] Statistics calculations are accurate

---

## Usage Instructions

### For Employees:
1. Go to "Attendance" tab in dashboard
2. Select your project from the dropdown
3. Click one of the attendance status buttons
4. System automatically tracks your session

### For Admins:
1. Go to "Attendance Register" tab to view daily records
2. Select a date and view all employee attendance
3. Export CSV for records
4. Go to "Real-time Activity" tab to monitor active sessions
5. See which projects employees are working on
6. Track their active/idle/offline status

---

## Notes

- Attendance records are unique per employee per day (enforced by database index)
- Project sessions require a marked attendance first
- Only one active session per employee at a time
- CSV export includes all attendance details
- Real-time data refreshes every 10 seconds
- All timestamps stored in UTC in database
- Session duration calculated in minutes
