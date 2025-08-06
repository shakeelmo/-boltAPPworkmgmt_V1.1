const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/smartuniit_taskflow.db');
console.log('Creating admin user in database:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to SQLite database');
  
  // Create admin user
  const adminPassword = 'admin123';
  const hashedPassword = bcrypt.hashSync(adminPassword, 10);
  const adminId = `user-${Date.now()}`;
  
  // Check if admin user already exists
  db.get('SELECT id FROM users WHERE email = ?', ['admin@example.com'], (err, user) => {
    if (err) {
      console.error('Error checking for admin user:', err);
      return;
    }
    
    if (user) {
      console.log('Admin user already exists, updating password...');
      db.run(
        'UPDATE users SET password_hash = ?, password = ?, status = ? WHERE email = ?',
        [hashedPassword, adminPassword, 'active', 'admin@example.com'],
        (err) => {
          if (err) {
            console.error('Error updating admin user:', err.message);
          } else {
            console.log('Successfully updated admin user');
            console.log('Email: admin@example.com');
            console.log('Password: admin123');
          }
          db.close();
        }
      );
    } else {
      console.log('Creating new admin user...');
      db.run(
        'INSERT INTO users (id, name, email, password, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [adminId, 'Admin User', 'admin@example.com', adminPassword, hashedPassword, 'admin', 'active'],
        (err) => {
          if (err) {
            console.error('Error creating admin user:', err.message);
          } else {
            console.log('Successfully created admin user');
            console.log('Email: admin@example.com');
            console.log('Password: admin123');
          }
          db.close();
        }
      );
    }
  });
}); 