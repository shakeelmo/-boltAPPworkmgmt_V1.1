const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../data/smartuniit_taskflow.db');
const db = new sqlite3.Database(dbPath);

function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function checkOldDb() {
  try {
    console.log('🔍 Checking old database...');
    console.log('Database path:', dbPath);

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
      console.log('User role:', user.role);
      console.log('User status:', user.status);
    } else {
      console.log('❌ User not found in old database');
    }
  } catch (error) {
    console.error('Error checking old database:', error);
  } finally {
    db.close();
  }
}

checkOldDb(); 