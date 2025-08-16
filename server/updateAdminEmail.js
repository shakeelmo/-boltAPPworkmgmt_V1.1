const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../data/smartuniit_taskflow.db');
console.log('Updating admin email in database:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to SQLite database');
  
  // Update admin user email from 'admin' to 'admin@smartuniit.com'
  db.run(
    'UPDATE users SET email = ? WHERE email = ?',
    ['admin@smartuniit.com', 'admin'],
    function(err) {
      if (err) {
        console.error('Error updating admin email:', err.message);
      } else {
        if (this.changes > 0) {
          console.log('✅ Successfully updated admin email from admin to admin@smartuniit.com');
        } else {
          console.log('ℹ️  No admin user found to update');
        }
      }
      
      // Verify the admin user exists with new email
      db.get('SELECT * FROM users WHERE email = ?', ['admin@smartuniit.com'], (err, user) => {
        if (err) {
          console.error('Error checking admin user:', err.message);
        } else if (user) {
          console.log('✅ Admin user found with new email:');
          console.log('   Email:', user.email);
          console.log('   Role:', user.role);
          console.log('   Status:', user.status);
        } else {
          console.log('❌ Admin user not found with new email');
        }
        
        // List all users
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
      });
    }
  );
});
