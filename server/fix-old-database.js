const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/smartuniit_taskflow.db');
const db = new sqlite3.Database(dbPath);

function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function fixOldDatabase() {
  try {
    console.log('🔧 Fixing old database...');
    console.log('Database path:', dbPath);

    // Generate correct password hash
    const adminPassword = await bcrypt.hash('admin123', 10);
    console.log('Generated password hash:', adminPassword);

    // Update the admin user with correct password
    await runQuery(
      'UPDATE users SET password = ? WHERE email = ?',
      [adminPassword, 'admin@example.com']
    );

    console.log('✅ Updated admin user password');

    // Verify the update
    const user = await getQuery('SELECT * FROM users WHERE email = ?', ['admin@example.com']);
    if (user) {
      console.log('User password length after update:', user.password.length);
      
      // Test password comparison
      const isValidPassword = await bcrypt.compare('admin123', user.password);
      console.log('Password match test:', isValidPassword);
    }

    console.log('✅ Database fixed successfully!');
  } catch (error) {
    console.error('Error fixing database:', error);
  } finally {
    db.close();
  }
}

fixOldDatabase(); 