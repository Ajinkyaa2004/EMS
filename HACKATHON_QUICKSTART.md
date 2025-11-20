# 🚀 Hackathon System - Quick Start Guide

## How to Access Hackathon

### Step 1: Go to Role Selection
Open: **http://localhost:5174**

You'll see role selection page with 5 options.

### Step 2: Click "Hackathon" 
The **Trophy icon** (🏆) with orange/yellow gradient

You'll see the Hackathon login page with a purple/blue gradient.

### Step 3: Login

#### As Player (Trainee)
```
Email: trainee@gmail.com
Password: Trainee@123
Select: 🎮 Player
Click: Sign In
```

#### As Admin
```
Email: admin@example.com
Password: Admin@123
Select: 👨‍💼 Admin
Click: Sign In
```

---

## Player Experience

### Dashboard Overview
- **Left Panel**: List of active hackathons
- **Main Panel**: Hackathon details and updates

### How to Submit Update

1. Click **"Submit Daily Update"** button
2. Fill in the form:
   - **Summary**: What you accomplished today
   - **Project Progress**: Detailed progress description
   - **Blockers/Issues**: Any challenges faced
   - **Next Steps**: Plan for tomorrow
   - **Hours Worked**: Number of hours
   - **Loom Video**: Recording link (optional)
3. Click **"Submit Update"**

### View Update History
- Scroll down to see all your submitted updates
- Click video links to watch recordings
- See hours worked indicator

---

## Admin Experience

### Dashboard Overview
- **Top Section**: Select hackathon from cards
- **Left Panel**: List of all players
- **Right Panel**: Selected player details and updates

### How to Manage Players

1. **Select Hackathon**
   - Click on any hackathon card to view

2. **Select Player**
   - Click on player card in left sidebar
   - See their stats and bonuses

3. **Award Bonuses**
   - **Score More Than Anmol Sir**: Click yellow "🏆 Score 2× Bonus" button
   - **One Day Completion**: Click green "⚡ One Day 2× Bonus" button

4. **View Updates**
   - Scroll down to see all player's daily updates
   - Expand task checklist to see details
   - Click video link to view Loom recording

### Bonus System

#### Score More Than Anmol Sir
- Criteria: Player score exceeds benchmark
- Benefit: 2× Prize Multiplier
- Shows as: Yellow highlighted button

#### Project Completed in One Day
- Criteria: Full project finished in 24 hours
- Benefit: 2× Prize Multiplier
- Shows as: Green highlighted button with ⚡

#### Final Prize Calculation
```
Final Prize = Base Score × Bonus Multiplier

Example:
Player Score: 100 points
No bonuses: 100 × 1 = 100
With 2× bonus: 100 × 2 = 200
```

---

## UI Features

### Player Dashboard
- 📊 Hackathon info cards (theme, dates, player count)
- 📝 Daily update form with rich text areas
- 📱 Update history with timestamps
- 🎥 Loom video links clickable
- ⏱️ Hours worked tracker
- ✅ Task checklist display

### Admin Dashboard
- 🎯 Hackathon selection grid
- 👥 Player list sidebar (scrollable)
- 📈 Player score calculator
- 🎖️ Bonus multiplier controls
- 📋 Detailed update viewer
- ✅ Task completion indicators

---

## Key Sections Explained

### Player Card (Admin View)
```
┌─────────────────────────────┐
│ John Doe                    │
│ john@company.com            │
│                             │
│ Final Score: 200            │
│                             │
│ Multiplier: 2×              │
│ ✅ One Day Complete         │
│                             │
│ [Score 2× Bonus] [One Day   │
│  2× Bonus]                  │
│                             │
│ Final: 100 × 2 = 200        │
└─────────────────────────────┘
```

### Update Card
```
┌─────────────────────────────┐
│ Built authentication module │ Nov 15
│                             │
│ Implemented JWT tokens      │
│                             │
│ Tasks Completed:            │
│ ✓ JWT implementation        │
│ ○ Database optimization     │
│ +2 more...                  │
│                             │
│ ⏱️ 8h worked  📹 Watch Video │
└─────────────────────────────┘
```

---

## Troubleshooting

### Can't See Hackathon Option?
- Make sure you're on the **Role Selection page**
- Look for the **Trophy icon (🏆)** with **orange gradient**
- It should be in the 4-role grid

### Login Failed?
- Check email and password are correct
- Ensure you're selecting the right role (Player/Admin)
- Try logging out and back in

### Updates Not Showing?
- Make sure you've **submitted** the update (not just filled form)
- Refresh the page after submission
- Check that you're viewing the correct hackathon

### Videos Not Opening?
- Ensure Loom link is valid HTTPS URL
- Check popup blockers aren't preventing new tabs
- Try copying link directly into browser

---

## Testing Workflow

### Complete Player Test
1. Login as trainee/player
2. Select an active hackathon
3. Submit 2-3 daily updates with different details
4. Verify updates appear in history
5. Check Loom links work

### Complete Admin Test
1. Login as admin
2. View all hackathons
3. Click on different players
4. Award both bonus types
5. Verify score calculation updates
6. View player updates

---

## Database Test Data

To create test hackathon (via API or MongoDB):

```json
{
  "name": "Tech Innovation Hackathon 2025",
  "description": "24-hour innovation challenge focused on AI and ML",
  "theme": "AI & Machine Learning",
  "startDate": "2025-12-01T00:00:00Z",
  "endDate": "2025-12-02T00:00:00Z",
  "status": "active",
  "maxPlayers": 50,
  "prizes": {
    "first": "₹50,000",
    "second": "₹30,000",
    "third": "₹20,000"
  }
}
```

---

## Support

For issues or questions:
1. Check the full documentation in `HACKATHON_SYSTEM_COMPLETE.md`
2. Verify backend routes are registered in `src/index.ts`
3. Check frontend components are imported in `App.tsx`
4. Ensure MongoDB is running and connected

---

## Summary

✅ **Hackathon System is live!**

- Players can submit daily updates
- Admins can award bonus multipliers
- Automatic score calculation
- Beautiful UI with gradients
- Fully integrated into existing system

Start testing now! 🎉
