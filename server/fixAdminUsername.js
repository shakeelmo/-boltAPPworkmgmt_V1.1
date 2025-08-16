const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/smartuniit_taskflow.db');
console.log('Fixing admin username in database:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to SQLite database');
  
  // Update admin user email from admin@example.com to admin
  db.run(
    'UPDATE users SET email = ? WHERE email = ?',
    ['admin', 'admin@example.com'],
    function(err) {
      if (err) {
        console.error('Error updating admin email:', err.message);
      } else {
        if (this.changes > 0) {
          console.log('✅ Successfully updated admin email from admin@example.com to admin');
        } else {
          console.log('ℹ️  No admin@example.com user found to update');
        }
      }
      
      // Verify the admin user exists
      db.get('SELECT * FROM users WHERE email = ?', ['admin'], (err, user) => {
        if (err) {
          console.error('Error checking admin user:', err.message);
        } else if (user) {
          console.log('✅ Admin user found:');
          console.log('   Email:', user.email);
          console.log('   Role:', user.role);
          console.log('   Status:', user.status);
        } else {
          console.log('❌ Admin user not found, creating one...');
          
          // Create admin user with correct email
          const adminPassword = 'admin123';
          const hashedPassword = bcrypt.hashSync(adminPassword, 10);
          const adminId = `user-${Date.now()}`;
          
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
              db.close();
            }
          );
        }
        db.close();
      });
    }
  );
});
