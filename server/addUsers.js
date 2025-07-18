const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

// Database path
const dbPath = path.join(__dirname, '../data/smartuniit_taskflow.db');
console.log('Adding users to database at:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to SQLite database');
  
  // Hash the password
  const password = 'P@ssword123';
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  // Users to add
  const users = [
    {
      id: 'user1',
      name: 'Shakeel Ali',
      email: 'shakeel.ali@smartuniit.com',
      role: 'superadmin'
    },
    {
      id: 'user2', 
      name: 'M Jaweed',
      email: 'm.jaweed@smartuniit.om',
      role: 'superadmin'
    },
    {
      id: 'user3',
      name: 'Basith',
      email: 'basith@smartuniit.com',
      role: 'superadmin'
    },
    {
      id: 'user4',
      name: 'M Omer',
      email: 'm.omer@smartuniit.com',
      role: 'superadmin'
    },
    {
      id: 'user5',
      name: 'M Rehan',
      email: 'm.rehan@smartuniit.com',
      role: 'superadmin'
    }
  ];
  
  // Add each user
  users.forEach((user, index) => {
    db.run(
      `INSERT OR IGNORE INTO users (id, name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [user.id, user.name, user.email, hashedPassword, user.role, 'active'],
      function(err) {
        if (err) {
          console.error(`Error adding user ${user.email}:`, err.message);
        } else {
          if (this.changes > 0) {
            console.log(`✅ Added user: ${user.name} (${user.email})`);
          } else {
            console.log(`⚠️  User already exists: ${user.name} (${user.email})`);
          }
        }
        
        // Close database after last user
        if (index === users.length - 1) {
          db.close((err) => {
            if (err) {
              console.error('Error closing database:', err.message);
            } else {
              console.log('\n🎉 All users added successfully!');
              console.log('\n📋 Login Credentials:');
              users.forEach(user => {
                console.log(`- ${user.email} (password: P@ssword123)`);
              });
            }
          });
        }
      }
    );
  });
}); 