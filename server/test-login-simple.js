const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

async function testLogin() {
  try {
    console.log('🔍 Testing login functionality...');
    
    // Get user from database
    const user = await getQuery('SELECT * FROM users WHERE email = ?', ['admin@example.com']);
    
    console.log('User found:', user ? 'Yes' : 'No');
    if (user) {
      console.log('User email:', user.email);
      console.log('User password hash:', user.password);
      console.log('User status:', user.status);
      
      // Test password comparison
      const isValidPassword = await bcrypt.compare('admin123', user.password);
      console.log('Password match:', isValidPassword);
      
      if (isValidPassword) {
        console.log('✅ Login should work!');
      } else {
        console.log('❌ Login will fail');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    db.close();
  }
  
  function getQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
}

testLogin(); 