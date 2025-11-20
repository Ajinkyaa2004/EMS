import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const mongoUri = 'mongodb://localhost:27017/ems';

// Schemas
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

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: String,
  email: String,
  phone: String,
  contactPerson: String,
}, { timestamps: true });

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  clientId: mongoose.Schema.Types.ObjectId,
  projectType: String,
  priority: { type: String, enum: ['low', 'medium', 'high'] },
  status: { type: String, enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'] },
  tags: [String],
  estimatedHours: Number,
  startDate: Date,
  endDate: Date,
  leadAssignee: mongoose.Schema.Types.ObjectId,
  virtualAssistant: mongoose.Schema.Types.ObjectId,
  freelancers: [mongoose.Schema.Types.ObjectId],
  coders: [mongoose.Schema.Types.ObjectId],
  projectLeader: mongoose.Schema.Types.ObjectId,
  links: {
    github: String,
    loom: String,
    whatsapp: String,
    oneDrive: String,
  },
}, { timestamps: true });

const updateSchema = new mongoose.Schema({
  projectId: mongoose.Schema.Types.ObjectId,
  employeeId: mongoose.Schema.Types.ObjectId,
  date: Date,
  summary: String,
  checklist: [{ task: String, completed: Boolean }],
  nextPlan: String,
  attachments: [{ fileName: String, fileUrl: String, uploadedAt: Date }],
}, { timestamps: true });

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  assignedBy: mongoose.Schema.Types.ObjectId,
  assignedTo: mongoose.Schema.Types.ObjectId,
  projectId: mongoose.Schema.Types.ObjectId,
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['pending', 'in-progress', 'completed', 'cancelled'], default: 'pending' },
  dueDate: Date,
  attachments: [{ fileName: String, fileUrl: String, uploadedAt: Date }],
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Client = mongoose.model('Client', clientSchema);
const Project = mongoose.model('Project', projectSchema);
const Update = mongoose.model('Update', updateSchema);
const Task = mongoose.model('Task', taskSchema);

