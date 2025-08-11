const fs = require('fs');
const path = require('path');

// Test data with many line items to trigger multiple pages
const testQuote = {
  id: 'test-quote-multi-page',
  quote_number: 'Q-MULTI-001',
  customer: {
    name: 'Test Customer Company for Multi-Page Testing',
    address: '123 Test Street, Riyadh, Saudi Arabia, Building A, Floor 5, Office 502',
    phone: '+966 50 123 4567',
    email: 'test@example.com'
  },
  lineItems: [
    // Generate 50 line items to ensure multiple pages
    ...Array.from({ length: 50 }, (_, i) => ({
      name: `Test Item ${i + 1} - This is a very long description that might wrap to multiple lines and test the text wrapping functionality of the PDF generator`,
      quantity: Math.floor(Math.random() * 10) + 1,
      unitPrice: Math.floor(Math.random() * 10000) + 100,
      total: 0
    }))
  ],
  created_at: new Date().toISOString()
};

// Calculate totals for test items
testQuote.lineItems.forEach(item => {
  item.total = item.quantity * item.unitPrice;
});

console.log('🧪 Testing Multi-Page PDF Generation');
console.log(`📄 Generated ${testQuote.lineItems.length} line items`);
console.log(`💰 Total items value: ${testQuote.lineItems.reduce((sum, item) => sum + item.total, 0).toFixed(2)} SAR`);

// Test the PDF generation by calling the frontend
const testScript = `
// Test multi-page PDF generation
async function testMultiPagePDF() {
  try {
    console.log('🔄 Testing multi-page PDF generation...');
    
    // Import the PDF generator
    const { generateQuotationPDF } = await import('./src/utils/pdfGenerator.ts');
    
    // Generate PDF
    const blob = await generateQuotationPDF(${JSON.stringify(testQuote)});
    
    console.log('✅ Multi-page PDF generated successfully!');
    console.log('📊 Blob size:', blob.size, 'bytes');
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'test-multi-page-quotation.pdf';
    a.click();
    
    console.log('📥 PDF download initiated');
    
  } catch (error) {
    console.error('❌ Error generating multi-page PDF:', error);
  }
}

// Run the test
testMultiPagePDF();
`;

// Write test script to file
fs.writeFileSync('test-multi-page-pdf.js', testScript);

console.log('✅ Test script created: test-multi-page-pdf.js');
console.log('🌐 Open http://localhost:5173/test-multi-page-pdf.html to test');
console.log('📋 Or run this in browser console:');
console.log(testScript); 