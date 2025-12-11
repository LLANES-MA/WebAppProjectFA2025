/**
 * Script to create admin user
 * Run with: node scripts/create-admin.js
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function createAdmin() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'FrontDash',
    ...(process.env.DB_SOCKET_PATH && { socketPath: process.env.DB_SOCKET_PATH }),
  });

  try {
    const username = 'mac@cheese.com';
    const password = 'Password1234';
    
    console.log('🔐 Creating admin user...');
    console.log(`Username: ${username}`);
    
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    console.log('✅ Password hashed');
    
    // Check if admin already exists
    const [existing] = await connection.execute(
      'SELECT * FROM Login WHERE username = ?',
      [username]
    );
    
    if (existing.length > 0) {
      console.log('⚠️  Admin user already exists. Updating password and usertype...');
      
      // First check what usertype values are allowed by checking existing entries
      const [sample] = await connection.execute(
        'SELECT DISTINCT usertype FROM Login WHERE usertype IS NOT NULL LIMIT 1'
      );
      console.log('Sample usertype values:', sample);
      
      // Try to update - if it fails, we'll see the constraint error
      try {
        await connection.execute(
          'UPDATE Login SET password_hash = ?, usertype = ? WHERE username = ?',
          [passwordHash, 'admin', username]
        );
        console.log('✅ Admin user updated successfully!');
      } catch (updateError) {
        console.error('Update error:', updateError.message);
        // Try without usertype first, then add it separately if needed
        await connection.execute(
          'UPDATE Login SET password_hash = ? WHERE username = ?',
          [passwordHash, username]
        );
        console.log('✅ Password updated. Note: usertype may need to be set manually.');
      }
    } else {
      // Try to create new admin - check constraint might limit usertype values
      try {
        await connection.execute(
          'INSERT INTO Login (username, password_hash, usertype) VALUES (?, ?, ?)',
          [username, passwordHash, 'admin']
        );
        console.log('✅ Admin user created successfully!');
      } catch (insertError) {
        console.error('Insert error:', insertError.message);
        // Try without usertype first
        await connection.execute(
          'INSERT INTO Login (username, password_hash) VALUES (?, ?)',
          [username, passwordHash]
        );
        console.log('✅ Login created. Attempting to set usertype...');
        // Try to update usertype separately
        try {
          await connection.execute(
            'UPDATE Login SET usertype = ? WHERE username = ?',
            ['admin', username]
          );
          console.log('✅ Usertype set to admin');
        } catch (usertypeError) {
          console.warn('⚠️  Could not set usertype. You may need to set it manually in the database.');
          console.warn('   Error:', usertypeError.message);
        }
      }
    }
    
    console.log('\n📋 Admin Credentials:');
    console.log(`   Email: ${username}`);
    console.log(`   Password: ${password}`);
    console.log('\n✅ Admin user is ready to use!');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

createAdmin()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

