import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Import models from dist (compiled output)
import { Points } from './dist/models/Points.js';
import { User } from './dist/models/User.js';

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ems';

async function seedPointsData() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Get all employees
    const employees = await User.find({ role: { $in: ['employee', 'client'] } }).limit(10);
    
    if (employees.length === 0) {
      console.log('⚠️ No employees found. Create some employees first!');
      await mongoose.disconnect();
      return;
    }

    console.log(`📊 Found ${employees.length} employees. Seeding points data...`);

    // Clear existing points data
    await Points.deleteMany({});
    console.log('🗑️  Cleared existing points data');

    // Create points records for each employee with realistic data
    const pointsRecords = employees.map((employee, index) => {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const basePoints = 100 + Math.random() * 150; // 100-250
      const monthlyPoints = Math.min(200, Math.floor(basePoints * (0.7 + Math.random() * 0.3)));

      // Generate realistic transaction history
      const transactions = [];
      const daysInMonth = 20; // Approximate work days

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(new Date().getFullYear(), new Date().getMonth(), day);

        // Attendance (most days)
        if (Math.random() > 0.1) {
          const isOnTime = Math.random() > 0.2;
          const attendancePoints = isOnTime ? 7 : 5;
          const status = ['Present', 'WFH'][Math.floor(Math.random() * 2)];
          
          transactions.push({
            activityType: 'attendance',
            points: attendancePoints,
            description: `Attendance - ${status}${isOnTime ? ' (On Time)' : ''}`,
            metadata: { attendanceStatus: status },
            createdAt: new Date(date.setHours(9, Math.random() * 30, 0)),
          });
        }

        // Daily updates (random days)
        if (Math.random() > 0.4) {
          const isRich = Math.random() > 0.4;
          const updatePoints = isRich ? 3 : 1;
          transactions.push({
            activityType: 'daily_update',
            points: updatePoints,
            description: `Daily Update - ${isRich ? 'Rich (with checklist/attachments)' : 'Simple'}`,
            metadata: { updateType: isRich ? 'rich' : 'simple' },
            createdAt: new Date(date.setHours(17, Math.random() * 60, 0)),
          });
        }

        // Tasks (random days)
        if (Math.random() > 0.5) {
          const priority = ['low', 'medium', 'high'][Math.floor(Math.random() * 3)];
          const bonusPoints = { low: 0, medium: 2, high: 5 }[priority];
          const taskPoints = 4 + bonusPoints;
          transactions.push({
            activityType: 'task',
            points: taskPoints,
            description: `Task Completed - Priority: ${priority.toUpperCase()} (Base: 4 + Bonus: ${bonusPoints})`,
            metadata: {
              taskId: new mongoose.Types.ObjectId(),
              taskPriority: priority,
            },
            createdAt: new Date(date.setHours(16, Math.random() * 60, 0)),
          });
        }
      }

      // Add some milestones
      if (index % 3 === 0) {
        transactions.push({
          activityType: 'milestone',
          points: 20,
          description: 'Milestone: Weekly Goal Achievement (Standard - 20 points)',
          metadata: { milestoneType: 'completion' },
          createdAt: new Date(new Date().setDate(new Date().getDate() - Math.floor(Math.random() * 20))),
        });
      }

      // Add some penalties for variety
      if (index % 5 === 0 && Math.random() > 0.6) {
        transactions.push({
          activityType: 'penalty',
          points: -20,
          description: 'Penalty: Late arrival (Minor - 20 points)',
          metadata: { penaltyReason: 'Late arrival' },
          createdAt: new Date(new Date().setDate(new Date().getDate() - Math.floor(Math.random() * 15))),
        });
      }

      // Sort transactions by date
      transactions.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      // Calculate total points
      const totalPoints = transactions.reduce((sum, t) => sum + t.points, 0);

      return {
        employeeId: employee._id,
        totalPoints: Math.max(0, totalPoints),
        monthlyPoints: monthlyPoints,
        currentMonth: currentMonth,
        transactions: transactions,
        lastReset: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        expiryDate: new Date(Date.now() + 24 * 30 * 24 * 60 * 60 * 1000),
        isActive: true,
      };
    });

    // Insert all points records
    const createdPoints = await Points.insertMany(pointsRecords);
    console.log(`✅ Created ${createdPoints.length} points records`);

    // Display summary
    console.log('\n📊 Points Data Summary:\n');
    employees.forEach((employee, index) => {
      const points = pointsRecords[index];
      console.log(`  ${index + 1}. ${employee.firstName} ${employee.lastName}`);
      console.log(`     Total: ${points.totalPoints} pts | This Month: ${points.monthlyPoints}/200`);
      console.log(`     Transactions: ${points.transactions.length}`);
      console.log(`     Expiry: ${new Date(points.expiryDate).toLocaleDateString()}`);
    });

    console.log('\n✅ Points seeding completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Go to Employee Dashboard → "My Points" tab to see points');
    console.log('   2. Go to Admin Dashboard → Points Management to see leaderboard');
    console.log('   3. Try marking attendance or posting updates to earn new points');

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedPointsData();
