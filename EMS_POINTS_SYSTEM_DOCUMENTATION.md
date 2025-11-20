# EMS Points System - Complete Implementation Guide

## Overview

The Employee Monitoring System (EMS) now features a comprehensive **Points System** that gamifies employee engagement, tracks performance, and provides transparent incentives. The system tracks points earned through various activities with clear rules, monthly caps, and long-term validity.

---

## Points Scoring Rules

### 📍 Attendance Points
- **Present/WFH**: +5 points per day
- **On-time Bonus**: +2 additional points (when marked on time, not late)
- **Late**: -1 point (penalty for tardiness)
- **Half-day**: +2.5 points (half of present points)
- **Auto-awarded** when attendance is marked

### 📝 Daily Updates
- **Rich Update**: +3 points
  - Includes attachments or checklist items
  - Richer content means better quality tracking
- **Simple Update**: +1 point
  - Basic text updates
- **Auto-awarded** when update is created

### ✅ Task Management
- **Base Points**: +4 points per task completed
- **Priority Bonus**:
  - Low Priority: +0 bonus points
  - Medium Priority: +2 bonus points
  - High Priority: +5 bonus points
- **Total Example**:
  - Completing a High-priority task: +4 (base) + 5 (bonus) = **+9 points**
  - Completing a Medium-priority task: +4 (base) + 2 (bonus) = **+6 points**
- **Awarded** when task status changes to "completed"

### 🎯 Project Completion
- **Per Employee**: +10 points each
  - Shared equally among all team members
  - Based on total employees working on project
- **Early Completion Bonus**: +10 additional points
  - When project finishes before scheduled deadline
- **Total Examples**:
  - On-time completion: +10 points per employee
  - Early completion: +10 + 10 = **+20 points per employee**

### 🏆 Milestones
- **Standard Milestone**: +20 points
  - Regular achievement, team milestone
- **Premium Milestone**: +30 points
  - Critical achievement, major breakthrough
- **Manual Admin Award** - not automatic

### ⚠️ Penalties
- **Range**: -20 to -100 points
- **Minor Violation**: -20 points
- **Moderate Violation**: -50 points
- **Major Violation**: -100 points
- **Assigned By**: Admins only (via penalty form)
- **Reasons**: Tardiness, absences, policy violation, poor quality, etc.

---

## System Constraints

### Monthly Cap
- **Limit**: 200 points per calendar month
- **Reset**: Automatic on 1st of each month
- **Behavior**: Once monthly cap is reached, no more points awarded that month
- **Remaining Counter**: Shows points left in current month on dashboard

### Expiry Date
- **Validity**: 24 months from creation/last reset
- **Auto-expiry**: Points become inactive after 24 months
- **Status**: Dashboard clearly shows expiry date and active/inactive status
- **Calculation**: 24-month validity window = 730 days (accounting for leap years)

### Monthly Reset
- **Automatic**: Every month resets the monthly counter
- **Total Points**: Continues to accumulate (not reset)
- **Date**: First day of each calendar month
- **Display**: Current month shown as YYYY-MM format

---

## Backend Implementation

### Database Model (`backend/src/models/Points.ts`)

```typescript
interface IPoints {
  employeeId: ObjectId;          // Reference to User
  totalPoints: number;            // Lifetime total
  monthlyPoints: number;          // Current month total
  currentMonth: string;           // "YYYY-MM" format
  transactions: IPointsTransaction[];  // Activity log
  lastReset: Date;               // Last monthly reset
  expiryDate: Date;              // 24-month expiry
  isActive: boolean;             // Validity flag
}

interface IPointsTransaction {
  activityType: 'attendance' | 'daily_update' | 'task' | 'project_completion' | 'milestone' | 'penalty';
  points: number;                // Can be negative for penalties
  description: string;           // Human-readable description
  metadata: {
    attendanceStatus?: string;
    updateType?: 'rich' | 'simple';
    taskId?: ObjectId;
    taskPriority?: 'low' | 'medium' | 'high';
    projectId?: ObjectId;
    milestoneType?: string;
    penaltyReason?: string;
  };
  createdAt: Date;
}
```

### API Routes (`backend/src/routes/points.ts`)

#### Employee Endpoints (No Role Restriction)
- `GET /api/points/my-summary` - Get user's points summary
- `GET /api/points/my-history?limit=50` - Get points transaction history
- `GET /api/points/leaderboard?limit=10` - Get top 10 employees by points

#### Admin Endpoints (Admin Only)
- `GET /api/points/admin/all` - Get all employees' points ranked
- `GET /api/points/admin/employee/:employeeId` - Get specific employee details
- `POST /api/points/admin/penalty` - Apply penalty to employee
- `GET /api/points/admin/summary` - Get system-wide points summary

### Points Calculator Utility (`backend/src/utils/pointsCalculator.ts`)

