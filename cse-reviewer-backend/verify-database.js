// verify-database.js
// Run with: node verify-database.js

require('dotenv').config();
const mysql = require('mysql2/promise');

async function verifyDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cse_reviewer'
  });

  try {
    console.log('🔍 Verifying database health...\n');

    // Get all tables
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME
    `);

    console.log(`📊 Found ${tables.length} tables:\n`);

    let totalIndexes = 0;
    let hasIssues = false;

    // Check indexes for each table
    for (const table of tables) {
      const tableName = table.TABLE_NAME;
      
      const [indexes] = await connection.query(`
        SELECT COUNT(DISTINCT INDEX_NAME) as index_count
        FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
      `, [tableName]);

      const indexCount = indexes[0].index_count;
      totalIndexes += indexCount;
      
      if (indexCount > 50) {
        console.log(`❌ ${tableName}: ${indexCount} indexes (CRITICAL - near limit!)`);
        hasIssues = true;
      } else if (indexCount > 30) {
        console.log(`⚠️  ${tableName}: ${indexCount} indexes (HIGH)`);
        hasIssues = true;
      } else if (indexCount > 15) {
        console.log(`⚡ ${tableName}: ${indexCount} indexes (MODERATE)`);
      } else {
        console.log(`✅ ${tableName}: ${indexCount} indexes (HEALTHY)`);
      }
    }

    console.log(`\n📈 Total indexes across all tables: ${totalIndexes}`);
    
    if (!hasIssues) {
      console.log('\n🎉 All tables are healthy! No index issues detected.');
    } else {
      console.log('\n⚠️  Some tables have high index counts. Consider optimizing.');
    }

    // Check table sizes
    console.log('\n📦 Table row counts:');
    for (const table of tables) {
      const tableName = table.TABLE_NAME;
      const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      console.log(`   ${tableName}: ${rows[0].count} rows`);
    }

    console.log('\n✅ Verification complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

verifyDatabase();