const express = require('express');
const { run, get } = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get company settings
router.get('/company', authenticateToken, async (req, res) => {
  try {
    // For now, return default settings
    // In a real app, these would be stored in a settings table
    const settings = {
      name: 'Smart Universe Communication and Information Technology',
      nameAr: 'مؤسسة الكون الذكي للاتصالات و تقنية المعلومات',
      address: 'King Abdulaziz Road, Riyadh',
      addressAr: 'طريق الملك عبدالعزيز، الرياض',
      phone: '+966 50 123 4567',
      email: 'info@smartuniit.com',
      crNumber: '1010123456',
      vatNumber: '300155266800003',
      logo: '/smaruniit_logo.png',
      vatRate: 15,
      bankingDetails: {
        bankName: 'Saudi National Bank',
        iban: 'SA3610000041000000080109',
        accountNumber: '41000000080109'
      }
    };
    
    res.json({ settings });
  } catch (error) {
    console.error('Get company settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update company settings (admin only)
router.put('/company', authenticateToken, requireRole(['admin', 'superadmin']), async (req, res) => {
  try {
    const { name, nameAr, address, addressAr, phone, email, crNumber, vatNumber, vatRate, bankingDetails } = req.body;
    
    // In a real app, this would update a settings table
    // For now, just return success
    res.json({
      message: 'Company settings updated successfully',
      settings: {
        name: name || 'Smart Universe Communication and Information Technology',
        nameAr: nameAr || 'مؤسسة الكون الذكي للاتصالات و تقنية المعلومات',
        address: address || 'King Abdulaziz Road, Riyadh',
        addressAr: addressAr || 'طريق الملك عبدالعزيز، الرياض',
        phone: phone || '+966 50 123 4567',
        email: email || 'info@smartuniit.com',
        crNumber: crNumber || '1010123456',
        vatNumber: vatNumber || '300155266800003',
        logo: '/smaruniit_logo.png',
        vatRate: vatRate || 15,
        bankingDetails: bankingDetails || {
          bankName: 'Saudi National Bank',
          iban: 'SA3610000041000000080109',
          accountNumber: '41000000080109'
        }
      }
    });
  } catch (error) {
    console.error('Update company settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 