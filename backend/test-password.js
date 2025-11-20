const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/ems').then(async () => {
  const User = mongoose.model('User', new mongoose.Schema({
    email: String,
    password: String,
    firstName: String,
    lastName: String,
    role: String
  }));
  
  const user = await User.findOne({ email: 'admin@gmail.com' });
  if (user) {
    console.log('User found:', user.email);
    console.log('Password hash:', user.password);
    
    const testPass = 'Admin@123';
    const isMatch = await bcrypt.compare(testPass, user.password);
    console.log('Password test result:', isMatch);
    
    if (!isMatch) {
      console.log('ERROR: Password does not match!');
      console.log('The stored hash may be incorrect.');
      console.log('\nRecreating user with correct password...');
      
      // Delete and recreate with proper hash
      await User.deleteOne({ email: 'admin@gmail.com' });
      
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      const newUser = new User({
        email: 'admin@gmail.com',
        password: hashedPassword,
        firstName: 'Ajinkya',
        lastName: 'Dhumal',
        role: 'admin'
      });
      await newUser.save();
      
      console.log('User recreated successfully!');
      console.log('New password hash:', newUser.password);
      
      const testAgain = await bcrypt.compare('Admin@123', newUser.password);
      console.log('New password test:', testAgain);
    } else {
      console.log('Password is correct!');
    }
  } else {
    console.log('No user found!');
  }
  
  mongoose.connection.close();
}).catch(err => console.error('Error:', err));
