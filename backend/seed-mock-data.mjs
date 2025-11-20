import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const mongoUri = 'mongodb://localhost:27017/ems';

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ['admin', 'employee', 'client', 'freelancer'], required: true },
  phone: String,
  avatar: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Client Schema
const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  contactPerson: String,
  oneDriveLink: String,
  gitHubLink: String,
  notes: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// Project Schema
const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  projectType: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'], default: 'planning' },
  tags: [String],
  estimatedHours: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  leadAssignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  virtualAssistant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  freelancers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  coders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  projectLeader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isStuck: { type: Boolean, default: false },
  links: {
    github: String,
    loom: String,
    whatsapp: String,
    oneDrive: String,
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// Task Schema
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['pending', 'in-progress', 'completed', 'cancelled'], default: 'pending' },
  dueDate: { type: Date, required: true },
  workProgress: { type: Number, default: 0, min: 0, max: 100 },
  attachments: [{
    fileName: String,
    fileUrl: String,
    uploadedAt: Date,
  }],
}, { timestamps: true });

// Attendance Schema
const attendanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: {
    type: Date,
    required: true,
    set: (v) => {
      const d = new Date(v);
      d.setHours(0, 0, 0, 0);
      return d;
    },
  },
  status: { type: String, enum: ['Present', 'Absent', 'Late', 'Half-day', 'On Leave', 'WFH'], required: true },
  checkInTime: Date,
  checkOutTime: Date,
  workingMinutes: { type: Number, default: 0 },
  selectedProjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  notes: String,
  markedAt: { type: Date, default: Date.now },
}, { timestamps: true });

attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

// Update Schema
const updateSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  summary: { type: String, required: true },
  loomVideoLink: String,
  checklist: [{
    task: String,
    completed: { type: Boolean, default: false },
  }],
  nextPlan: String,
  attachments: [{
    fileName: String,
    fileUrl: String,
    uploadedAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

// Leadership Schema
const leadershipSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  leadership: {
    type: String,
    enum: ['team-lead', 'project-manager', 'technical-lead', 'senior-developer', 'department-head'],
    required: true,
  },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// Project Session Schema
const projectSessionSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  attendanceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Attendance', required: true },
  sessionStartTime: { type: Date, default: Date.now },
  sessionEndTime: Date,
  status: { type: String, enum: ['Active', 'Idle', 'Offline'], default: 'Active' },
  lastActivityTime: { type: Date, default: Date.now },
  totalActiveMinutes: { type: Number, default: 0 },
  totalIdleMinutes: { type: Number, default: 0 },
  screenActivityLog: [{
    timestamp: Date,
    type: { type: String, enum: ['Active', 'Idle'] },
    duration: Number,
  }],
}, { timestamps: true });

// Models
const User = mongoose.model('User', userSchema);
const Client = mongoose.model('Client', clientSchema);
const Project = mongoose.model('Project', projectSchema);
const Task = mongoose.model('Task', taskSchema);
const Attendance = mongoose.model('Attendance', attendanceSchema);
const Update = mongoose.model('Update', updateSchema);
const Leadership = mongoose.model('Leadership', leadershipSchema);
const ProjectSession = mongoose.model('ProjectSession', projectSessionSchema);

