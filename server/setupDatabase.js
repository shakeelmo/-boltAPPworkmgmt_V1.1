const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../data/smartuniit_taskflow.db');
console.log('Setting up database:', dbPath);

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('Created data directory:', dataDir);
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to SQLite database');
  
  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating users table:', err.message);
      return;
    }
    console.log('✅ Users table created/verified');
    
    // Create admin user
    const adminPassword = 'admin123';
    const hashedPassword = bcrypt.hashSync(adminPassword, 10);
    const adminId = `user-${Date.now()}`;
    
    // Check if admin user exists
    db.get('SELECT id FROM users WHERE email = ?', ['admin'], (err, user) => {
      if (err) {
        console.error('Error checking for admin user:', err);
        return;
      }
      
      if (user) {
        console.log('✅ Admin user already exists');
        console.log('   Email: admin');
        console.log('   Password: admin123');
      } else {
        console.log('Creating admin user...');
        db.run(
          'INSERT INTO users (id, name, email, password, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [adminId, 'Admin User', 'admin', adminPassword, hashedPassword, 'admin', 'active'],
          (err) => {
            if (err) {
              console.error('Error creating admin user:', err.message);
            } else {
              console.log('✅ Successfully created admin user');
              console.log('   Email: admin');
              console.log('   Password: admin123');
            }
          }
        );
      }
      
      // Create other demo users
      const demoUsers = [
        {
          id: `user-${Date.now()}-1`,
          name: 'Manager User',
          email: 'manager@smartuniit.com',
          password: 'password123',
          role: 'manager'
        },
        {
          id: `user-${Date.now()}-2`,
          name: 'Technician User',
          email: 'tech@smartuniit.com',
          password: 'password123',
          role: 'technician'
        }
      ];
      
      demoUsers.forEach((userData, index) => {
        const hashedPwd = bcrypt.hashSync(userData.password, 10);
        
        db.get('SELECT id FROM users WHERE email = ?', [userData.email], (err, existingUser) => {
          if (!existingUser) {
            db.run(
              'INSERT INTO users (id, name, email, password, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [userData.id, userData.name, userData.email, userData.password, hashedPwd, userData.role, 'active'],
              (err) => {
                if (err) {
                  console.error(`Error creating ${userData.role} user:`, err.message);
                } else {
                  console.log(`✅ Created ${userData.role} user: ${userData.email}`);
                }
              }
            );
          } else {
            console.log(`ℹ️  ${userData.role} user already exists: ${userData.email}`);
          }
        });
      });
      
      // List all users
      setTimeout(() => {
        db.all('SELECT email, role, status FROM users', (err, users) => {
          if (err) {
            console.error('Error listing users:', err.message);
          } else {
            console.log('\n📋 All users in database:');
            users.forEach(user => {
              console.log(`   ${user.email} (${user.role}) - ${user.status}`);
            });
          }
          db.close();
        });
      }, 1000);
    });
  });
});
