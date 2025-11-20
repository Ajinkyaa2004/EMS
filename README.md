# Employee Monitoring System (EMS)

A unified, secure web application for managing employees, projects, and daily updates with role-based access control (Admin, Employee, Client).

## Features

- **Multi-Role Authentication**: Admin, Employee, Client roles with tailored dashboards
- **Project Management**: Create, update, and manage projects with assignments
- **Daily Updates**: Employees post daily updates with attachments and checklists
- **Training Logs**: Track training progress with structured checklists
- **File & Link Management**: Upload attachments and manage project links
- **Admin Dashboard**: Analytics, employee data, project filters, and exports
- **Automation & Messaging**: Bulk communication with templates
- **Audit Logs**: Track all changes and updates
- **Role-Based Access Control**: Secure data access by role

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB
- **Authentication**: JWT + httpOnly cookies
- **File Storage**: AWS S3 / Local storage (for MVP)

## Project Structure

```
ems-app/
├── frontend/          # React Vite application
├── backend/           # Express.js API server
├── docker-compose.yml # Local MongoDB setup
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Setup

1. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

2. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

3. **Access the app**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Environment Variables

See `.env.example` files in backend and frontend directories.

## MVP Scope

✅ Role selection + authentication (Admin / Employee / Client)
✅ Admin: Project and Client CRUD
✅ Employee: view assigned projects; post daily updates
✅ Client: read-only project progress
✅ Files & links management
✅ Admin dashboard with filters
✅ Automation UI (messaging templates)
✅ Audit logs
✅ Role-based access control
✅ Deployable demo

## Next Steps

- Implement real S3 file uploads
- Add real email/WhatsApp notifications
- Deploy to production
- Add real-time updates with Socket.IO
# Employee-Management-System
# EMS
# EMS
# EMS
