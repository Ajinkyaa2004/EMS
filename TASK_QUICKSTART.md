# 🚀 Task Feature - Quick Start Guide

## Login Credentials

### Admin Account
- **Email**: admin@example.com
- **Password**: Admin@123

### Employee Account
- **Email**: alice@company.com
- **Password**: TempPassword123!

---

## For Admins: Assign a Task

1. **Open** http://localhost:5173
2. **Login** with admin credentials
3. **Click** "Tasks" in the navigation menu
4. **Click** "+ Assign Task" button
5. **Fill in the form**:
   - Task Title: e.g., "Complete API Documentation"
   - Assign To: Select an employee from dropdown
   - Description: e.g., "Document all endpoints with examples"
   - Priority: Select Low, Medium, or High
   - Due Date: Pick a date
6. **Click** "Create Task"
7. **View** the task in the table below

---

## For Employees: View & Update Tasks

1. **Open** http://localhost:5173
2. **Login** with employee credentials (alice@company.com)
3. **Click** "My Tasks" in the navigation menu
4. **View** all your assigned tasks in the table
5. **Update Status**:
   - Click the dropdown in the "Action" column
   - Select: Pending, In Progress, Completed, or Cancelled
   - Status updates immediately

---

## Sample Tasks Already Created

When you login, you'll see these pre-created tasks:

| Task | Assigned To | Priority | Status | Due Date |
|------|-------------|----------|--------|----------|
| Design Homepage Mockup | Alice Johnson | High | In Progress | 2025-11-30 |
| Setup Development Environment | Bob Wilson | High | Completed | 2025-11-10 |
| Database Schema Design | Bob Wilson | High | In Progress | 2025-11-25 |
| API Endpoint Documentation | Carol Davis | Medium | Pending | 2025-12-10 |
| Keyword Research and Analysis | Alice Johnson | Medium | Pending | 2025-12-05 |
| Data Migration Testing | David Lee | High | Pending | 2025-11-28 |

---

## Key Features

✅ **Admin Can**:
- Create new tasks
- Assign tasks to employees
- View all tasks in the system
- Set priority levels
- Set due dates

✅ **Employees Can**:
- View all tasks assigned to them
- Update task status (Pending → In Progress → Completed)
- See task details and due dates
- Mark tasks as cancelled if needed

✅ **Task Status Colors**:
- 🟢 **Green**: Completed
- 🔵 **Blue**: In Progress
- ⚪ **Gray**: Pending
- 🔴 **Red**: Cancelled

✅ **Priority Badges**:
- 🔴 **Red**: High Priority
- 🟡 **Yellow**: Medium Priority
- 🟢 **Green**: Low Priority

---

## Troubleshooting

**Q: I don't see the Tasks tab**
- A: Make sure you're logged in as an admin
- A: Refresh the page (Ctrl+R)

**Q: Employee dropdown is empty**
- A: Make sure backend is running
- A: Check browser console for errors

**Q: Task status won't update**
- A: Check if you're logged in as the assigned employee
- A: Refresh the page and try again

**Q: Can't see my assigned tasks**
- A: Login with the correct employee account
- A: Check if tasks are assigned to you

---

## API Endpoints

### Admin Endpoints
- `POST /api/tasks` - Create task
- `GET /api/tasks/admin/all` - View all tasks

### Employee Endpoints
- `GET /api/tasks/my-tasks` - View my tasks
- `PATCH /api/tasks/:id/status` - Update task status

---

## Need Help?

1. Check **TASK_FEATURE.md** for detailed documentation
2. Review the browser console for error messages
3. Verify both backend and frontend are running
4. Check MongoDB connection status

---

**Ready to use!** 🎉
