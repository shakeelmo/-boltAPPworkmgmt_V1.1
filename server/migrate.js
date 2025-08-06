const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'smartuniit_taskflow.db');
console.log('Running migrations on database:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to SQLite database for migration');
  db.run('PRAGMA foreign_keys = OFF');
  
  db.serialize(() => {
    // Migration 1: Add missing columns to quotations table
    console.log('Migration 1: Adding missing columns to quotations table...');
    
    // Check if total_amount column exists
    db.get("PRAGMA table_info(quotations)", (err, rows) => {
      if (err) {
        console.error('Error checking table schema:', err);
        return;
      }
      
      db.all("PRAGMA table_info(quotations)", (err, columns) => {
        if (err) {
          console.error('Error getting table info:', err);
          return;
        }
        
        const columnNames = columns.map(col => col.name);
        
        // Add missing columns
        const migrations = [
          { column: 'total_amount', sql: 'ALTER TABLE quotations ADD COLUMN total_amount REAL DEFAULT 0' },
          { column: 'proposal_id', sql: 'ALTER TABLE quotations ADD COLUMN proposal_id TEXT' },
          { column: 'vat_rate', sql: 'ALTER TABLE quotations ADD COLUMN vat_rate REAL DEFAULT 15' },
          { column: 'vat_amount', sql: 'ALTER TABLE quotations ADD COLUMN vat_amount REAL DEFAULT 0' },
          { column: 'subtotal', sql: 'ALTER TABLE quotations ADD COLUMN subtotal REAL DEFAULT 0' },
          { column: 'terms', sql: 'ALTER TABLE quotations ADD COLUMN terms TEXT' },
          { column: 'valid_until', sql: 'ALTER TABLE quotations ADD COLUMN valid_until TEXT' }
        ];
        
        migrations.forEach(migration => {
          if (!columnNames.includes(migration.column)) {
            console.log(`Adding column: ${migration.column}`);
            db.run(migration.sql, (err) => {
              if (err) {
                console.error(`Error adding column ${migration.column}:`, err.message);
              } else {
                console.log(`Successfully added column: ${migration.column}`);
              }
            });
          } else {
            console.log(`Column ${migration.column} already exists`);
          }
        });
      });
    });
    
    // Migration 2: Add missing columns to users table
    console.log('Migration 2: Adding missing columns to users table...');
    db.all("PRAGMA table_info(users)", (err, columns) => {
      if (err) {
        console.error('Error getting users table info:', err);
        return;
      }
      
      const columnNames = columns.map(col => col.name);
      
      if (!columnNames.includes('password_hash')) {
        console.log('Adding password_hash column to users table...');
        db.run('ALTER TABLE users ADD COLUMN password_hash TEXT', (err) => {
          if (err) {
            console.error('Error adding password_hash column:', err.message);
          } else {
            console.log('Successfully added password_hash column');
          }
        });
      }
      
      if (!columnNames.includes('status')) {
        console.log('Adding status column to users table...');
        db.run('ALTER TABLE users ADD COLUMN status TEXT DEFAULT "active"', (err) => {
          if (err) {
            console.error('Error adding status column:', err.message);
          } else {
            console.log('Successfully added status column');
          }
        });
      }
    });
    
    // Migration 3: Add missing columns to proposals table
    console.log('Migration 3: Adding missing columns to proposals table...');
    db.all("PRAGMA table_info(proposals)", (err, columns) => {
      if (err) {
        console.error('Error getting proposals table info:', err);
        return;
      }
      
      const columnNames = columns.map(col => col.name);
      
      const proposalMigrations = [
        { column: 'title', sql: 'ALTER TABLE proposals ADD COLUMN title TEXT' },
        { column: 'vendor_id', sql: 'ALTER TABLE proposals ADD COLUMN vendor_id TEXT' },
        { column: 'manager_id', sql: 'ALTER TABLE proposals ADD COLUMN manager_id TEXT' }
      ];
      
      proposalMigrations.forEach(migration => {
        if (!columnNames.includes(migration.column)) {
          console.log(`Adding column: ${migration.column}`);
          db.run(migration.sql, (err) => {
            if (err) {
              console.error(`Error adding column ${migration.column}:`, err.message);
            } else {
              console.log(`Successfully added column: ${migration.column}`);
            }
          });
        } else {
          console.log(`Column ${migration.column} already exists`);
        }
      });
    });
    
    // Migration 4: Add missing columns to projects table
    console.log('Migration 4: Adding missing columns to projects table...');
    db.all("PRAGMA table_info(projects)", (err, columns) => {
      if (err) {
        console.error('Error getting projects table info:', err);
        return;
      }
      
      const columnNames = columns.map(col => col.name);
      
      const projectMigrations = [
        { column: 'title', sql: 'ALTER TABLE projects ADD COLUMN title TEXT' },
        { column: 'vendor_id', sql: 'ALTER TABLE projects ADD COLUMN vendor_id TEXT' },
        { column: 'manager_id', sql: 'ALTER TABLE projects ADD COLUMN manager_id TEXT' }
      ];
      
      projectMigrations.forEach(migration => {
        if (!columnNames.includes(migration.column)) {
          console.log(`Adding column: ${migration.column}`);
          db.run(migration.sql, (err) => {
            if (err) {
              console.error(`Error adding column ${migration.column}:`, err.message);
            } else {
              console.log(`Successfully added column: ${migration.column}`);
            }
          });
        } else {
          console.log(`Column ${migration.column} already exists`);
        }
      });
    });
    
    // Migration 5: Create default admin user if not exists
    console.log('Migration 5: Creating default admin user...');
    const bcrypt = require('bcryptjs');
    const adminPassword = 'admin123';
    const hashedPassword = bcrypt.hashSync(adminPassword, 10);
    
    db.get('SELECT id FROM users WHERE email = ?', ['admin@example.com'], (err, user) => {
      if (err) {
        console.error('Error checking for admin user:', err);
        return;
      }
      
      if (!user) {
        console.log('Creating default admin user...');
        const adminId = `user-${Date.now()}`;
        db.run(
          'INSERT INTO users (id, name, email, password, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [adminId, 'Admin User', 'admin@example.com', adminPassword, hashedPassword, 'admin', 'active'],
          (err) => {
            if (err) {
              console.error('Error creating admin user:', err.message);
            } else {
              console.log('Successfully created default admin user');
              console.log('Email: admin@example.com');
              console.log('Password: admin123');
            }
          }
        );
      } else {
        console.log('Admin user already exists');
      }
    });
    
    // Migration 6: Create some sample data
    console.log('Migration 6: Creating sample data...');
    
    // Create sample customer
    db.get('SELECT id FROM customers WHERE email = ?', ['customer@example.com'], (err, customer) => {
      if (err) {
        console.error('Error checking for sample customer:', err);
        return;
      }
      
      if (!customer) {
        console.log('Creating sample customer...');
        const customerId = `customer-${Date.now()}`;
        db.run(
          'INSERT INTO customers (id, name, email, phone, company, address, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [customerId, 'Sample Customer', 'customer@example.com', '+966 50 123 4567', 'Sample Company', 'Riyadh, Saudi Arabia', 'active'],
          (err) => {
            if (err) {
              console.error('Error creating sample customer:', err.message);
            } else {
              console.log('Successfully created sample customer');
            }
          }
        );
      } else {
        console.log('Sample customer already exists');
      }
    });
    
    // Wait a bit for migrations to complete, then close
    setTimeout(() => {
      console.log('All migrations completed!');
      db.run('PRAGMA foreign_keys = ON');
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
        } else {
          console.log('Database connection closed');
        }
      });
    }, 2000);
  });
}); 