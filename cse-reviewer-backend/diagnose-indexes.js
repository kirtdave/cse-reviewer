// reset-database.js
// ⚠️ WARNING: This will delete all data and recreate tables
// Run with: node reset-database.js

require('dotenv').config();
const { sequelize } = require('./models');

async function resetDatabase() {
  try {
    console.log('🗑️  Dropping all tables...');
    
    // Force sync will drop existing tables and recreate them
    await sequelize.sync({ force: true });
    
    console.log('✅ Database reset complete!');
    console.log('📊 All tables recreated with proper indexes');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
    process.exit(1);
  }
}

resetDatabase();