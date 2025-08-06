const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../data/smartuniit_taskflow.db');
const db = new sqlite3.Database(dbPath);

console.log('Adding missing discount columns to quotations table...');

const addDiscountColumns = () => {
  return new Promise((resolve, reject) => {
    // Add discount-related columns
    const alterQueries = [
      'ALTER TABLE quotations ADD COLUMN discount_type TEXT DEFAULT "percentage"',
      'ALTER TABLE quotations ADD COLUMN discount_value REAL DEFAULT 0',
      'ALTER TABLE quotations ADD COLUMN discount_amount REAL DEFAULT 0'
    ];

    let completed = 0;
    const total = alterQueries.length;

    alterQueries.forEach((query, index) => {
      db.run(query, (err) => {
        if (err) {
          // Column might already exist, that's okay
          console.log(`Column might already exist for query ${index + 1}:`, err.message);
        } else {
          console.log(`Successfully added column for query ${index + 1}`);
        }
        
        completed++;
        if (completed === total) {
          resolve();
        }
      });
    });
  });
};

const verifyColumns = () => {
  return new Promise((resolve, reject) => {
    db.all("PRAGMA table_info(quotations)", (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      console.log('\nCurrent quotations table columns:');
      rows.forEach(row => {
        console.log(`- ${row.name} (${row.type})`);
      });
      
      resolve();
    });
  });
};

const main = async () => {
  try {
    await addDiscountColumns();
    await verifyColumns();
    console.log('\n✅ Database schema updated successfully!');
  } catch (error) {
    console.error('❌ Error updating database schema:', error);
  } finally {
    db.close();
  }
};

main(); 