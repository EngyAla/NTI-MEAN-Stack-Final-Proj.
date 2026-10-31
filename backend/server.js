require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');
const Manager = require('./models/Manager');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB().then(async () => {
  // Ensure default manager account exists from environment
  try {
    const managerEmail = (process.env.MANAGER_EMAIL || 'manager@aurelia.com').toLowerCase().trim();
    const existingManager = await Manager.findOne({ email: managerEmail });

    if (!existingManager) {
      console.log(`[Seed] Creating initial manager account for ${managerEmail}...`);
      await Manager.create({
        name: process.env.MANAGER_NAME || 'Aurelia Executive Manager',
        email: managerEmail,
        password: process.env.MANAGER_PASSWORD || 'Manager@123456',
        role: 'manager',
      });
      console.log('[Seed] Manager account created successfully.');
    } else {
      console.log(`[Auth] Manager account active: ${managerEmail}`);
    }
  } catch (seedErr) {
    console.error('[Seed Error]:', seedErr.message);
  }

  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`   AURELIA ATELIER BACKEND SERVER RUNNING`);
    console.log(`   PORT: ${PORT}`);
    console.log(`   ENVIRONMENT: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   DATABASE: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/nti-final-project'}`);
    console.log(`=================================================`);
  });
});