async function seedData() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Client.deleteMany({});
    await Project.deleteMany({});
    await Update.deleteMany({});
    await Task.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create Users
    const users = [
      {
        email: 'admin@example.com',
        password: await bcrypt.hash('Admin@123', 10),
        firstName: 'John',
        lastName: 'Doe',
        role: 'admin',
        phone: '+1-555-0001',
      },
      {
        email: 'alice@company.com',
        password: await bcrypt.hash('TempPassword123!', 10),
        firstName: 'Alice',
        lastName: 'Johnson',
        role: 'employee',
        phone: '+1-555-0002',
      },
      {
        email: 'bob@company.com',
        password: await bcrypt.hash('Password@123', 10),
        firstName: 'Bob',
        lastName: 'Wilson',
        role: 'employee',
        phone: '+1-555-0003',
      },
      {
        email: 'carol@company.com',
        password: await bcrypt.hash('Password@123', 10),
        firstName: 'Carol',
        lastName: 'Davis',
        role: 'employee',
        phone: '+1-555-0004',
      },
      {
        email: 'david@company.com',
        password: await bcrypt.hash('Password@123', 10),
        firstName: 'David',
        lastName: 'Lee',
        role: 'employee',
        phone: '+1-555-0005',
      },
      {
        email: 'client@acmecorp.com',
        password: await bcrypt.hash('Client@123', 10),
        firstName: 'Bob',
        lastName: 'Smith',
        role: 'client',
        phone: '+1-555-0100',
      },
      {
        email: 'client2@techcorp.com',
        password: await bcrypt.hash('Client@123', 10),
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'client',
        phone: '+1-555-0101',
      },
      {
        email: 'freelancer1@example.com',
        password: await bcrypt.hash('Freelancer@123', 10),
        firstName: 'James',
        lastName: 'Martinez',
        role: 'freelancer',
        phone: '+1-555-0200',
      },
      {
        email: 'freelancer2@example.com',
        password: await bcrypt.hash('Freelancer@123', 10),
        firstName: 'Sarah',
        lastName: 'Williams',
        role: 'freelancer',
        phone: '+1-555-0201',
      },
      {
        email: 'freelancer3@example.com',
        password: await bcrypt.hash('Freelancer@123', 10),
        firstName: 'Michael',
        lastName: 'Chen',
        role: 'freelancer',
        phone: '+1-555-0202',
      },
      {
        email: 'freelancer4@example.com',
        password: await bcrypt.hash('Freelancer@123', 10),
        firstName: 'Emily',
        lastName: 'Thompson',
        role: 'freelancer',
        phone: '+1-555-0203',
      },
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create Clients
    const clients = [
      {
        name: 'Acme Corporation',
        type: 'Tech Company',
        email: 'contact@acmecorp.com',
        phone: '+1-555-1000',
        contactPerson: 'Bob Smith',
      },
      {
        name: 'Tech Solutions Inc',
        type: 'Software Development',
        email: 'info@techsolutions.com',
        phone: '+1-555-1001',
        contactPerson: 'Sarah Johnson',
      },
      {
        name: 'Digital Marketing Pro',
        type: 'Marketing Agency',
        email: 'hello@digitalmarketingpro.com',
        phone: '+1-555-1002',
        contactPerson: 'Mike Brown',
      },
      {
        name: 'E-Commerce Plus',
        type: 'Retail',
        email: 'support@ecommerceplus.com',
        phone: '+1-555-1003',
        contactPerson: 'Jennifer White',
      },
    ];

    const createdClients = await Client.insertMany(clients);
    console.log(`✅ Created ${createdClients.length} clients`);

    // Create Projects
    const projects = [
      {
        title: 'Website Redesign',
        description: 'Complete redesign of company website with modern UI/UX',
        clientId: createdClients[0]._id,
        projectType: 'Web Development',
        priority: 'high',
        status: 'active',
        tags: ['frontend', 'design', 'responsive'],
        estimatedHours: 160,
        startDate: new Date('2025-10-01'),
        endDate: new Date('2025-12-31'),
        leadAssignee: createdUsers[1]._id,
        virtualAssistant: createdUsers[2]._id,
        coders: [createdUsers[3]._id, createdUsers[4]._id],
        createdBy: createdUsers[0]._id,
        links: {
          github: 'https://github.com/acme/website-redesign',
          loom: 'https://loom.com/share/acme-website',
          oneDrive: 'https://onedrive.com/acme-website',
        },
      },
      {
        title: 'Mobile App Development',
        description: 'Native iOS and Android mobile application',
        clientId: createdClients[1]._id,
        projectType: 'Mobile Development',
        priority: 'high',
        status: 'active',
        tags: ['ios', 'android', 'mobile'],
        estimatedHours: 240,
        startDate: new Date('2025-11-01'),
        endDate: new Date('2026-01-15'),
        leadAssignee: createdUsers[3]._id,
        virtualAssistant: createdUsers[1]._id,
        coders: [createdUsers[2]._id, createdUsers[4]._id],
        createdBy: createdUsers[0]._id,
        links: {
          github: 'https://github.com/techsolutions/mobile-app',
        },
      },
      {
        title: 'Database Migration',
        description: 'Migration from legacy database to modern cloud solution',
        clientId: createdClients[0]._id,
        projectType: 'Infrastructure',
        priority: 'high',
        status: 'active',
        tags: ['database', 'cloud', 'migration'],
        estimatedHours: 80,
        startDate: new Date('2025-09-15'),
        endDate: new Date('2025-11-30'),
        leadAssignee: createdUsers[4]._id,
        virtualAssistant: createdUsers[2]._id,
        coders: [createdUsers[1]._id],
        createdBy: createdUsers[0]._id,
        links: {
          oneDrive: 'https://onedrive.com/database-migration',
        },
      },
      {
        title: 'API Integration',
        description: 'Integrate third-party APIs for payment and shipping',
        clientId: createdClients[2]._id,
        projectType: 'Backend Development',
        priority: 'medium',
        status: 'planning',
        tags: ['api', 'integration', 'backend'],
        estimatedHours: 120,
        startDate: new Date('2025-12-01'),
        endDate: new Date('2025-12-15'),
        leadAssignee: createdUsers[2]._id,
        virtualAssistant: createdUsers[1]._id,
        coders: [createdUsers[3]._id],
        createdBy: createdUsers[0]._id,
      },
      {
        title: 'SEO Optimization',
        description: 'Optimize website for search engines',
        clientId: createdClients[3]._id,
        projectType: 'SEO',
        priority: 'medium',
        status: 'active',
        tags: ['seo', 'marketing', 'optimization'],
        estimatedHours: 60,
        startDate: new Date('2025-11-15'),
        endDate: new Date('2025-12-15'),
        leadAssignee: createdUsers[1]._id,
        virtualAssistant: createdUsers[4]._id,
        createdBy: createdUsers[0]._id,
      },
    ];

    const createdProjects = await Project.insertMany(projects);
    console.log(`✅ Created ${createdProjects.length} projects`);

    // Create Updates
    const updates = [
      {
        projectId: createdProjects[0]._id,
        employeeId: createdUsers[1]._id,
        date: new Date(),
        summary: 'Completed homepage design mockups and got client approval',
        checklist: [
          { task: 'Design mockups', completed: true },
          { task: 'Client review', completed: true },
          { task: 'Revisions', completed: false },
        ],
        nextPlan: 'Start frontend development with React',
        attachments: [
          { fileName: 'homepage-mockup.pdf', fileUrl: 'https://example.com/mockup.pdf', uploadedAt: new Date() },
        ],
      },
      {
        projectId: createdProjects[0]._id,
        employeeId: createdUsers[3]._id,
        date: new Date(Date.now() - 86400000),
        summary: 'Set up development environment and created project structure',
        checklist: [
          { task: 'Install dependencies', completed: true },
          { task: 'Setup Git repository', completed: true },
          { task: 'Create folder structure', completed: true },
        ],
        nextPlan: 'Begin component development',
      },
      {
        projectId: createdProjects[1]._id,
        employeeId: createdUsers[3]._id,
        date: new Date(),
        summary: 'Completed API design and database schema',
        checklist: [
          { task: 'API endpoints design', completed: true },
          { task: 'Database schema', completed: true },
          { task: 'Authentication flow', completed: false },
        ],
        nextPlan: 'Start backend implementation',
      },
      {
        projectId: createdProjects[2]._id,
        employeeId: createdUsers[4]._id,
        date: new Date(),
        summary: 'Completed data audit and migration plan',
        checklist: [
          { task: 'Data audit', completed: true },
          { task: 'Migration plan', completed: true },
          { task: 'Backup strategy', completed: true },
        ],
        nextPlan: 'Execute migration in staging environment',
      },
      {
        projectId: createdProjects[4]._id,
        employeeId: createdUsers[1]._id,
        date: new Date(),
        summary: 'Keyword research and competitor analysis completed',
        checklist: [
          { task: 'Keyword research', completed: true },
          { task: 'Competitor analysis', completed: true },
          { task: 'Content strategy', completed: false },
        ],
        nextPlan: 'Implement on-page SEO optimizations',
      },
      {
        projectId: createdProjects[0]._id,
        employeeId: createdUsers[1]._id,
        date: new Date(Date.now() - 172800000),
        summary: 'Frontend components implemented - Navigation, Hero section, and Footer created',
        checklist: [
          { task: 'Navigation component', completed: true },
          { task: 'Hero section', completed: true },
          { task: 'Footer component', completed: true },
          { task: 'Responsive design', completed: true },
        ],
        nextPlan: 'Implement Services section and Contact form',
        attachments: [
          { fileName: 'components-screenshot.png', fileUrl: 'https://example.com/components.png', uploadedAt: new Date() },
        ],
      },
      {
        projectId: createdProjects[1]._id,
        employeeId: createdUsers[3]._id,
        date: new Date(Date.now() - 172800000),
        summary: 'Backend routes implemented for user authentication and profile management',
        checklist: [
          { task: 'Auth routes', completed: true },
          { task: 'User CRUD operations', completed: true },
          { task: 'JWT implementation', completed: true },
          { task: 'Error handling', completed: false },
        ],
        nextPlan: 'Implement payment gateway integration',
      },
      {
        projectId: createdProjects[0]._id,
        employeeId: createdUsers[2]._id,
        date: new Date(Date.now() - 259200000),
        summary: 'UI/UX design review meeting with stakeholders - All feedback documented',
        checklist: [
          { task: 'Design walkthrough', completed: true },
          { task: 'Collect feedback', completed: true },
          { task: 'Document changes', completed: true },
        ],
        nextPlan: 'Implement feedback in next iteration',
      },
      {
        projectId: createdProjects[2]._id,
        employeeId: createdUsers[4]._id,
        date: new Date(Date.now() - 259200000),
        summary: 'Database performance optimization completed - Query optimization by 40%',
        checklist: [
          { task: 'Query optimization', completed: true },
          { task: 'Index creation', completed: true },
          { task: 'Performance testing', completed: true },
        ],
        nextPlan: 'Monitor performance metrics and continue optimization',
      },
      {
        projectId: createdProjects[4]._id,
        employeeId: createdUsers[1]._id,
        date: new Date(Date.now() - 345600000),
        summary: 'On-page SEO optimization completed for all main pages',
        checklist: [
          { task: 'Meta tags optimization', completed: true },
          { task: 'H1/H2 tags', completed: true },
          { task: 'Image alt text', completed: true },
          { task: 'Internal linking', completed: true },
        ],
        nextPlan: 'Setup backlink strategy and content marketing',
      },
    ];

    const createdUpdates = await Update.insertMany(updates);
    console.log(`✅ Created ${createdUpdates.length} updates`);

    // Create Tasks
    const tasks = [
      {
        title: 'Design Homepage Mockup',
        description: 'Create a modern and responsive homepage mockup for the website redesign project',
        assignedBy: createdUsers[0]._id,
        assignedTo: createdUsers[1]._id,
        projectId: createdProjects[0]._id,
        priority: 'high',
        status: 'in-progress',
        dueDate: new Date('2025-11-30'),
      },
      {
        title: 'Setup Development Environment',
        description: 'Install all necessary tools and dependencies for the mobile app project',
        assignedBy: createdUsers[0]._id,
        assignedTo: createdUsers[3]._id,
        projectId: createdProjects[1]._id,
        priority: 'high',
        status: 'completed',
        dueDate: new Date('2025-11-10'),
      },
      {
        title: 'Database Schema Design',
        description: 'Design and document the database schema for the mobile application',
        assignedBy: createdUsers[0]._id,
        assignedTo: createdUsers[3]._id,
        projectId: createdProjects[1]._id,
        priority: 'high',
        status: 'in-progress',
        dueDate: new Date('2025-11-25'),
      },
      {
        title: 'API Endpoint Documentation',
        description: 'Document all API endpoints with request/response examples',
        assignedBy: createdUsers[0]._id,
        assignedTo: createdUsers[2]._id,
        projectId: createdProjects[3]._id,
        priority: 'medium',
        status: 'pending',
        dueDate: new Date('2025-12-10'),
      },
      {
        title: 'Keyword Research and Analysis',
        description: 'Research and analyze keywords for SEO optimization',
        assignedBy: createdUsers[0]._id,
        assignedTo: createdUsers[1]._id,
        projectId: createdProjects[4]._id,
        priority: 'medium',
        status: 'pending',
        dueDate: new Date('2025-12-05'),
      },
      {
        title: 'Data Migration Testing',
        description: 'Test the data migration process in staging environment',
        assignedBy: createdUsers[0]._id,
        assignedTo: createdUsers[4]._id,
        projectId: createdProjects[2]._id,
        priority: 'high',
        status: 'pending',
        dueDate: new Date('2025-11-28'),
      },
    ];

    const createdTasks = await Task.insertMany(tasks);
    console.log(`✅ Created ${createdTasks.length} tasks`);

    console.log('\n✅ All test data seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: ${createdUsers.length}`);
    console.log(`   - Clients: ${createdClients.length}`);
    console.log(`   - Projects: ${createdProjects.length}`);
    console.log(`   - Updates: ${createdUpdates.length}`);
    console.log(`   - Tasks: ${createdTasks.length}`);

    console.log('\n🔐 Test Credentials:');
    console.log('   Admin: admin@example.com / Admin@123');
    console.log('   Employee: alice@company.com / TempPassword123!');
    console.log('   Client: client@acmecorp.com / Client@123');
    console.log('   Freelancer 1: freelancer1@example.com / Freelancer@123');
    console.log('   Freelancer 2: freelancer2@example.com / Freelancer@123');
    console.log('   Freelancer 3: freelancer3@example.com / Freelancer@123');
    console.log('   Freelancer 4: freelancer4@example.com / Freelancer@123');

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedData();