Provides functions for:
- `addAttendancePoints(employeeId, status, isOnTime)`
- `addDailyUpdatePoints(employeeId, updateType)`
- `addTaskPoints(employeeId, taskId, priority)`
- `addProjectCompletionPoints(employeeIds, projectId, isEarlyCompletion)`
- `addMilestonePoints(employeeId, type, description)`
- `addPenaltyPoints(employeeId, amount, reason)`
- `getEmployeePointsSummary(employeeId)`
- `getPointsLeaderboard(limit)`
- `getPointsHistory(employeeId, limit)`

---

## Frontend Components

### 1. PointsSummary Component (`frontend/src/components/PointsSummary.tsx`)

**Location**: Employee Dashboard > My Points Tab

**Features**:
- Total points display with lifetime tracking
- Monthly progress bar (0-200 points)
- Expiry date with 24-month validity indicator
- Recent activity feed (shows last 10 transactions)
- Points earning guide with scoring breakdown
- Status indicator (Active/Expired)

**Displays**:
```
┌─ EMS Points ─────────────────────────┐
│ Total: 450 pts  │  This Month: 145  │
│ Expiry: 2025-11-19 │ Remaining: 55  │
├─ Monthly Progress ────────────────┤
│ [████████░░░░░░░░░░░░] 72.5%    │
└─────────────────────────────────────┘
```

### 2. PointsLeaderboard Component (`frontend/src/components/PointsLeaderboard.tsx`)

**Location**: Employee Dashboard > My Points Tab (bottom)

**Features**:
- Top 10 employees ranked by total points
- Medal emoji for top 3 (🥇🥈🥉)
- Total and monthly points per employee
- Recent activity for each employee
- Auto-refresh button
- Responsive design

### 3. AdminPointsManagement Component (`frontend/src/components/AdminPointsManagement.tsx`)

**Location**: Admin Dashboard > Points Management Tab

**Features**:
- System-wide statistics (total distributed, averages, ranges)
- Full leaderboard of all employees
- Search and sort functionality (by total/monthly/name)
- Penalty application form with reasons
- Status indicators (Active/Expired)
- Expiry date tracking per employee
- Points system guide card

**Admin Controls**:
- Apply penalties with reasons
- View detailed employee history
- System summary analytics
- Leaderboard management

---

## Integration Points

### When Points Are Awarded

#### Attendance Route (`backend/src/routes/attendance.ts`)
- When attendance is marked → `addAttendancePoints()` called
- Response includes points earned with transaction details

#### Updates Route (`backend/src/routes/updates.ts`)
- When daily update is created → `addDailyUpdatePoints()` called
- Automatically determines rich vs. simple based on attachments/checklist

#### Tasks Route (`backend/src/routes/tasks.ts`)
- When task status changed to "completed" → `addTaskPoints()` called
- Includes priority-based bonus calculation

#### Projects Route (Can be integrated)
- When project status changed to "completed" → `addProjectCompletionPoints()` called
- Distributes points equally to all team members
- Checks for early completion bonus

---

## User Interface Flow

### Employee View

1. **Points Tab Navigation**
   - Click "My Points" in sidebar or tab menu
   
2. **Points Summary Card**
   - View total lifetime points (purple gradient)
   - See monthly progress with percentage
   - Check expiry date and status
   
3. **Monthly Progress**
   - Visual progress bar showing 0-200 capacity
   - Remaining points counter
   - Color-coded status (green = active, red = expired)
   
4. **Activity Log**
   - Recent 10 transactions listed
   - Each shows: description, points ±, date/time
   - Green for positive, red for negative
   
5. **Leaderboard**
   - See how you rank against others
   - View top 10 employees by total points
   - Medal badges for top 3

### Admin View

1. **Points Management Tab**
   - System statistics at top (5 KPI cards)
   - Search/filter employees
   - Sort by total points, monthly points, or name
   
2. **Penalty Management**
   - Red "Apply Penalty" button
   - Form opens with: employee select, amount, reason
   - Amounts: -20 (minor), -50 (moderate), -100 (major)
   
3. **Employee Details**
   - Click chevron to expand employee row
   - View full transaction history
   - Check expiry and status
   
4. **Leaderboard Table**
   - All employees ranked
   - Real-time standings
   - Quick status check (Active/Expired)

---

## Data Persistence & Consistency

### Monthly Reset Logic
```
- Checks current month (YYYY-MM)
- If different from stored month:
  - Resets monthlyPoints to 0
  - Updates currentMonth
  - Sets lastReset to current date
  - Keeps totalPoints unchanged
```

### Expiry Check
```
- Compare expiryDate with current date
- If past expiry: mark isActive = false
- Dashboard shows "Expired" badge
- Points become read-only (historical only)
```

