const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../data/smartuniit_taskflow.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Fixing Database Schema Issues...');

const fixDatabase = async () => {
  try {
    // Drop and recreate quotations table with correct schema (no proposal references)
    await runQuery('DROP TABLE IF EXISTS quotation_line_items');
    await runQuery('DROP TABLE IF EXISTS quotations');
    
    // Create quotations table with all required columns (no proposal_id)
    await runQuery(`
      CREATE TABLE quotations (
        id TEXT PRIMARY KEY,
        quote_number TEXT UNIQUE,
        customer_id TEXT,
        total_amount REAL DEFAULT 0,
        currency TEXT DEFAULT 'SAR',
        status TEXT DEFAULT 'draft',
        valid_until TEXT,
        notes TEXT,
        created_by TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        subtotal REAL DEFAULT 0,
        discount_type TEXT DEFAULT 'percentage',
        discount_value REAL DEFAULT 0,
        discount_amount REAL DEFAULT 0,
        vat_rate REAL DEFAULT 15,
        vat_amount REAL DEFAULT 0,
        terms TEXT,
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);

    // Create quotation_line_items table
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

    // Ensure users table has required columns
    await runQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        status TEXT DEFAULT 'active',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ensure customers table exists
    await runQuery(`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default admin user if not exists
    const bcrypt = require('bcryptjs');
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    await runQuery(`
      INSERT OR IGNORE INTO users (id, name, email, password_hash, role, status)
      VALUES ('admin-1', 'Admin User', 'admin@example.com', ?, 'admin', 'active')
    `, [adminPassword]);

    // Insert sample customer if not exists
    await runQuery(`
      INSERT OR IGNORE INTO customers (id, name, email, phone, address)
      VALUES ('customer-123', 'Sample Customer', 'customer@example.com', '+966 50 123 4567', 'Riyadh, Saudi Arabia')
    `);

    console.log('✅ Database schema fixed successfully!');
    
    // Verify tables
    const tables = await getQuery("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('📋 Available tables:', tables.map(t => t.name));
    
  } catch (error) {
    console.error('❌ Database fix failed:', error);
  } finally {
    db.close();
  }
};

const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const getQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

fixDatabase(); 