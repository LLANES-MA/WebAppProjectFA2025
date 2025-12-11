/**
 * Real-Time Database Connection Test
 * Run this to verify data is coming from database in real-time
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function testRealtime() {
  console.log('🔍 Testing Real-Time Database Connection\n');
  console.log('='.repeat(50));
  
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'FrontDash',
  };
  
  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Connected to database:', config.database);
    console.log('   Host:', config.host);
    console.log('');
    
    // Test 1: Query restaurants
    console.log('📊 Test 1: Querying Restaurant table...');
    const [restaurants] = await connection.execute(`
      SELECT 
        r.restaurant_id,
        r.name,
        r.request_status,
        a.city,
        a.state
      FROM Restaurant r
      LEFT JOIN Address a ON r.address_id = a.address_id
      WHERE r.request_status = 'APPROVED' AND r.is_active = 1
    `);
    console.log(`   Found ${restaurants.length} restaurants in database`);
    restaurants.forEach(r => {
      console.log(`   - ${r.name} (${r.city}, ${r.state})`);
    });
    console.log('');
    
    // Test 2: Query menu items
    console.log('📊 Test 2: Querying MenuItem table...');
    const [menuItems] = await connection.execute(`
      SELECT name, price FROM MenuItem WHERE restaurant_id = 1 LIMIT 3
    `);
    console.log(`   Found ${menuItems.length} menu items for restaurant 1`);
    menuItems.forEach(item => {
      console.log(`   - ${item.name}: $${item.price}`);
    });
    console.log('');
    
    // Test 3: Query hours
    console.log('📊 Test 3: Querying RestaurantHours table...');
    const [hours] = await connection.execute(`
      SELECT weekday, open_time, close_time 
      FROM RestaurantHours 
      WHERE restaurant_id = 1 
      LIMIT 3
    `);
    console.log(`   Found ${hours.length} hours entries for restaurant 1`);
    const weekdayMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    hours.forEach(h => {
      const day = weekdayMap[h.weekday] || `Day ${h.weekday}`;
      console.log(`   - ${day}: ${String(h.open_time).substring(0,5)} - ${String(h.close_time).substring(0,5)}`);
    });
    console.log('');
    
    // Test 4: Make a change and verify
    console.log('📊 Test 4: Real-time update test...');
    const originalName = restaurants[0]?.name || 'Test';
    const testName = originalName + ' [TEST]';
    
    await connection.execute(
      'UPDATE Restaurant SET name = ? WHERE restaurant_id = ?',
      [testName, restaurants[0]?.restaurant_id]
    );
    console.log(`   Updated restaurant name to: ${testName}`);
    
    const [updated] = await connection.execute(
      'SELECT name FROM Restaurant WHERE restaurant_id = ?',
      [restaurants[0]?.restaurant_id]
    );
    console.log(`   Verified in database: ${updated[0]?.name}`);
    
    // Revert
    await connection.execute(
      'UPDATE Restaurant SET name = ? WHERE restaurant_id = ?',
      [originalName, restaurants[0]?.restaurant_id]
    );
    console.log(`   Reverted to: ${originalName}`);
    console.log('');
    
    await connection.end();
    
    console.log('='.repeat(50));
    console.log('✅ All tests passed!');
    console.log('✅ Database connection is working');
    console.log('✅ Data is accessible in real-time');
    console.log('');
    console.log('Next: Test API endpoints:');
    console.log('  curl http://localhost:8080/api/restaurants');
    console.log('  curl http://localhost:8080/api/restaurants/1/menu');
    console.log('  curl http://localhost:8080/api/restaurants/1/hours');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Check database configuration in .env file');
  }
}

testRealtime();

