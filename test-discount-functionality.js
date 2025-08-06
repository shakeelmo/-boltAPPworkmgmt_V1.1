const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

// Test data
const testQuotation = {
  customerId: 'customer-123',
  status: 'draft',
  lineItems: [
    {
      id: '1',
      serviceId: 'service-1',
      name: 'Web Development',
      nameAr: 'تطوير الويب',
      description: 'Professional web development services',
      descriptionAr: 'خدمات تطوير الويب الاحترافية',
      quantity: 2,
      unitPrice: 1000,
      total: 2000
    },
    {
      id: '2',
      serviceId: 'service-2',
      name: 'Mobile App Development',
      nameAr: 'تطوير تطبيقات الجوال',
      description: 'Mobile application development',
      descriptionAr: 'تطوير تطبيقات الجوال',
      quantity: 1,
      unitPrice: 1500,
      total: 1500
    }
  ],
  subtotal: 3500,
  discountType: 'percentage',
  discountValue: 10,
  discountAmount: 350,
  vatRate: 15,
  vatAmount: 472.5,
  total: 3622.5,
  validUntil: '2024-12-31',
  notes: 'Test quotation with discount',
  notesAr: 'عرض تجريبي مع خصم',
  terms: 'Payment terms: 30 days\nVAT included',
  termsAr: 'شروط الدفع: 30 يوم\nضريبة القيمة المضافة مشمولة'
};

async function testDiscountFunctionality() {
  try {
    console.log('🧪 Testing Discount Functionality...\n');

    // Step 1: Test authentication
    console.log('1. Testing authentication...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log('✅ Authentication successful\n');

    // Step 2: Test quotation creation with discount
    console.log('2. Testing quotation creation with discount...');
    const createResponse = await axios.post(`${API_BASE}/quotations`, testQuotation, { headers });
    
    if (createResponse.status === 201) {
      console.log('✅ Quotation created successfully');
      console.log('📊 Quotation Details:');
      console.log(`   - Subtotal: ${testQuotation.subtotal} SAR`);
      console.log(`   - Discount: ${testQuotation.discountValue}% (${testQuotation.discountAmount} SAR)`);
      console.log(`   - VAT: ${testQuotation.vatRate}% (${testQuotation.vatAmount} SAR)`);
      console.log(`   - Total: ${testQuotation.total} SAR`);
    } else {
      console.log('❌ Failed to create quotation');
      console.log('Response:', createResponse.data);
    }

    // Step 3: Test quotation retrieval
    console.log('\n3. Testing quotation retrieval...');
    const quotationsResponse = await axios.get(`${API_BASE}/quotations`, { headers });
    
    if (quotationsResponse.status === 200) {
      const quotations = quotationsResponse.data.quotations;
      console.log(`✅ Retrieved ${quotations.length} quotations`);
      
      if (quotations.length > 0) {
        const latestQuote = quotations[0];
        console.log('📋 Latest Quotation:');
        console.log(`   - ID: ${latestQuote.id}`);
        console.log(`   - Quote Number: ${latestQuote.quote_number}`);
        console.log(`   - Total Amount: ${latestQuote.total_amount} SAR`);
        console.log(`   - Discount Type: ${latestQuote.discount_type}`);
        console.log(`   - Discount Value: ${latestQuote.discount_value}`);
        console.log(`   - Discount Amount: ${latestQuote.discount_amount} SAR`);
        console.log(`   - VAT Rate: ${latestQuote.vat_rate}%`);
        console.log(`   - VAT Amount: ${latestQuote.vat_amount} SAR`);
      }
    }

    // Step 4: Test quotation update with different discount
    console.log('\n4. Testing quotation update with fixed discount...');
    const updateData = {
      discountType: 'fixed',
      discountValue: 500,
      discountAmount: 500,
      total: 3525 // Recalculated total
    };
    
    if (quotationsResponse.data.quotations.length > 0) {
      const quoteId = quotationsResponse.data.quotations[0].id;
      const updateResponse = await axios.put(`${API_BASE}/quotations/${quoteId}`, updateData, { headers });
      
      if (updateResponse.status === 200) {
        console.log('✅ Quotation updated successfully');
        console.log('📊 Updated Discount Details:');
        console.log(`   - Discount Type: ${updateData.discountType}`);
        console.log(`   - Discount Value: ${updateData.discountValue} SAR`);
        console.log(`   - New Total: ${updateData.total} SAR`);
      } else {
        console.log('❌ Failed to update quotation');
        console.log('Response:', updateResponse.data);
      }
    }

    console.log('\n🎉 Discount functionality test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

// Run the test
testDiscountFunctionality(); 