async function seedDatabase() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Client.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await Attendance.deleteMany({});
    await Update.deleteMany({});
    await Leadership.deleteMany({});
    await ProjectSession.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create Users
    const users = await User.insertMany([
      {
        email: 'admin@example.com',
        password: await bcrypt.hash('Admin@123', 10),
        firstName: 'John',
        lastName: 'Admin',
        role: 'admin',
        phone: '+1-555-0001',
        isActive: true,
      },
      {
        email: 'alice@company.com',
        password: await bcrypt.hash('TempPassword123!', 10),
        firstName: 'Alice',
        lastName: 'Johnson',
        role: 'employee',
        phone: '+1-555-0002',
        isActive: true,
      },
      {
        email: 'bob@company.com',
        password: await bcrypt.hash('Employee@123', 10),
        firstName: 'Bob',
        lastName: 'Williams',
        role: 'employee',
        phone: '+1-555-0003',
        isActive: true,
      },
      {
        email: 'charlie@company.com',
        password: await bcrypt.hash('Employee@123', 10),
        firstName: 'Charlie',
        lastName: 'Brown',
        role: 'employee',
        phone: '+1-555-0004',
        isActive: true,
      },
      {
        email: 'diana@company.com',
        password: await bcrypt.hash('Employee@123', 10),
        firstName: 'Diana',
        lastName: 'Davis',
        role: 'employee',
        phone: '+1-555-0005',
        isActive: true,
      },
      {
        email: 'client@acmecorp.com',
        password: await bcrypt.hash('Client@123', 10),
        firstName: 'Michael',
        lastName: 'Client',
        role: 'client',
        phone: '+1-555-0010',
        isActive: true,
      },
      {
        email: 'freelancer@example.com',
        password: await bcrypt.hash('Freelancer@123', 10),
        firstName: 'Sarah',
        lastName: 'Freelancer',
        role: 'freelancer',
        phone: '+1-555-0020',
        isActive: true,
      },
    ]);

    const [admin, alice, bob, charlie, diana, clientUser, freelancer] = users;
    console.log('✅ Created users');

    // Create Clients
    const clients = await Client.insertMany([
      {
        name: 'Acme Corporation',
        type: 'Enterprise',
        email: 'contact@acmecorp.com',
        phone: '+1-555-1001',
        contactPerson: 'Michael Client',
        oneDriveLink: 'https://onedrive.com/acmecorp',
        gitHubLink: 'https://github.com/acmecorp',
        notes: 'Premium enterprise client with multiple ongoing projects',
        createdBy: admin._id,
      },
      {
        name: 'TechStart Inc',
        type: 'Startup',
        email: 'hello@techstart.io',
        phone: '+1-555-1002',
        contactPerson: 'Jane Startup',
        oneDriveLink: 'https://onedrive.com/techstart',
        gitHubLink: 'https://github.com/techstart',
        notes: 'Fast-growing startup, needs agile development',
        createdBy: admin._id,
      },
      {
        name: 'Global Solutions Ltd',
        type: 'Corporate',
        email: 'info@globalsolutions.com',
        phone: '+1-555-1003',
        contactPerson: 'Robert Corporate',
        notes: 'International client with complex requirements',
        createdBy: admin._id,
      },
    ]);

    const [acmeClient, techStartClient, globalClient] = clients;
    console.log('✅ Created clients');

    // Create Projects
    const projects = await Project.insertMany([
      {
        title: 'E-Commerce Platform Redesign',
        description: 'Complete redesign of the e-commerce platform with modern UI/UX, shopping cart, payment integration, and admin dashboard.',
        clientId: acmeClient._id,
        projectType: 'Web Development',
        priority: 'high',
        status: 'active',
        tags: ['React', 'Node.js', 'MongoDB', 'E-commerce'],
        estimatedHours: 320,
        startDate: new Date('2025-10-01'),
        endDate: new Date('2025-12-31'),
        leadAssignee: alice._id,
        coders: [alice._id, bob._id],
        projectLeader: alice._id,
        isStuck: false,
        links: {
          github: 'https://github.com/acmecorp/ecommerce-platform',
          loom: 'https://loom.com/share/ecommerce-demo',
          whatsapp: 'https://wa.me/group/acme-ecommerce',
          oneDrive: 'https://onedrive.com/acmecorp/ecommerce',
        },
        createdBy: admin._id,
      },
      {
        title: 'Mobile App Development',
        description: 'Native mobile application for iOS and Android with real-time notifications and offline support.',
        clientId: techStartClient._id,
        projectType: 'Mobile Development',
        priority: 'high',
        status: 'active',
        tags: ['React Native', 'Firebase', 'Mobile'],
        estimatedHours: 280,
        startDate: new Date('2025-09-15'),
        endDate: new Date('2025-12-15'),
        leadAssignee: bob._id,
        coders: [bob._id, charlie._id],
        projectLeader: bob._id,
        freelancers: [freelancer._id],
        isStuck: false,
        links: {
          github: 'https://github.com/techstart/mobile-app',
          loom: 'https://loom.com/share/mobile-demo',
        },
        createdBy: admin._id,
      },
      {
        title: 'CRM System Integration',
        description: 'Integration of existing CRM with third-party services, API development, and automation workflows.',
        clientId: globalClient._id,
        projectType: 'System Integration',
        priority: 'medium',
        status: 'active',
        tags: ['API', 'Integration', 'Python', 'Automation'],
        estimatedHours: 160,
        startDate: new Date('2025-11-01'),
        endDate: new Date('2026-01-31'),
        leadAssignee: charlie._id,
        coders: [charlie._id, diana._id],
        projectLeader: charlie._id,
        isStuck: false,
        links: {
          github: 'https://github.com/global/crm-integration',
        },
        createdBy: admin._id,
      },
      {
        title: 'Data Analytics Dashboard',
        description: 'Real-time analytics dashboard with data visualization, reporting, and export functionality.',
        clientId: acmeClient._id,
        projectType: 'Data Analytics',
        priority: 'medium',
        status: 'planning',
        tags: ['Dashboard', 'Analytics', 'D3.js', 'Python'],
        estimatedHours: 200,
        startDate: new Date('2025-12-01'),
        endDate: new Date('2026-02-28'),
        leadAssignee: diana._id,
        coders: [diana._id],
        projectLeader: diana._id,
        isStuck: false,
        createdBy: admin._id,
      },
      {
        title: 'Legacy System Migration',
        description: 'Migration of legacy system to modern cloud infrastructure with zero downtime.',
        clientId: globalClient._id,
        projectType: 'Cloud Migration',
        priority: 'low',
        status: 'on-hold',
        tags: ['AWS', 'Migration', 'Cloud', 'DevOps'],
        estimatedHours: 400,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-04-30'),
        leadAssignee: alice._id,
        coders: [alice._id, bob._id],
        projectLeader: alice._id,
        isStuck: true,
        notes: 'Waiting for client approval on cloud infrastructure costs',
        createdBy: admin._id,
      },
    ]);

    const [ecommerceProject, mobileProject, crmProject, analyticsProject, migrationProject] = projects;
    console.log('✅ Created projects');

    // Create Tasks
    const tasks = await Task.insertMany([
      {
        title: 'Design product catalog page',
        description: 'Create responsive design for product catalog with filters, sorting, and pagination.',
        assignedBy: admin._id,
        assignedTo: alice._id,
        projectId: ecommerceProject._id,
        priority: 'high',
        status: 'in-progress',
        dueDate: new Date('2025-11-25'),
        workProgress: 60,
      },
      {
        title: 'Implement payment gateway',
        description: 'Integrate Stripe payment gateway with order processing and webhook handling.',
        assignedBy: admin._id,
        assignedTo: bob._id,
        projectId: ecommerceProject._id,
        priority: 'high',
        status: 'in-progress',
        dueDate: new Date('2025-11-30'),
        workProgress: 40,
      },
      {
        title: 'Setup push notifications',
        description: 'Configure Firebase Cloud Messaging for push notifications on iOS and Android.',
        assignedBy: admin._id,
        assignedTo: bob._id,
        projectId: mobileProject._id,
        priority: 'high',
        status: 'completed',
        dueDate: new Date('2025-11-15'),
        workProgress: 100,
      },
      {
        title: 'Design user authentication flow',
        description: 'Implement secure authentication with biometric support and token management.',
        assignedBy: admin._id,
        assignedTo: charlie._id,
        projectId: mobileProject._id,
        priority: 'high',
        status: 'completed',
        dueDate: new Date('2025-11-10'),
        workProgress: 100,
      },
      {
        title: 'API documentation',
        description: 'Create comprehensive API documentation using Swagger/OpenAPI specification.',
        assignedBy: admin._id,
        assignedTo: charlie._id,
        projectId: crmProject._id,
        priority: 'medium',
        status: 'in-progress',
        dueDate: new Date('2025-11-28'),
        workProgress: 70,
      },
      {
        title: 'Webhook integration',
        description: 'Develop webhook endpoints for real-time data synchronization with external systems.',
        assignedBy: admin._id,
        assignedTo: diana._id,
        projectId: crmProject._id,
        priority: 'medium',
        status: 'pending',
        dueDate: new Date('2025-12-05'),
        workProgress: 0,
      },
      {
        title: 'Create data visualization components',
        description: 'Build reusable chart components using D3.js for analytics dashboard.',
        assignedBy: admin._id,
        assignedTo: diana._id,
        projectId: analyticsProject._id,
        priority: 'medium',
        status: 'pending',
        dueDate: new Date('2025-12-20'),
        workProgress: 0,
      },
      {
        title: 'Database schema design',
        description: 'Design optimized database schema for analytics data storage and querying.',
        assignedBy: admin._id,
        assignedTo: alice._id,
        projectId: analyticsProject._id,
        priority: 'high',
        status: 'pending',
        dueDate: new Date('2025-12-10'),
        workProgress: 0,
      },
    ]);

    console.log('✅ Created tasks');

    // Create Attendance records (last 30 days)
    const attendanceRecords = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      // Alice - mostly present with good hours
      if (Math.random() > 0.1) {
        const checkIn = new Date(date);
        checkIn.setHours(9, Math.floor(Math.random() * 30), 0);
        const checkOut = new Date(date);
        checkOut.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0);
        
        attendanceRecords.push({
          employeeId: alice._id,
          date: date,
          status: Math.random() > 0.9 ? 'WFH' : 'Present',
          checkInTime: checkIn,
          checkOutTime: checkOut,
          workingMinutes: Math.floor((checkOut - checkIn) / 60000),
          selectedProjectId: ecommerceProject._id,
          notes: Math.random() > 0.7 ? 'Productive day with good progress' : '',
        });
      }

      // Bob - regular attendance
      if (Math.random() > 0.15) {
        const checkIn = new Date(date);
        checkIn.setHours(9, Math.floor(Math.random() * 45), 0);
        const checkOut = new Date(date);
        checkOut.setHours(17, Math.floor(Math.random() * 60), 0);
        
        attendanceRecords.push({
          employeeId: bob._id,
          date: date,
          status: Math.random() > 0.95 ? 'Late' : 'Present',
          checkInTime: checkIn,
          checkOutTime: checkOut,
          workingMinutes: Math.floor((checkOut - checkIn) / 60000),
          selectedProjectId: Math.random() > 0.5 ? mobileProject._id : ecommerceProject._id,
        });
      }

      // Charlie - good attendance
      if (Math.random() > 0.08) {
        const checkIn = new Date(date);
        checkIn.setHours(9, Math.floor(Math.random() * 20), 0);
        const checkOut = new Date(date);
        checkOut.setHours(18, Math.floor(Math.random() * 60), 0);
        
        attendanceRecords.push({
          employeeId: charlie._id,
          date: date,
          status: 'Present',
          checkInTime: checkIn,
          checkOutTime: checkOut,
          workingMinutes: Math.floor((checkOut - checkIn) / 60000),
          selectedProjectId: Math.random() > 0.5 ? crmProject._id : mobileProject._id,
        });
      }

      // Diana - varied attendance
      if (Math.random() > 0.2) {
        const checkIn = new Date(date);
        checkIn.setHours(9, Math.floor(Math.random() * 60), 0);
        const checkOut = new Date(date);
        checkOut.setHours(17, Math.floor(Math.random() * 60), 0);
        
        attendanceRecords.push({
          employeeId: diana._id,
          date: date,
          status: Math.random() > 0.85 ? 'WFH' : 'Present',
          checkInTime: checkIn,
          checkOutTime: checkOut,
          workingMinutes: Math.floor((checkOut - checkIn) / 60000),
          selectedProjectId: crmProject._id,
        });
      }
    }

    await Attendance.insertMany(attendanceRecords);
    console.log('✅ Created attendance records');

    // Create Updates (daily updates for active projects)
    const updates = [];
    for (let i = 10; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      updates.push({
        projectId: ecommerceProject._id,
        employeeId: alice._id,
        date: date,
        summary: `Worked on product catalog design and implemented filter functionality. Made good progress on responsive layout for mobile devices.`,
        checklist: [
          { task: 'Design product card component', completed: true },
          { task: 'Implement filter sidebar', completed: true },
          { task: 'Add pagination', completed: i < 3 },
          { task: 'Mobile responsive adjustments', completed: i < 5 },
        ],
        nextPlan: 'Continue with search functionality and product detail page integration.',
      });

      updates.push({
        projectId: mobileProject._id,
        employeeId: bob._id,
        date: date,
        summary: `Integrated push notifications and tested on both iOS and Android devices. Fixed several edge cases related to notification handling.`,
        loomVideoLink: i === 0 ? 'https://loom.com/share/mobile-progress-demo' : undefined,
        checklist: [
          { task: 'Setup Firebase configuration', completed: true },
          { task: 'Implement notification handlers', completed: true },
          { task: 'Test on iOS', completed: true },
          { task: 'Test on Android', completed: true },
        ],
        nextPlan: 'Start working on offline data synchronization feature.',
      });

      if (i < 7) {
        updates.push({
          projectId: crmProject._id,
          employeeId: charlie._id,
          date: date,
          summary: `Developed API endpoints for CRM integration. Working on authentication and rate limiting mechanisms.`,
          checklist: [
            { task: 'Create REST API endpoints', completed: true },
            { task: 'Add authentication middleware', completed: true },
            { task: 'Implement rate limiting', completed: i < 4 },
            { task: 'Write API tests', completed: false },
          ],
          nextPlan: 'Complete API documentation and start webhook implementation.',
        });
      }
    }

    await Update.insertMany(updates);
    console.log('✅ Created project updates');

    // Create Leadership assignments
    await Leadership.insertMany([
      {
        employeeId: alice._id,
        leadership: 'team-lead',
        assignedBy: admin._id,
      },
      {
        employeeId: bob._id,
        leadership: 'project-manager',
        assignedBy: admin._id,
      },
      {
        employeeId: charlie._id,
        leadership: 'technical-lead',
        assignedBy: admin._id,
      },
    ]);
    console.log('✅ Created leadership assignments');

    // Create Project Sessions (for today)
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    
    const todayAttendance = await Attendance.find({ date: todayDate });
    
    if (todayAttendance.length > 0) {
      const sessions = [];
      for (const attendance of todayAttendance) {
        if (attendance.selectedProjectId) {
          const sessionStart = new Date(attendance.checkInTime);
          const now = new Date();
          const minutesWorked = Math.floor((now - sessionStart) / 60000);
          
          sessions.push({
            employeeId: attendance.employeeId,
            projectId: attendance.selectedProjectId,
            attendanceId: attendance._id,
            sessionStartTime: sessionStart,
            status: 'Active',
            lastActivityTime: now,
            totalActiveMinutes: Math.floor(minutesWorked * 0.85),
            totalIdleMinutes: Math.floor(minutesWorked * 0.15),
            screenActivityLog: [
              { timestamp: sessionStart, type: 'Active', duration: 3600 },
              { timestamp: new Date(sessionStart.getTime() + 3600000), type: 'Idle', duration: 300 },
              { timestamp: new Date(sessionStart.getTime() + 3900000), type: 'Active', duration: 3600 },
            ],
          });
        }
      }
      
      if (sessions.length > 0) {
        await ProjectSession.insertMany(sessions);
        console.log('✅ Created project sessions');
      }
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Clients: ${clients.length}`);
    console.log(`   - Projects: ${projects.length}`);
    console.log(`   - Tasks: ${tasks.length}`);
    console.log(`   - Attendance Records: ${attendanceRecords.length}`);
    console.log(`   - Updates: ${updates.length}`);
    console.log(`   - Leadership Assignments: 3`);

    console.log('\n👤 Login Credentials:');
    console.log('   Admin: admin@example.com / Admin@123');
    console.log('   Employee (Alice): alice@company.com / TempPassword123!');
    console.log('   Employee (Bob): bob@company.com / Employee@123');
    console.log('   Employee (Charlie): charlie@company.com / Employee@123');
    console.log('   Employee (Diana): diana@company.com / Employee@123');
    console.log('   Client: client@acmecorp.com / Client@123');
    console.log('   Freelancer: freelancer@example.com / Freelancer@123');

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seedDatabase();
