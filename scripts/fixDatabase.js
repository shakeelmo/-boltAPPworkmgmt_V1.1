const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, '../data/workflow.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database for migration');
  }
});

// Fix database schema
const fixDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      console.log('Starting database migration...');
      
      // Add missing columns to quotations table
      const addQuotationColumns = [
        'ALTER TABLE quotations ADD COLUMN quotation_number TEXT UNIQUE',
        'ALTER TABLE quotations ADD COLUMN customer_id TEXT',
        'ALTER TABLE quotations ADD COLUMN total_amount REAL',
        'ALTER TABLE quotations ADD COLUMN subtotal REAL',
        'ALTER TABLE quotations ADD COLUMN discount_type TEXT DEFAULT "percentage"',
        'ALTER TABLE quotations ADD COLUMN discount_value REAL DEFAULT 0',
        'ALTER TABLE quotations ADD COLUMN discount_amount REAL DEFAULT 0',
        'ALTER TABLE quotations ADD COLUMN vat_rate REAL DEFAULT 15',
        'ALTER TABLE quotations ADD COLUMN vat_amount REAL DEFAULT 0'
      ];

      // Add missing columns to quotation_line_items table
      const addLineItemColumns = [
        'ALTER TABLE quotation_line_items ADD COLUMN unit TEXT DEFAULT "piece"',
        'ALTER TABLE quotation_line_items ADD COLUMN custom_unit TEXT',
        'ALTER TABLE quotation_line_items ADD COLUMN total_price REAL',
        'ALTER TABLE quotation_line_items ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP'
      ];

      // Execute all ALTER TABLE statements
      const allStatements = [...addQuotationColumns, ...addLineItemColumns];
      
      let completed = 0;
      const total = allStatements.length;

      allStatements.forEach((sql, index) => {
        db.run(sql, (err) => {
          if (err) {
            // Ignore "duplicate column" errors
            if (err.message.includes('duplicate column name')) {
              console.log(`Column already exists, skipping: ${sql}`);
            } else {
              console.error(`Error executing: ${sql}`, err.message);
            }
          } else {
            console.log(`Successfully executed: ${sql}`);
          }
          
          completed++;
          if (completed === total) {
            console.log('Database migration completed!');
            resolve();
          }
        });
      });
    });
  });
};

// Update existing records to have proper values
const updateExistingRecords = () => {
  return new Promise((resolve, reject) => {
    console.log('Updating existing records...');
    
    // Update quotations to have proper values
    db.run(`
      UPDATE quotations 
      SET total_amount = COALESCE(total_amount, amount),
          subtotal = COALESCE(subtotal, amount),
          discount_type = COALESCE(discount_type, 'percentage'),
          discount_value = COALESCE(discount_value, 0),
          discount_amount = COALESCE(discount_amount, 0),
          vat_rate = COALESCE(vat_rate, 15),
          vat_amount = COALESCE(vat_amount, 0),
          currency = COALESCE(currency, 'SAR')
      WHERE total_amount IS NULL OR subtotal IS NULL
    `, (err) => {
      if (err) {
        console.error('Error updating quotations:', err.message);
      } else {
        console.log('Updated existing quotations');
      }
      
      // Update quotation_line_items to have proper values
      db.run(`
        UPDATE quotation_line_items 
        SET total_price = COALESCE(total_price, total),
            unit = COALESCE(unit, 'piece')
        WHERE total_price IS NULL OR unit IS NULL
      `, (err) => {
        if (err) {
          console.error('Error updating line items:', err.message);
        } else {
          console.log('Updated existing line items');
        }
        resolve();
      });
    });
  });
};

// Run migration
const runMigration = async () => {
  try {
    await fixDatabase();
    await updateExistingRecords();
    console.log('Database migration completed successfully!');
    db.close();
  } catch (error) {
    console.error('Error during migration:', error);
    db.close();
    process.exit(1);
  }
};

// Run migration
runMigration(); 