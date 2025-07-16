const express = require('express');
const { run, get, all } = require('../db');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const ExcelJS = require('exceljs');

const router = express.Router();

// Get all customers
router.get('/', authenticateToken, requirePermission('customers', 'read'), async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (search) {
      whereClause += ' AND (name LIKE ? OR email LIKE ? OR company LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }
    
    // Get customers with pagination
    const customers = await all(
      `SELECT c.*, u.name as created_by_name 
       FROM customers c 
       LEFT JOIN users u ON c.created_by = u.id 
       ${whereClause} 
       ORDER BY c.created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    
    // Get total count
    const countResult = await get(
      `SELECT COUNT(*) as total FROM customers ${whereClause}`,
      params
    );
    
    res.json({
      customers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult.total,
        pages: Math.ceil(countResult.total / limit)
      }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single customer
router.get('/:id', authenticateToken, requirePermission('customers', 'read'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const customer = await get(
      `SELECT c.*, u.name as created_by_name 
       FROM customers c 
       LEFT JOIN users u ON c.created_by = u.id 
       WHERE c.id = ?`,
      [id]
    );
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json({ customer });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new customer
router.post('/', authenticateToken, requirePermission('customers', 'create'), async (req, res) => {
  try {
    const { name, email, phone, address, company, notes } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    // Check if customer with email already exists
    const existingCustomer = await get('SELECT id FROM customers WHERE email = ?', [email]);
    if (existingCustomer) {
      return res.status(400).json({ error: 'A customer with this email already exists' });
    }
    
    const customerId = Date.now().toString();
    
    await run(
      `INSERT INTO customers (id, name, email, phone, address, company, notes, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [customerId, name, email, phone, address, company, notes, req.user.id]
    );
    
    const newCustomer = await get('SELECT * FROM customers WHERE id = ?', [customerId]);
    
    res.status(201).json({
      message: 'Customer created successfully',
      customer: newCustomer
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update customer
router.put('/:id', authenticateToken, requirePermission('customers', 'update'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, company, notes, status } = req.body;
    
    // Check if customer exists
    const existingCustomer = await get('SELECT id FROM customers WHERE id = ?', [id]);
    if (!existingCustomer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Check if email is being changed and if it conflicts
    if (email) {
      const emailConflict = await get(
        'SELECT id FROM customers WHERE email = ? AND id != ?',
        [email, id]
      );
      if (emailConflict) {
        return res.status(400).json({ error: 'A customer with this email already exists' });
      }
    }
    
    await run(
      `UPDATE customers 
       SET name = ?, email = ?, phone = ?, address = ?, company = ?, notes = ?, status = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [name, email, phone, address, company, notes, status, id]
    );
    
    const updatedCustomer = await get('SELECT * FROM customers WHERE id = ?', [id]);
    
    res.json({
      message: 'Customer updated successfully',
      customer: updatedCustomer
    });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete customer
router.delete('/:id', authenticateToken, requirePermission('customers', 'delete'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if customer exists
    const existingCustomer = await get('SELECT id FROM customers WHERE id = ?', [id]);
    if (!existingCustomer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Check if customer has associated projects
    const associatedProjects = await get(
      'SELECT id FROM projects WHERE customer_id = ? LIMIT 1',
      [id]
    );
    
    if (associatedProjects) {
      return res.status(400).json({ 
        error: 'Cannot delete customer with associated projects. Please reassign or delete projects first.' 
      });
    }
    
    await run('DELETE FROM customers WHERE id = ?', [id]);
    
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get customer statistics
router.get('/stats/overview', authenticateToken, requirePermission('customers', 'read'), async (req, res) => {
  try {
    const totalCustomers = await get('SELECT COUNT(*) as total FROM customers');
    const activeCustomers = await get('SELECT COUNT(*) as active FROM customers WHERE status = "active"');
    const inactiveCustomers = await get('SELECT COUNT(*) as inactive FROM customers WHERE status = "inactive"');
    
    res.json({
      total: totalCustomers.total,
      active: activeCustomers.active,
      inactive: inactiveCustomers.inactive
    });
  } catch (error) {
    console.error('Get customer stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Excel export endpoint - superadmin only
router.get('/export/excel', authenticateToken, async (req, res) => {
  try {
    // Check if user is superadmin
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Access denied. Superadmin only.' });
    }

    // Get all customers
    const customers = await all(`
      SELECT 
        c.id,
        c.name,
        c.email,
        c.phone,
        c.address,
        c.company,
        c.notes,
        c.status,
        c.created_at,
        c.updated_at,
        u.name as created_by_name
      FROM customers c
      LEFT JOIN users u ON c.created_by = u.id
      ORDER BY c.created_at DESC
    `);

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Customers');

    // Define columns
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 15 },
      { header: 'Customer Name', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Address', key: 'address', width: 40 },
      { header: 'Company', key: 'company', width: 25 },
      { header: 'Notes', key: 'notes', width: 40 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'Created Date', key: 'created_at', width: 15 },
      { header: 'Updated Date', key: 'updated_at', width: 15 },
      { header: 'Created By', key: 'created_by_name', width: 20 }
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Add data rows
    customers.forEach(customer => {
      worksheet.addRow({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone || '',
        address: customer.address || '',
        company: customer.company || '',
        notes: customer.notes || '',
        status: customer.status,
        created_at: new Date(customer.created_at).toLocaleDateString(),
        updated_at: new Date(customer.updated_at).toLocaleDateString(),
        created_by_name: customer.created_by_name || 'Unknown'
      });
    });

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.alignment = { vertical: 'middle', horizontal: 'left' };
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=customers-export-${new Date().toISOString().split('T')[0]}.xlsx`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Export customers error:', error);
    res.status(500).json({ error: 'Failed to export customers' });
  }
});

module.exports = router; 