### Monthly Cap Enforcement
```
- Before awarding points:
  - Calculate: newTotal = monthlyPoints + pointsToAdd
  - If newTotal > 200:
    - Cap at: 200 - monthlyPoints
    - Apply capped amount
    - Add "(Capped)" to description
```

---

## Sample Scenarios

### Scenario 1: Typical Day for Employee
```
Morning:
- Mark attendance (Present, on-time)
  → +5 points (present) + 2 points (on-time) = +7 total
  
Midday:
- Post daily update with checklist
  → +3 points (rich update)
  
Afternoon:
- Complete medium-priority task
  → +4 points (base) + 2 points (priority) = +6 total

Daily Total: 7 + 3 + 6 = 16 points
```

### Scenario 2: Project Completion
```
Team Size: 3 employees
Completion: 5 days early

All employees get:
- +10 points (completion base)
- +10 points (early bonus)
- = +20 points each
```

### Scenario 3: Monthly Cap Hit
```
Employee's accumulated: 190 pts this month
New update earned: +3 pts

Calculation:
- 190 + 3 = 193 (within 200 limit)
- Award full +3 pts

Later that day, another update:
- 193 + 3 = 196 (within 200 limit)  
- Award full +3 pts

Next update:
- 196 + 3 = 199 (within 200 limit)
- Award full +3 pts

Next update after that:
- 199 + 3 = 202 (exceeds 200 limit)
- Cap at: 200 - 199 = 1 pt
- Award only +1 pt (description notes "Capped")
```

---

## Testing the System

### Test Points Earning

1. **Attendance**: Mark attendance as Present/On-time → Should earn 7 pts
2. **Update**: Post daily update with attachment → Should earn 3 pts
3. **Task**: Complete high-priority task → Should earn 9 pts
4. **Leaderboard**: Check admin leaderboard → Should see updated rankings

### Test Constraints

1. **Monthly Cap**: Post updates until 200 pts reached → Next updates should show "Capped"
2. **Penalty**: Admin applies -50 pts → Should appear in history with red badge
3. **Expiry**: Check employee with past expiry → Dashboard shows "Expired"

---

## Configuration

All point values are defined in `POINTS_CONFIG` in `backend/src/utils/pointsCalculator.ts`:

```typescript
const POINTS_CONFIG = {
  attendance: { present: 5, onTime: 2, late: -1 },
  dailyUpdates: { rich: 3, simple: 1 },
  tasks: { base: 4, priorityBonus: { low: 0, medium: 2, high: 5 } },
  projectCompletion: { base: 50, perEmployeeSplit: 10, earlyBonus: 10 },
  milestones: { standard: 20, premium: 30 },
  monthlyCapPoints: 200,
  expiryMonths: 24,
};
```

**To modify** points values: Edit this config object and restart the backend.

---

## API Response Examples

### GET /api/points/my-summary
```json
{
  "totalPoints": 345,
  "monthlyPoints": 127,
  "monthlyCapRemaining": 73,
  "currentMonth": "2025-11",
  "expiryDate": "2027-11-19",
  "isActive": true,
  "transactionCount": 24
}
```

### GET /api/points/leaderboard
```json
{
  "count": 10,
  "leaderboard": [
    {
      "rank": 1,
      "employeeName": "Alice Johnson",
      "email": "alice@company.com",
      "totalPoints": 890,
      "monthlyPoints": 195,
      "recentActivity": [...]
    }
  ]
}
```

### POST /api/points/admin/penalty
```json
{
  "success": true,
  "message": "Penalty applied successfully",
  "points": -50,
  "description": "Penalty: Chronic tardiness (-50 points)"
}
```

---

## Future Enhancements

- [ ] Points redemption system (convert points to rewards)
- [ ] Department-wide competitions with team pools
- [ ] Quarterly achievement badges
- [ ] Points transfer between employees (peer recognition)
- [ ] Exportable reports for HR analysis
- [ ] Integration with salary/bonus calculations
- [ ] Mobile app notifications for point milestones
- [ ] Social features (celebrate achievements)

---

## Troubleshooting

### Points Not Appearing
- Check if points route is registered in `index.ts`
- Verify Points model is imported
- Check if pointsCalculator functions are called in routes
- Ensure MongoDB connection is active

### Monthly Reset Not Working
- Check MongoDB connection
- Verify current month format matches YYYY-MM
- Check if Points record exists (auto-created on first use)

### Leaderboard Empty
- Ensure employees have earned at least some points
- Check if Points records are created for users
- Verify admin has proper access to /api/points/admin/all endpoint

---

## Support & Questions

For issues or questions about the Points System:
1. Check this documentation first
2. Review the code comments in points-related files
3. Check backend logs for any errors
4. Verify all API endpoints are working with Postman/API client

---

**Points System Implemented**: November 19, 2025  
**Version**: 1.0  
**Status**: Production Ready ✅
