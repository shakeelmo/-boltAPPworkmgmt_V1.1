const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();

async function testLogin() {
  const db = new sqlite3.Database('database.sqlite');
  
  try {
    // Get user from database
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', ['admin@example.com'], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
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
        console.log('❌ Password comparison failed');
        
        // Try to create a new hash and test
        const newHash = await bcrypt.hash('admin123', 10);
        console.log('New hash:', newHash);
        
        const testMatch = await bcrypt.compare('admin123', newHash);
        console.log('Test with new hash:', testMatch);
        
        if (testMatch) {
          // Update the database
          await new Promise((resolve, reject) => {
            db.run('UPDATE users SET password = ? WHERE email = ?', [newHash, 'admin@example.com'], (err) => {
              if (err) reject(err);
              else resolve();
            });
          });
          console.log('✅ Database updated with new hash');
        }
      }
    } else {
      console.log('❌ User not found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    db.close();
  }
}

testLogin(); 