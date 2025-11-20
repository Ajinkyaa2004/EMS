import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Your MongoDB Atlas connection string
const MONGODB_URI = 'mongodb+srv://dhumalajinkya2004_db_user:YkM387UK07DJoCI3@projects.rkmjjpd.mongodb.net/ems?retryWrites=true&w=majority';

// User Schema
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
  department: String,
  position: String,
  joiningDate: Date,
  phone: String,
  address: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

async function createUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Clear existing users (optional - comment out if you want to keep existing)
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Create Admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@ems.com',
      password: adminPassword,
      role: 'admin',
      department: 'Administration',
      position: 'System Administrator',
      joiningDate: new Date('2024-01-01'),
      phone: '+1234567890',
      address: '123 Admin Street',
    });
    console.log('✅ Created admin@ems.com');

    // Create Employee
    const empPassword = await bcrypt.hash('emp123', 10);
    await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@ems.com',
      password: empPassword,
      role: 'employee',
      department: 'Development',
      position: 'Software Engineer',
      joiningDate: new Date('2024-02-01'),
      phone: '+1234567891',
      address: '456 Employee Ave',
    });
    console.log('✅ Created john@ems.com');

    // Create Client
    const clientPassword = await bcrypt.hash('client123', 10);
    await User.create({
      firstName: 'Client',
      lastName: 'Company',
      email: 'client@ems.com',
      password: clientPassword,
      role: 'client',
      department: 'External',
      position: 'Client Contact',
      joiningDate: new Date('2024-03-01'),
      phone: '+1234567892',
      address: '789 Client Blvd',
    });
    console.log('✅ Created client@ems.com');

    console.log('\n🎉 All users created successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('Admin: admin@ems.com / admin123');
    console.log('Employee: john@ems.com / emp123');
    console.log('Client: client@ems.com / client123');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createUsers();
