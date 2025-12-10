// config/db.js
const { Sequelize } = require('sequelize');
require('dotenv').config(); 

const isProduction = process.env.NODE_ENV === 'production';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'cse_reviewer_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306, // ✅ Correct Port logic
    logging: false, 
    pool: {
      max: 10, 
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: false
    },
    dialectOptions: isProduction ? {
      ssl: {
        require: true,
        rejectUnauthorized: false 
      }
    } : {} 
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(isProduction ? '✅ Cloud MySQL Connected' : '✅ Local MySQL Connected');
    
    // 👇 STEP 1: Disable Security Checks
    if (isProduction) {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });
    }

    // 👇 STEP 2: KILL THE ZOMBIE TABLE (Capital 'N')
    // We force delete the old table that is causing the conflict
    await sequelize.query('DROP TABLE IF EXISTS Notifications', { raw: true });
    await sequelize.query('DROP TABLE IF EXISTS notifications', { raw: true });

    // 👇 STEP 3: Recreate Fresh
    await sequelize.sync({ force: true });
    
    // 👇 STEP 4: Enable Security Checks
    if (isProduction) {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true });
    }
    
    console.log('✅ Database Synced');
  } catch (error) {
    console.error('❌ MySQL Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };