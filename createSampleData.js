const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data/smartuniit_taskflow.db');
console.log('Creating sample data in database:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to SQLite database');
  
  db.serialize(() => {
    // Create sample customers
    console.log('Creating sample customers...');
    const customers = [
      {
        id: 'customer-123',
        name: 'Sample Customer 1',
        email: 'customer1@example.com',
        phone: '+966 50 123 4567',
        company: 'Sample Company 1',
        address: 'Riyadh, Saudi Arabia',
        status: 'active'
      },
      {
        id: 'customer-456',
        name: 'Sample Customer 2',
        email: 'customer2@example.com',
        phone: '+966 50 987 6543',
        company: 'Sample Company 2',
        address: 'Jeddah, Saudi Arabia',
        status: 'active'
      }
    ];

    customers.forEach(customer => {
      db.run(
        'INSERT OR REPLACE INTO customers (id, name, email, phone, company, address, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [customer.id, customer.name, customer.email, customer.phone, customer.company, customer.address, customer.status],
        (err) => {
          if (err) {
            console.error(`Error creating customer ${customer.name}:`, err.message);
          } else {
            console.log(`✅ Created customer: ${customer.name}`);
          }
        }
      );
    });

    // Create sample vendors
    console.log('Creating sample vendors...');
    const vendors = [
      {
        id: 'vendor-123',
        name: 'Sample Vendor 1',
        email: 'vendor1@example.com',
        phone: '+966 50 111 2222',
        company: 'Vendor Company 1',
        address: 'Riyadh, Saudi Arabia',
        status: 'active'
      },
      {
        id: 'vendor-456',
        name: 'Sample Vendor 2',
        email: 'vendor2@example.com',
        phone: '+966 50 333 4444',
        company: 'Vendor Company 2',
        address: 'Jeddah, Saudi Arabia',
        status: 'active'
      }
    ];

    vendors.forEach(vendor => {
      db.run(
        'INSERT OR REPLACE INTO vendors (id, name, email, phone, company, address, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [vendor.id, vendor.name, vendor.email, vendor.phone, vendor.company, vendor.address, vendor.status],
        (err) => {
          if (err) {
            console.error(`Error creating vendor ${vendor.name}:`, err.message);
          } else {
            console.log(`✅ Created vendor: ${vendor.name}`);
          }
        }
      );
    });

    // Wait a bit for all operations to complete
    setTimeout(() => {
      console.log('\n🎉 Sample data creation completed!');
      console.log('\n📋 Created:');
      console.log('   ✅ 2 Sample Customers');
      console.log('   ✅ 2 Sample Vendors');
      console.log('\n🔑 Customer IDs for testing:');
      console.log('   - customer-123');
      console.log('   - customer-456');
      console.log('\n🔑 Vendor IDs for testing:');
      console.log('   - vendor-123');
      console.log('   - vendor-456');
      
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