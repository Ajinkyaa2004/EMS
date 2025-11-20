const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const mongoUri = 'mongodb://localhost:27017/ems';

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ['admin', 'employee', 'client'], required: true },
  phone: String,
  avatar: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createUsers() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Delete existing users
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Create test users
    const users = [
      {
        email: 'admin@example.com',
        password: await bcrypt.hash('Admin@123', 10),
        firstName: 'John',
        lastName: 'Doe',
        role: 'admin',
      },
      {
        email: 'alice@company.com',
        password: await bcrypt.hash('TempPassword123!', 10),
        firstName: 'Alice',
        lastName: 'Johnson',
        role: 'employee',
      },
      {
        email: 'client@acmecorp.com',
        password: await bcrypt.hash('Client@123', 10),
        firstName: 'Bob',
        lastName: 'Smith',
        role: 'client',
      },
    ];

    const createdUsers = await User.insertMany(users);
    console.log('✅ Created users:');
    createdUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.role})`);
    });

    console.log('\n✅ Users created successfully!');
    console.log('\nTest Credentials:');
    console.log('Admin: admin@example.com / Admin@123');
    console.log('Employee: alice@company.com / TempPassword123!');
    console.log('Client: client@acmecorp.com / Client@123');

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createUsers();
