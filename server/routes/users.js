const express = require('express');
const { run, get, all } = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, requireRole(['admin', 'superadmin']), async (req, res) => {
  try {
    const { search, role, status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (search) {
      whereClause += ' AND (name LIKE ? OR email LIKE ? OR department LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (role) {
      whereClause += ' AND role = ?';
      params.push(role);
    }
    
    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }
    
    // Get users with pagination
    const users = await all(
      `SELECT id, email, name, role, avatar_url, phone, department, status, created_at, updated_at 
       FROM users 
       ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    
    // Get total count
    const countResult = await get(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      params
    );
    
    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult.total,
        pages: Math.ceil(countResult.total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single user
router.get('/:id', authenticateToken, requireRole(['admin', 'superadmin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await get(
      'SELECT id, email, name, role, avatar_url, phone, department, status, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user role/status (admin only)
router.put('/:id', authenticateToken, requireRole(['admin', 'superadmin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { role, status, department } = req.body;
    
    // Check if user exists
    const existingUser = await get('SELECT id FROM users WHERE id = ?', [id]);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await run(
      'UPDATE users SET role = ?, status = ?, department = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [role, status, department, id]
    );
    
    const updatedUser = await get(
      'SELECT id, email, name, role, avatar_url, phone, department, status, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    
    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user statistics
router.get('/stats/overview', authenticateToken, requireRole(['admin', 'superadmin']), async (req, res) => {
  try {
    const totalUsers = await get('SELECT COUNT(*) as total FROM users');
    const activeUsers = await get('SELECT COUNT(*) as active FROM users WHERE status = "active"');
    const inactiveUsers = await get('SELECT COUNT(*) as inactive FROM users WHERE status = "inactive"');
    
    // Get users by role
    const roleStats = await all(
      'SELECT role, COUNT(*) as count FROM users GROUP BY role'
    );
    
    res.json({
      total: totalUsers.total,
      active: activeUsers.active,
      inactive: inactiveUsers.inactive,
      byRole: roleStats
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 