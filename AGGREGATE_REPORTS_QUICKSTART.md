# 🎉 Aggregate Reports Feature - Quick Start Guide

## ✨ What's New?

Your Employee Management System now has **Aggregate Employee Reports** with both **Weekly** and **Monthly** views in the admin dashboard!

---

## 📍 Where to Find It

**Location**: Admin Dashboard → **Reports** tab (new sidebar item with 📊 icon)

---

## 🚀 Quick Usage

### Step 1: Navigate to Reports
1. Login as admin
2. Click on **Reports** in the sidebar (between Activity and Projects)

### Step 2: Choose Report Type
- **Weekly Report**: View attendance for a specific week
- **Monthly Report**: View attendance for a specific month

### Step 3: Select Date
- Weekly: Pick a week start date
- Monthly: Pick a month/year

### Step 4: View Results
- See all employees' attendance statistics
- View summary cards (total employees, avg attendance, etc.)
- Check individual employee breakdowns

### Step 5: Export (Optional)
- Click **Export CSV** to download the report

---

## 📊 What You Get

### Summary Statistics
- ✅ Total employees in report
- ✅ Average attendance rate
- ✅ Total present records
- ✅ Total absent records

### Per-Employee Details
- ✅ Name and email
- ✅ Days present, late, absent, WFH, half-day, on leave
- ✅ Attendance rate percentage
- ✅ Projects assigned

---

## 📋 Report Table Columns

| Column | Shows |
|--------|-------|
| Employee | Name & email |
| Total Days | Days with attendance |
| Present ✓ | Days marked Present |
| Late ⏰ | Days marked Late |
| Absent ✗ | Days marked Absent |
| WFH | Work From Home days |
| Half-day | Half-day records |
| On Leave | Leave records |
| Attendance Rate | % of working days |
| Projects | Assigned projects |

---

## 🔢 Attendance Rate Formula

**Weekly**: `(Present + Late + WFH) / 5 working days × 100`

**Monthly**: `(Present + Late + WFH) / 20 working days × 100`

---

## 💾 CSV Export

- Click **Export CSV** button
- Downloads as: `attendance-[type]-[date].csv`
- Open in Excel or Google Sheets
- Use for further analysis or sharing

---

## 🎨 Visual Indicators

- **Green badge**: Present
- **Yellow badge**: Late
- **Red badge**: Absent
- **Blue badge**: Work from Home
- **Orange badge**: Half-day
- **Purple badge**: On Leave

---

## 🎯 Common Use Cases

### 1. Check Team Attendance This Week
```
Weekly Report → Select today's date → See all employees' status
```

### 2. Monthly Performance Review
```
Monthly Report → Select month → Analyze attendance trends
```

### 3. Identify Attendance Issues
```
Find employees with low attendance rate → Click to see details → Follow up
```

### 4. Export for HR
```
Generate report → Click Export CSV → Send to HR team
```

---

## ❓ FAQs

**Q: Why is attendance rate calculated this way?**
A: Only working days (Present, Late, WFH) count toward attendance. Absences and leaves don't count against the rate.

**Q: Can I see past months?**
A: Yes! Use the month picker to select any month/year.

**Q: What if no data shows?**
A: Ensure employees have marked attendance for the selected period.

**Q: Who can access reports?**
A: Only admin users can view aggregate reports.

**Q: Can I filter by project?**
A: Not in this version, but you can use CSV export to filter in Excel.

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't find Reports tab | Make sure you're logged in as admin |
| No employees showing | Check attendance records exist for the period |
| CSV won't download | Check browser download settings |
| Attendance rate seems wrong | It only counts Present + Late + WFH as working days |

---

## 📚 Full Documentation

For detailed information, see: `AGGREGATE_REPORTS_IMPLEMENTATION.md`

---

## ✅ What's Included

✅ Weekly aggregate reports
✅ Monthly aggregate reports  
✅ Individual employee detailed reports
✅ Attendance statistics per employee
✅ CSV export functionality
✅ Admin dashboard integration
✅ Responsive design
✅ Real-time data

---

## 🎓 Tips & Tricks

1. **Bookmark your date**: Browser remembers your last selected date
2. **Export regularly**: Keep CSV copies for historical analysis
3. **Share with team**: Export and share reports with managers
4. **Track trends**: Compare monthly reports to see improvements
5. **Quick view**: Summary cards show key metrics instantly

---

## 🚀 Get Started Now!

1. Go to Admin Dashboard
2. Click **Reports** tab
3. Choose **Weekly** or **Monthly**
4. Select your date
5. Enjoy your aggregate reports!

---

**Happy reporting! 📊✨**

For any questions, refer to the full documentation or contact your system administrator.
