const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function testLoginDebug() {
  try {
    console.log('🔍 Testing login query...');

    // Test the exact query from auth.js
    const user = await getQuery('SELECT * FROM users WHERE email = ?', ['admin@example.com']);

    console.log('User found:', user ? 'Yes' : 'No');
    if (user) {
      console.log('User object keys:', Object.keys(user));
      console.log('User ID:', user.id);
      console.log('User email:', user.email);
      console.log('User name:', user.name);
      console.log('User password exists:', !!user.password);
      console.log('User password type:', typeof user.password);
      console.log('User password length:', user.password ? user.password.length : 'N/A');
      console.log('User password value:', user.password);
      console.log('User role:', user.role);
      console.log('User status:', user.status);

      // Test password comparison
      if (user.password) {
        const isValidPassword = await bcrypt.compare('admin123', user.password);
        console.log('Password match:', isValidPassword);
      } else {
        console.log('❌ Password is undefined or null');
      }
    } else {
      console.log('❌ User not found');
    }
  } catch (error) {
    console.error('Error testing login:', error);
  } finally {
    db.close();
  }
}

testLoginDebug(); 