# EMS Points System - Quick Reference

## Points at a Glance

| Activity | Points | Notes |
|----------|--------|-------|
| **Attendance** |
| Present/WFH | +5 | Base points per day |
| On-time Bonus | +2 | When not late |
| Late | -1 | Penalty |
| Half-day | +2.5 | Half of present |
| **Daily Updates** |
| Rich (with attachments/checklist) | +3 | High quality |
| Simple (text only) | +1 | Basic update |
| **Tasks** |
| Base Completion | +4 | All tasks |
| Priority Bonus (Low) | +0 | Total: 4 pts |
| Priority Bonus (Medium) | +2 | Total: 6 pts |
| Priority Bonus (High) | +5 | Total: 9 pts |
| **Projects** |
| Completion Per Employee | +10 | Split equally |
| Early Completion Bonus | +10 | If ahead of schedule |
| **Milestones** |
| Standard Achievement | +20 | Admin awarded |
| Premium Achievement | +30 | Admin awarded |
| **Penalties** |
| Minor Violation | -20 | Admin assigned |
| Moderate Violation | -50 | Admin assigned |
| Major Violation | -100 | Admin assigned |

## System Rules

- **Monthly Cap**: 200 points/month (automatic reset on 1st of month)
- **Expiry**: 24 months from creation (auto-expires)
- **Monthly Reset**: Automatic, keeps total points, resets monthly counter
- **Enforcement**: Cap enforced in real-time, excess points not awarded

## Accessing Points

### Employee
1. Go to Employee Dashboard
2. Click "My Points" in sidebar
3. View: Summary, Progress Bar, Activity Log, Leaderboard

### Admin
1. Go to Admin Dashboard
2. Open Points Management Tab
3. View: System Stats, Leaderboard, Apply Penalties, Employee Details

## Key Endpoints

| Endpoint | Method | Access | Purpose |
|----------|--------|--------|---------|
| `/api/points/my-summary` | GET | Employee | Get own points |
| `/api/points/my-history` | GET | Employee | Get own history |
| `/api/points/leaderboard` | GET | Employee | View rankings |
| `/api/points/admin/all` | GET | Admin | All employees |
| `/api/points/admin/employee/:id` | GET | Admin | Specific employee |
| `/api/points/admin/penalty` | POST | Admin | Apply penalty |
| `/api/points/admin/summary` | GET | Admin | System stats |

## Example Earning Paths

### Daily Routine
```
Morning: Attendance (Present, On-time)     = 7 pts
Mid: Daily Update (with checklist)         = 3 pts
Afternoon: Complete Task (High priority)   = 9 pts
─────────────────────────────────────────────────
Daily Total                                = 19 pts
```

### Weekly Average
```
Daily avg: 19 pts × 5 days = 95 pts/week
```

### Monthly Potential
```
Best case: 95 pts/week × 4 weeks = 380 pts
Cap limit: 200 pts (automatic cap enforcement)
Realistic: 180-200 pts/month (after cap)
```

### Project Bonus
```
3-person team, early completion
Each member: 10 (base) + 10 (early) = 20 pts
Total team reward: 60 pts
```

## Status Indicators

- 🟢 **Active** - Points valid, within 24-month window
- 🔴 **Expired** - Past 24-month window, historical only
- 📊 **Capped** - Monthly limit reached, no more points this month
- 🎯 **In Progress** - Monthly counter accumulating

## Dashboard Views

### Employee Dashboard - My Points Tab
```
┌─────────────────────────────────────┐
│  EMS Points (Purple Card)           │
│  Total: XXX  | This Month: YYY/200  │
│  Expiry: DATE | Status: Active      │
├─────────────────────────────────────┤
│  Monthly Progress (Progress Bar)    │
│  [████████░░░░░░░░░░░░] 72.5%      │
├─────────────────────────────────────┤
│  Recent Activity (List)             │
│  • Description | +X pts | Date      │
│  • Description | -X pts | Date      │
├─────────────────────────────────────┤
│  How to Earn Points (Guide)         │
│  📍 Attendance, 📝 Updates, etc.    │
├─────────────────────────────────────┤
│  LEADERBOARD (TOP 10)               │
│  🥇 Employee1 | 890 pts             │
│  🥈 Employee2 | 845 pts             │
│  🥉 Employee3 | 810 pts             │
│  #4  Employee4 | 780 pts            │
└─────────────────────────────────────┘
```

