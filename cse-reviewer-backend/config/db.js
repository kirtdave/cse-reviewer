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
    
    port: process.env.DB_PORT || 3306,

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
    
    // 👇👇👇 CHANGED TO FORCE: TRUE 👇👇👇
    // This will wipe the conflicting tables and recreate them clean.
    await sequelize.sync({ force: true });
    
    console.log('✅ Database Synced');
  } catch (error) {
    console.error('❌ MySQL Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };