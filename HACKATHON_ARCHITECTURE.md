# Hackathon System - Architecture & Features

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     HACKATHON SYSTEM v1.0                       │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React/TypeScript)               │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Role Selection                                                  │
│  └─ Hackathon Login                                             │
│     ├─ 🎮 Player Path                                           │
│     │  └─ HackathonPlayerDashboard.tsx                         │
│     │     ├─ Hackathon Selection                               │
│     │     ├─ Daily Update Form                                 │
│     │     └─ Update History                                    │
│     │                                                           │
│     └─ 👨‍💼 Admin Path                                             │
│        └─ HackathonAdminDashboard.tsx                          │
│           ├─ Hackathon Management                              │
│           ├─ Player List & Details                             │
│           ├─ Bonus Multiplier Controls                         │
│           └─ Update Viewer                                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                      BACKEND (Express/TypeScript)                │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Routes: /api/hackathon                                         │
│  ├─ GET  / - List hackathons                                   │
│  ├─ GET  /:id - Get hackathon details                          │
│  ├─ POST / - Create hackathon (admin)                          │
│  ├─ POST /:id/join - Join hackathon                            │
│  ├─ POST /:id/update - Submit update                           │
│  ├─ GET  /:id/updates - Get all updates                        │
│  ├─ GET  /:id/player/:playerId/updates - Player updates       │
│  ├─ PUT  /:id/player/:playerId/bonus - Award bonus            │
│  └─ PUT  /:id/player/:playerId/score - Update score           │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                         DATABASE (MongoDB)                        │
│  ├─ HackathonEvent Collection                                   │
│  │  ├─ name, description, theme                                │
│  │  ├─ startDate, endDate, status                              │
│  │  ├─ maxPlayers, currentPlayers                              │
│  │  ├─ players[] (score, bonusMultiplier, oneDay)             │
│  │  ├─ updates[] (references)                                  │
│  │  └─ prizes (first, second, third)                           │
│  │                                                              │
│  └─ HackathonUpdate Collection                                 │
│     ├─ hackathonId, playerId, playerName                       │
│     ├─ date, summary                                            │
│     ├─ tasksCompleted[] (task, completed)                      │
│     ├─ projectProgress, blockers                               │
│     ├─ nextSteps, hoursWorked                                  │
│     └─ loomVideoLink                                           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## 🎮 Player Flow

```
┌─────────────────────────────────────────────────┐
│  Role Selection Page                            │
│  (4 Role Options: Admin, Employee, Client,     │
│   Hackathon, Applicant)                        │
└────────────────────┬────────────────────────────┘
                     │
                     └─→ Click 🏆 Hackathon
                         │
                         ↓
                 ┌──────────────────────┐
                 │  Hackathon Login     │
                 │  Gradient UI         │
                 │  Email + Password    │
                 │  [🎮 Player] [👨‍💼 Admin] │
                 └────────┬─────────────┘
                          │
                   Select Player
                          │
                          ↓
        ┌─────────────────────────────────────┐
        │  Player Dashboard                   │
        ├─────────────────────────────────────┤
        │                                     │
        │  Left: Hackathon Selection         │
        │  - Active Hackathons               │
        │  - Click to select                 │
        │                                     │
        │  Right: Main Content               │
        │  - Hackathon Info                  │
        │  - Daily Update Form               │
        │  - Update History                  │
        │                                     │
        │  Forms & Lists:                    │
        │  ✓ Summary                         │
        │  ✓ Project Progress                │
        │  ✓ Tasks Completed                 │
        │  ✓ Blockers                        │
        │  ✓ Next Steps                      │
        │  ✓ Hours Worked                    │
        │  ✓ Loom Video Link                 │
        │                                     │
        └─────────────────────────────────────┘
```

## 👨‍💼 Admin Flow

```
┌─────────────────────────────────────────────────┐
│  Role Selection Page                            │
│  (4 Role Options: Admin, Employee, Client,     │
│   Hackathon, Applicant)                        │
└────────────────────┬────────────────────────────┘
                     │
                     └─→ Click 🏆 Hackathon
                         │
                         ↓
                 ┌──────────────────────┐
                 │  Hackathon Login     │
                 │  Gradient UI         │
                 │  Email + Password    │
                 │  [🎮 Player] [👨‍💼 Admin] │
                 └────────┬─────────────┘
                          │
                   Select Admin
                          │
                          ↓
        ┌──────────────────────────────────────────┐
        │  Admin Dashboard                         │
        ├──────────────────────────────────────────┤
        │                                          │
        │  Top: Hackathon Selection Grid           │
        │  - View all hackathons                   │
        │  - Click to select                       │
        │                                          │
        │  Left: Player List (Sticky Sidebar)      │
        │  - All players in hackathon              │
        │  - Click to select player                │
        │  - See score & multipliers               │
        │                                          │
        │  Right: Player Details                   │
        │  - Player card with score                │
        │  - [🏆 Score 2× Bonus] button           │
        │  - [⚡ One Day 2× Bonus] button         │
        │  - Final score calculation               │
        │  - All daily updates                     │
        │  - Task details & videos                 │
        │                                          │
        │  Bonus System:                           │
        │  ┌─────────────────────────────────┐    │
        │  │ Score 2× Bonus                  │    │
        │  │ If score > Anmol Sir            │    │
        │  │ Multiplier: ×2                  │    │
        │  │ [Yellow Button - Award]         │    │
        │  └─────────────────────────────────┘    │
        │                                          │
        │  ┌─────────────────────────────────┐    │
        │  │ One Day 2× Bonus                │    │
        │  │ If completed in 24 hours        │    │
        │  │ Multiplier: ×2                  │    │
        │  │ [Green Button - Award]          │    │
        │  └─────────────────────────────────┘    │
        │                                          │
        │  Final Prize:                            │
        │  Base Score × Bonus Multiplier           │
        │  Example: 100 × 2 = 200                  │
        │                                          │
        └──────────────────────────────────────────┘
```

## 🎯 Bonus Multiplier System

```
┌──────────────────────────────────────────────────────────┐
│              BONUS MULTIPLIER SYSTEM                     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Achievement 1: Score More Than Anmol Sir              │
│  ├─ Criteria: score > benchmark                        │
│  ├─ Bonus: 2× Prize Multiplier                         │
│  ├─ Admin: Click 🏆 Score 2× Bonus button             │
│  ├─ UI: Yellow highlighted when active                │
│  └─ Effect: Final = Base × 2                           │
│                                                          │
│  Achievement 2: Project Completed in One Day          │
│  ├─ Criteria: Full project in 24 hours               │
│  ├─ Bonus: 2× Prize Multiplier                        │
│  ├─ Admin: Click ⚡ One Day 2× Bonus button          │
│  ├─ UI: Green highlighted when active, ⚡ badge      │
│  └─ Effect: Final = Base × 2                          │
│                                                          │
│  Score Calculation:                                    │
│  ┌────────────────────────────────────────────┐       │
│  │ Final Prize = Base Score × Bonus Multiplier│       │
│  │                                            │       │
│  │ Examples:                                  │       │
│  │ No bonuses:  100 × 1 = 100               │       │
│  │ 1 bonus:     100 × 2 = 200               │       │
│  │ Both bonus:  100 × 2 = 200 (max)        │       │
│  │ Higher score: 150 × 2 = 300              │       │
│  └────────────────────────────────────────────┘       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## 📊 Daily Update Structure

```
┌──────────────────────────────────────────────────────────┐
│              DAILY UPDATE FORM                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  📝 Update Summary (Required)                           │
│  └─ What did you accomplish today?                      │
│                                                          │
│  🎯 Project Progress (Required)                         │
│  └─ Detailed progress description                       │
│                                                          │
│  🚧 Blockers/Issues                                     │
│  └─ Challenges encountered                              │
│                                                          │
│  📋 Next Steps (Required)                               │
│  └─ Plan for tomorrow                                   │
│                                                          │
│  ⏱️ Hours Worked                                        │
│  └─ Numeric input (0-24)                               │
│                                                          │
│  🎥 Loom Video Link                                     │
│  └─ Optional recording URL                              │
│                                                          │
│  [Submit] [Cancel]                                      │
│                                                          │
├──────────────────────────────────────────────────────────┤
│              UPDATE DISPLAY                             │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Update Summary                              Date       │
│  Project Description                                     │
│                                                          │
│  Tasks Completed:                                       │
│  ✓ Task 1 - Done                                       │
│  ✓ Task 2 - Done                                       │
│  ○ Task 3 - Pending                                    │
│  +2 more...                                             │
│                                                          │
│  ⏱️ 8h worked  📹 Watch Video                           │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## 📈 UI Components

### Color Scheme
```
Primary Gradient: Purple → Blue
Hackathon Orange: Orange → Red (Trophy icon)
Player Button: Green
Admin Button: Blue
Score Bonus: Yellow
One Day Bonus: Green
```

### Icons Used
```
🏆 Trophy - Hackathon main icon
🎮 Game Controller - Player role
👨‍💼 Man Office Worker - Admin role
📊 Chart - Stats/Analytics
👥 People - Player list
📝 Memo - Updates/Forms
✅ Check Mark - Completed
⏱️ Clock - Hours/Time
🎥 Movie Camera - Video link
⚡ Zap - One day achievement
🔐 Lock - Security/Auth
```

## 🔄 Data Flow

```
User Submission
    ↓
Player fills daily update form
    ↓
API POST /hackathon/:id/update
    ↓
Backend creates HackathonUpdate document
    ↓
Add reference to HackathonEvent.updates
    ↓
Database stores update
    ↓
Admin views updates via GET
    ↓
Admin awards bonuses via PUT
    ↓
Player score × bonus = final prize
```

## ✅ Features Checklist

### Player Features
- [x] Login with trainee credentials
- [x] Select active hackathon
- [x] Submit daily updates
- [x] View update history
- [x] Track hours worked
- [x] Add Loom video links
- [x] See hackathon details
- [x] View player count

### Admin Features
- [x] Login with admin credentials
- [x] View all hackathons
- [x] Select hackathon to manage
- [x] View all players
- [x] Click player for details
- [x] View player's daily updates
- [x] Award score bonus
- [x] Award one-day bonus
- [x] See final score calculation
- [x] View task checklists

### System Features
- [x] JWT authentication
- [x] Session management
- [x] Role-based access
- [x] Beautiful UI/UX
- [x] Responsive design
- [x] Real-time updates
- [x] Error handling
- [x] Toast notifications

## 📱 Responsive Design
- Mobile (< 768px): Single column, stacked layout
- Tablet (768px - 1024px): 2 columns
- Desktop (> 1024px): 3 columns with sidebar

## 🚀 Status: PRODUCTION READY

All features implemented, tested, and ready for deployment!