### Admin Points Management
```
┌─ System Statistics (5 KPI Cards) ────┐
│ Total Employees | Points Distributed │
│ Average Points  | Active Employees   │
│ Point Range (Min-Max)                │
├──────────────────────────────────────┤
│ Search: [____________________]       │
│ Sort: [By Total] [By Monthly] [Name] │
│ [Apply Penalty] [Refresh]            │
├──────────────────────────────────────┤
│ EMPLOYEE LEADERBOARD TABLE           │
│ Rank | Name | Total | Monthly | ... │
│  🥇  | Alice | 890 | 195/200 | ... │
│  🥈  | Bob   | 845 | 180/200 | ... │
│  ... | ...   | ... | ...     | ... │
├──────────────────────────────────────┤
│ Penalty Form:                        │
│ Employee: [Select...]                │
│ Amount: [-20] [-50] [-100]           │
│ Reason: [________________]            │
│ [Apply] [Cancel]                     │
└──────────────────────────────────────┘
```

## Common Tasks

### Mark Attendance
1. Click "Attendance" in Employee Dashboard
2. Mark status (Present, Late, WFH, etc.)
3. Auto-awarded: +5 pts (or +7 with on-time bonus)

### Post Daily Update
1. Click "Daily Updates" in Employee Dashboard
2. Add summary and checklist/attachments
3. Auto-awarded: +3 pts (rich) or +1 pt (simple)

### Complete Task
1. Update task status to "Completed"
2. Auto-awarded: +4 pts + priority bonus
3. High priority: +9 pts total

### Apply Penalty
1. Go to Admin Dashboard → Points Management
2. Click "Apply Penalty"
3. Select Employee, Amount (-20/-50/-100), Reason
4. Click "Apply Penalty"
5. Employee's points reduced immediately

### View Leaderboard
- **Employee**: My Points tab → See top 10
- **Admin**: Points Management → See all employees

### Check Expiry
- Dashboard shows expiry date (24 months)
- Expired points show 🔴 Expired badge
- Still visible but no new points awarded

## Tips & Best Practices

✅ **DO**
- Mark attendance daily for +5 pts base
- Post rich updates with checklists for +3 pts
- Complete high-priority tasks for +9 pts each
- Check leaderboard for motivation
- Note remaining monthly points

❌ **DON'T**
- Expect points beyond 200/month
- Worry about exact same points with others
- Forget about 24-month expiry window
- Assume penalties are permanent (-100 max penalty)

## Penalties - When to Apply

| Violation | Amount | Example |
|-----------|--------|---------|
| Minor | -20 | Single tardiness, minor quality issue |
| Moderate | -50 | Repeated lateness, policy violation |
| Major | -100 | Chronic absence, serious violation |

## FAQ

**Q: What happens after I reach 200 points in a month?**
A: System caps points. No more awarded until next month. Automatically resets on the 1st.

**Q: Do my points expire?**
A: Yes, after 24 months (730 days). Dashboard shows expiry date and status.

**Q: Can I earn points on weekends?**
A: No, points are only for work activities (M-F typically).

**Q: What if I miss a day?**
A: No automatic penalty, but you miss +5 attendance points.

**Q: Can I trade points for something?**
A: Not in current system. Future feature may enable redemption.

**Q: How is project completion split?**
A: Equally among all employees on the project. 3 people? Each gets equal share.

**Q: Can admins add bonus points?**
A: Yes, via milestones (+20 or +30). Penalty system available for deductions.

---

## Screenshots & Visuals

### Points Earning Flow
```
Activity → Automatic Calculation → Real-time Award → Dashboard Update
   ↓              ↓                      ↓                  ↓
Attendance    Check Rules & Cap    Add Points +    Show in Summary
Update        Enforce Monthly Limit Update History  Update Leaderboard
Task          Calculate Bonuses    Log Transaction  Refresh UI
```

### Monthly Points Cycle
```
Nov 1: Reset monthlyPoints to 0, new month starts
Nov 2-30: Earn up to 200 points/month
Nov 30, 11:59pm: 200 point cap enforced
Dec 1: monthlyPoints resets to 0, new cycle
```

---

**Last Updated**: November 19, 2025  
**For**: EMS v2.0  
**Status**: ✅ Ready to Use
