// config/db.js
const { Sequelize } = require('sequelize');
require('dotenv').config(); // Ensure you have this if not already imported in your main file

// 1. Check if we are in "Production" mode (Cloud) or "Development" (Local)
const isProduction = process.env.NODE_ENV === 'production';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'cse_reviewer_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false, // Keeps your logs clean
    pool: {
      max: 10, // Increased for production traffic
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: false
    },
    // 2. THIS IS THE CRITICAL FIX FOR CLOUD DEPLOYMENT
    dialectOptions: isProduction ? {
      ssl: {
        require: true,
        // This allows connection without manually downloading the "CA Certificate" file.
        // It is slightly less secure than full verification but standard for simple deployments.
        rejectUnauthorized: false 
      }
    } : {} // Empty object for Localhost (XAMPP) so it doesn't break
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(isProduction ? '✅ Cloud MySQL Connected' : '✅ Local MySQL Connected');
    
    // 3. SAFETY CHECK:
    // In production, 'alter: true' tries to update tables without deleting data.
    // NEVER use 'force: true' here, or you will lose all your users.
    await sequelize.sync({ alter: true });
    
    console.log('✅ Database Synced');
  } catch (error) {
    console.error('❌ MySQL Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };