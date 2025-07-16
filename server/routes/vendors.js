const express = require('express');
const { run, get, all } = require('../db');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const ExcelJS = require('exceljs');

const router = express.Router();

// Get all vendors
router.get('/', authenticateToken, requirePermission('vendors', 'read'), async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (search) {
      whereClause += ' AND (name LIKE ? OR email LIKE ? OR contact_person LIKE ? OR offering LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }
    
    // Get vendors with pagination
    const vendors = await all(
      `SELECT v.*, u.name as created_by_name 
       FROM vendors v 
       LEFT JOIN users u ON v.created_by = u.id 
       ${whereClause} 
       ORDER BY v.created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    
    // Get total count
    const countResult = await get(
      `SELECT COUNT(*) as total FROM vendors ${whereClause}`,
      params
    );
    
    res.json({
      vendors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult.total,
        pages: Math.ceil(countResult.total / limit)
      }
    });
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single vendor
router.get('/:id', authenticateToken, requirePermission('vendors', 'read'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const vendor = await get(
      `SELECT v.*, u.name as created_by_name 
       FROM vendors v 
       LEFT JOIN users u ON v.created_by = u.id 
       WHERE v.id = ?`,
      [id]
    );
    
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    res.json({ vendor });
  } catch (error) {
    console.error('Get vendor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new vendor
router.post('/', authenticateToken, requirePermission('vendors', 'create'), async (req, res) => {
  try {
    const { name, email, phone, address, contact_person, website, notes, offering } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    // Check if vendor with email already exists
    const existingVendor = await get('SELECT id FROM vendors WHERE email = ?', [email]);
    if (existingVendor) {
      return res.status(400).json({ error: 'A vendor with this email already exists' });
    }
    
    const vendorId = Date.now().toString();
    
    await run(
      `INSERT INTO vendors (id, name, email, phone, address, contact_person, website, notes, offering, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [vendorId, name, email, phone, address, contact_person, website, notes, offering, req.user.id]
    );
    
    const newVendor = await get('SELECT * FROM vendors WHERE id = ?', [vendorId]);
    
    res.status(201).json({
      message: 'Vendor created successfully',
      vendor: newVendor
    });
  } catch (error) {
    console.error('Create vendor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update vendor
router.put('/:id', authenticateToken, requirePermission('vendors', 'update'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, contact_person, website, notes, status, offering } = req.body;
    
    // Check if vendor exists
    const existingVendor = await get('SELECT id FROM vendors WHERE id = ?', [id]);
    if (!existingVendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    // Check if email is being changed and if it conflicts
    if (email) {
      const emailConflict = await get(
        'SELECT id FROM vendors WHERE email = ? AND id != ?',
        [email, id]
      );
      if (emailConflict) {
        return res.status(400).json({ error: 'A vendor with this email already exists' });
      }
    }
    
    await run(
      `UPDATE vendors 
       SET name = ?, email = ?, phone = ?, address = ?, contact_person = ?, website = ?, notes = ?, offering = ?, status = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [name, email, phone, address, contact_person, website, notes, offering, status, id]
    );
    
    const updatedVendor = await get('SELECT * FROM vendors WHERE id = ?', [id]);
    
    res.json({
      message: 'Vendor updated successfully',
      vendor: updatedVendor
    });
  } catch (error) {
    console.error('Update vendor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete vendor
router.delete('/:id', authenticateToken, requirePermission('vendors', 'delete'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if vendor exists
    const existingVendor = await get('SELECT id FROM vendors WHERE id = ?', [id]);
    if (!existingVendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    // Check if vendor has associated proposals
    const associatedProposals = await get(
      'SELECT id FROM proposals WHERE vendor_id = ? LIMIT 1',
      [id]
    );
    
    if (associatedProposals) {
      return res.status(400).json({ 
        error: 'Cannot delete vendor with associated proposals. Please reassign or delete proposals first.' 
      });
    }
    
    await run('DELETE FROM vendors WHERE id = ?', [id]);
    
    res.json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    console.error('Delete vendor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get vendor statistics
router.get('/stats/overview', authenticateToken, requirePermission('vendors', 'read'), async (req, res) => {
  try {
    const totalVendors = await get('SELECT COUNT(*) as total FROM vendors');
    const activeVendors = await get('SELECT COUNT(*) as active FROM vendors WHERE status = "active"');
    const inactiveVendors = await get('SELECT COUNT(*) as inactive FROM vendors WHERE status = "inactive"');
    
    res.json({
      total: totalVendors.total,
      active: activeVendors.active,
      inactive: inactiveVendors.inactive
    });
  } catch (error) {
    console.error('Get vendor stats error:', error);
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

    // Get all vendors
    const vendors = await all(`
      SELECT 
        v.id,
        v.name,
        v.email,
        v.phone,
        v.address,
        v.contact_person,
        v.website,
        v.offering,
        v.notes,
        v.status,
        v.created_at,
        v.updated_at,
        u.name as created_by_name
      FROM vendors v
      LEFT JOIN users u ON v.created_by = u.id
      ORDER BY v.created_at DESC
    `);

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Vendors');

    // Define columns
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 15 },
      { header: 'Company Name', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Address', key: 'address', width: 40 },
      { header: 'Contact Person', key: 'contact_person', width: 20 },
      { header: 'Website', key: 'website', width: 25 },
      { header: 'Offering/Services', key: 'offering', width: 30 },
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
    vendors.forEach(vendor => {
      worksheet.addRow({
        id: vendor.id,
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone || '',
        address: vendor.address || '',
        contact_person: vendor.contact_person || '',
        website: vendor.website || '',
        offering: vendor.offering || '',
        notes: vendor.notes || '',
        status: vendor.status,
        created_at: new Date(vendor.created_at).toLocaleDateString(),
        updated_at: new Date(vendor.updated_at).toLocaleDateString(),
        created_by_name: vendor.created_by_name || 'Unknown'
      });
    });

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.alignment = { vertical: 'middle', horizontal: 'left' };
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=vendors-export-${new Date().toISOString().split('T')[0]}.xlsx`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Export vendors error:', error);
    res.status(500).json({ error: 'Failed to export vendors' });
  }
});

module.exports = router; 