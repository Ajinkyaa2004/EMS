import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const mongoUri = 'mongodb://localhost:27017/ems';

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ['admin', 'employee', 'client', 'trainee'], required: true },
  phone: String,
  avatar: String,
  isActive: { type: Boolean, default: true },
  isTrainee: { type: Boolean, default: false },
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
        email: 'admin@gmail.com',
        password: await bcrypt.hash('Admin@123', 10),
        firstName: 'Ajinkya',
        lastName: 'Dhumal',
        role: 'admin',
      },
      {
        email: 'employee@gmail.com',
        password: await bcrypt.hash('Employee@123', 10),
        firstName: 'Yash',
        lastName: 'Dhiver',
        role: 'employee',
      },
      {
        email: 'client@gmail.com',
        password: await bcrypt.hash('Client@123', 10),
        firstName: 'Shamak',
        lastName: 'Patel',
        role: 'client',
      },
      {
        email: 'trainee@gmail.com',
        password: await bcrypt.hash('Trainee@123', 10),
        firstName: 'Rohan',
        lastName: 'Kumar',
        role: 'trainee',
        phone: '+1-555-0199',
        isTrainee: true,
      },
    ];

    const createdUsers = await User.insertMany(users);
    console.log('✅ Created users:');
    createdUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.role})`);
    });

    console.log('\n✅ Users created successfully!');
    console.log('\nTest Credentials:');
    console.log('Admin: admin@gmail.com / Admin@123');
    console.log('Employee: employee@gmail.com / Employee@123');
    console.log('Client: client@gmail.com / Client@123');
    console.log('Trainee: trainee@gmail.com / Trainee@123');

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createUsers();
