# EMS Setup Instructions

## Project Structure Created

```
ems-app/
├── backend/
│   ├── src/
│   │   ├── index.ts (Main server)
│   │   ├── middleware/
│   │   │   ├── auth.ts (JWT authentication)
│   │   │   └── errorHandler.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Project.ts
│   │   │   ├── Client.ts
│   │   │   ├── Update.ts
│   │   │   ├── AuditLog.ts
│   │   │   └── AutomationJob.ts
│   │   └── routes/
│   │       ├── auth.ts
│   │       ├── projects.ts
│   │       ├── employees.ts
│   │       ├── updates.ts
│   │       ├── clients.ts
│   │       ├── automation.ts
│   │       └── audit.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── context/
│   │   ├── pages/
│   │   ├── components/
│   │   └── hooks/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── README.md
```

## Installation Steps

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. MongoDB Setup
- Local: `mongod` (ensure MongoDB is running)
- Or use MongoDB Atlas (update MONGODB_URI in .env)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Projects (Admin)
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get project details
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Employees (Admin)
- `GET /api/employees` - List employees
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Updates (Employee)
- `GET /api/updates` - List all updates
- `GET /api/updates/project/:projectId` - Get project updates
- `POST /api/updates` - Create update
- `PUT /api/updates/:id` - Update
- `DELETE /api/updates/:id` - Delete update

### Clients (Admin)
- `GET /api/clients` - List clients
- `POST /api/clients` - Create client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Automation (Admin)
- `GET /api/automation` - List jobs
- `POST /api/automation` - Create job
- `POST /api/automation/:id/execute` - Execute job

### Audit Logs (Admin)
- `GET /api/audit` - List audit logs
- `GET /api/audit/entity/:entityType/:entityId` - Get entity history

## Frontend Pages to Create

### Public Pages
- `/` - Role Selection
- `/login` - Login
- `/register` - Register

### Admin Routes
- `/admin/dashboard` - Main dashboard
- `/admin/projects` - Project list
- `/admin/projects/:id` - Project details
- `/admin/employees` - Employee management
- `/admin/clients` - Client management
- `/admin/automation` - Automation center
- `/admin/audit` - Audit logs

### Employee Routes
- `/employee/dashboard` - My projects
- `/employee/updates` - My updates
- `/employee/updates/new` - Create update
- `/employee/training` - Training tasks

### Client Routes
- `/client/dashboard` - Project progress
- `/client/projects/:id` - Project details

## Next Steps

1. Complete frontend component implementation
2. Add real file upload to S3
3. Implement real email/SMS notifications
4. Add Socket.IO for real-time updates
5. Deploy to production
