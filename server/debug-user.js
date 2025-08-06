const sqlite3 = require('sqlite3').verbose();
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

async function debugUser() {
  try {
    console.log('🔍 Debugging user data...');
    
    const user = await getQuery('SELECT * FROM users WHERE email = ?', ['admin@example.com']);
    
    console.log('User found:', user ? 'Yes' : 'No');
    if (user) {
      console.log('User ID:', user.id);
      console.log('User email:', user.email);
      console.log('User name:', user.name);
      console.log('User password exists:', !!user.password);
      console.log('User password length:', user.password ? user.password.length : 0);
      console.log('User status:', user.status);
      console.log('All columns:', Object.keys(user));
    }
    
    db.close();
  } catch (error) {
    console.error('Error:', error);
    db.close();
  }
}

debugUser(); 