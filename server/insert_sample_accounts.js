const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function insertSampleAccounts() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'typing_speed'
  });

  try {
    console.log('Connecting to database...');
    
    // Hash passwords
    const superadminPassword = await bcrypt.hash('superadmin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    // Check if accounts already exist
    const [existingSuperadmin] = await connection.query(
      'SELECT * FROM users WHERE username = ?',
      ['superadmin']
    );

    const [existingUser] = await connection.query(
      'SELECT * FROM users WHERE username = ?',
      ['user']
    );

    // Insert superadmin account
    if (existingSuperadmin.length === 0) {
      await connection.query(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        ['superadmin', 'superadmin@matthewwrite.com', superadminPassword, 'superadmin']
      );
      console.log('✓ Superadmin account created');
      console.log('  Username: superadmin');
      console.log('  Password: superadmin123');
    } else {
      console.log('⚠ Superadmin account already exists');
    }

    // Insert user account
    if (existingUser.length === 0) {
      await connection.query(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        ['user', 'user@matthewwrite.com', userPassword, 'user']
      );
      console.log('✓ User account created');
      console.log('  Username: user');
      console.log('  Password: user123');
    } else {
      console.log('⚠ User account already exists');
    }

    console.log('\n✅ Sample accounts setup complete!');
    console.log('\nLogin credentials:');
    console.log('Superadmin:');
    console.log('  Username: superadmin');
    console.log('  Password: superadmin123');
    console.log('\nUser:');
    console.log('  Username: user');
    console.log('  Password: user123');

  } catch (error) {
    console.error('Error inserting sample accounts:', error);
  } finally {
    await connection.end();
  }
}

insertSampleAccounts();

