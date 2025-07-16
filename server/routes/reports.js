const express = require('express');
const { get, all } = require('../db');
const { authenticateToken, requirePermission } = require('../middleware/auth');

const router = express.Router();

// Get dashboard statistics
router.get('/dashboard', authenticateToken, requirePermission('dashboard', 'read'), async (req, res) => {
  try {
    // Get customer statistics
    const totalCustomers = await get('SELECT COUNT(*) as total FROM customers');
    const activeCustomers = await get('SELECT COUNT(*) as active FROM customers WHERE status = "active"');
    const inactiveCustomers = await get('SELECT COUNT(*) as inactive FROM customers WHERE status = "inactive"');
    
    // Get vendor statistics
    const totalVendors = await get('SELECT COUNT(*) as total FROM vendors');
    const activeVendors = await get('SELECT COUNT(*) as active FROM vendors WHERE status = "active"');
    const inactiveVendors = await get('SELECT COUNT(*) as inactive FROM vendors WHERE status = "inactive"');
    
    // Get project statistics
    const totalProjects = await get('SELECT COUNT(*) as total FROM projects');
    const activeProjects = await get('SELECT COUNT(*) as active FROM projects WHERE status = "active"');
    const completedProjects = await get('SELECT COUNT(*) as completed FROM projects WHERE status = "completed"');
    const onHoldProjects = await get('SELECT COUNT(*) as onHold FROM projects WHERE status = "on-hold"');
    
    // Get task statistics
    const totalTasks = await get('SELECT COUNT(*) as total FROM tasks');
    const todoTasks = await get('SELECT COUNT(*) as todo FROM tasks WHERE status = "todo"');
    const inProgressTasks = await get('SELECT COUNT(*) as inProgress FROM tasks WHERE status = "in-progress"');
    const doneTasks = await get('SELECT COUNT(*) as done FROM tasks WHERE status = "done"');
    
    // Get invoice statistics
    const totalInvoices = await get('SELECT COUNT(*) as total FROM invoices');
    const paidInvoices = await get('SELECT COUNT(*) as paid FROM invoices WHERE status = "paid"');
    const pendingInvoices = await get('SELECT COUNT(*) as pending FROM invoices WHERE status = "sent"');
    const overdueInvoices = await get('SELECT COUNT(*) as overdue FROM invoices WHERE status = "overdue"');
    const totalInvoiceAmount = await get('SELECT SUM(amount) as totalAmount FROM invoices');
    
    // Get recent activities (last 10 records)
    const recentProjects = await all(
      'SELECT * FROM projects ORDER BY created_at DESC LIMIT 5'
    );
    
    const recentTasks = await all(
      'SELECT * FROM tasks ORDER BY created_at DESC LIMIT 5'
    );
    
    res.json({
      customers: {
        total: totalCustomers.total,
        active: activeCustomers.active,
        inactive: inactiveCustomers.inactive
      },
      vendors: {
        total: totalVendors.total,
        active: activeVendors.active,
        inactive: inactiveVendors.inactive
      },
      projects: {
        total: totalProjects.total,
        active: activeProjects.active,
        completed: completedProjects.completed,
        onHold: onHoldProjects.onHold
      },
      tasks: {
        total: totalTasks.total,
        todo: todoTasks.todo,
        inProgress: inProgressTasks.inProgress,
        done: doneTasks.done
      },
      invoices: {
        total: totalInvoices.total,
        paid: paidInvoices.paid,
        pending: pendingInvoices.pending,
        overdue: overdueInvoices.overdue,
        totalAmount: totalInvoiceAmount.totalAmount || 0
      },
      recent: {
        projects: recentProjects,
        tasks: recentTasks
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get project progress report
router.get('/projects/progress', authenticateToken, requirePermission('projects', 'read'), async (req, res) => {
  try {
    const projects = await all(
      `SELECT p.*, c.name as customer_name, u.name as manager_name 
       FROM projects p 
       LEFT JOIN customers c ON p.customer_id = c.id 
       LEFT JOIN users u ON p.manager_id = u.id 
       ORDER BY p.created_at DESC`
    );
    
    res.json({ projects });
  } catch (error) {
    console.error('Get project progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get financial summary
router.get('/financial/summary', authenticateToken, requirePermission('invoices', 'read'), async (req, res) => {
  try {
    const totalInvoices = await get('SELECT COUNT(*) as total FROM invoices');
    const totalAmount = await get('SELECT SUM(amount) as total FROM invoices');
    const paidAmount = await get('SELECT SUM(amount) as total FROM invoices WHERE status = "paid"');
    const pendingAmount = await get('SELECT SUM(amount) as total FROM invoices WHERE status = "sent"');
    const overdueAmount = await get('SELECT SUM(amount) as total FROM invoices WHERE status = "overdue"');
    
    res.json({
      totalInvoices: totalInvoices.total,
      totalAmount: totalAmount.total || 0,
      paidAmount: paidAmount.total || 0,
      pendingAmount: pendingAmount.total || 0,
      overdueAmount: overdueAmount.total || 0
    });
  } catch (error) {
    console.error('Get financial summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user activity report
router.get('/users/activity', authenticateToken, requirePermission('users', 'read'), async (req, res) => {
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
    console.error('Get user activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 