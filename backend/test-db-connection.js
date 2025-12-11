/**
 * Test MySQL Database Connection
 * Run this to test different connection configurations
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection(config) {
  console.log(`\n🔍 Testing connection to: ${config.host}:${config.port}`);
  console.log(`   Database: ${config.database}`);
  console.log(`   User: ${config.user}`);
  
  try {
    const connection = await mysql.createConnection(config);
    await connection.execute('SELECT 1 as test');
    await connection.end();
    console.log('   ✅ Connection successful!\n');
    return true;
  } catch (error) {
    console.log(`   ❌ Connection failed: ${error.message}\n`);
    return false;
  }
}

async function main() {
  console.log('🧪 Testing MySQL Database Connections\n');
  console.log('=' .repeat(50));
  
  // Test current .env configuration
  const envConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'FrontDash',
  };
  
  console.log('\n1. Testing .env configuration:');
  const envSuccess = await testConnection(envConfig);
  
  // Test localhost
  if (envConfig.host !== 'localhost') {
    console.log('2. Testing localhost:');
    const localhostConfig = { ...envConfig, host: 'localhost' };
    await testConnection(localhostConfig);
  }
  
  // Test 127.0.0.1
  if (envConfig.host !== '127.0.0.1') {
    console.log('3. Testing 127.0.0.1:');
    const localhostIPConfig = { ...envConfig, host: '127.0.0.1' };
    await testConnection(localhostIPConfig);
  }
  
  console.log('=' .repeat(50));
  console.log('\n💡 If all tests failed:');
  console.log('   1. Check if MySQL is running');
  console.log('   2. Verify MySQLServer hostname/IP is correct');
  console.log('   3. Check MySQL user permissions');
  console.log('   4. Try adding MySQLServer to /etc/hosts');
  console.log('   5. Update .env with correct host/IP and password\n');
}

main().catch(console.error);

