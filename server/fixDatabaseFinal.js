const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
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

async function fixDatabase() {
  try {
    console.log('🔧 Starting comprehensive database fix...');
    
    // Drop existing tables
    console.log('🗑️ Dropping existing tables...');
    await runQuery('DROP TABLE IF EXISTS quotation_line_items');
    await runQuery('DROP TABLE IF EXISTS quotations');
    await runQuery('DROP TABLE IF EXISTS users');
    await runQuery('DROP TABLE IF EXISTS customers');
    
    // Create users table
    console.log('👥 Creating users table...');
    await runQuery(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create customers table
    console.log('👤 Creating customers table...');
    await runQuery(`
      CREATE TABLE customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        company TEXT,
        address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create quotations table with ALL required columns
    console.log('📄 Creating quotations table...');
    await runQuery(`
      CREATE TABLE quotations (
        id TEXT PRIMARY KEY,
        quotation_number TEXT UNIQUE NOT NULL,
        total_amount REAL NOT NULL DEFAULT 0,
        currency TEXT DEFAULT 'SAR',
        valid_until DATE,
        terms TEXT,
        created_by TEXT NOT NULL,
        customer_id TEXT,
        subtotal REAL DEFAULT 0,
        discount_type TEXT DEFAULT 'percentage',
        discount_value REAL DEFAULT 0,
        discount_amount REAL DEFAULT 0,
        vat_rate REAL DEFAULT 15,
        vat_amount REAL DEFAULT 0,
        status TEXT DEFAULT 'draft',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users (id),
        FOREIGN KEY (customer_id) REFERENCES customers (id)
      )
    `);
    
    // Create quotation_line_items table
    console.log('📋 Creating quotation_line_items table...');
    await runQuery(`
      CREATE TABLE quotation_line_items (
        id TEXT PRIMARY KEY,
        quotation_id TEXT NOT NULL,
        description TEXT NOT NULL,
        quantity REAL NOT NULL DEFAULT 1,
        unit TEXT DEFAULT 'piece',
        custom_unit TEXT,
        unit_price REAL NOT NULL DEFAULT 0,
        total_price REAL NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (quotation_id) REFERENCES quotations (id) ON DELETE CASCADE
      )
    `);
    
    // Create admin user with correct password
    console.log('👨‍💼 Creating admin user...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    await runQuery(`
      INSERT INTO users (id, name, email, password, role, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `, ['admin-1', 'Admin User', 'admin@example.com', adminPassword, 'admin', 'active']);
    
    // Create sample customer
    console.log('👤 Creating sample customer...');
    await runQuery(`
      INSERT INTO customers (id, name, email, phone, company)
      VALUES (?, ?, ?, ?, ?)
    `, ['customer-123', 'Sample Customer', 'customer@example.com', '+966501234567', 'Sample Company']);
    
    console.log('✅ Database fix completed successfully!');
    
    // Verification
    const userCount = await getQuery('SELECT COUNT(*) as count FROM users');
    const customerCount = await getQuery('SELECT COUNT(*) as count FROM customers');
    
    console.log('📊 Verification:');
    console.log(`Users: ${userCount.count}`);
    console.log(`Customers: ${customerCount.count}`);
    
  } catch (error) {
    console.error('❌ Database fix failed:', error);
    throw error;
  } finally {
    db.close();
  }
}

fixDatabase(); 