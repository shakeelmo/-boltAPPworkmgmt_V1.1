// Simple test for clean PDF generation
const testQuote = {
  id: 'test-clean-quote',
  quote_number: 'Q-CLEAN-001',
  customer: {
    name: 'Test Customer',
    address: '123 Test Street, Riyadh',
    phone: '+966 50 123 4567',
    email: 'test@example.com'
  },
  lineItems: [
    {
      name: 'Web Development',
      quantity: 2,
      unitPrice: 5000,
      total: 10000
    },
    {
      name: 'Mobile App Development',
      quantity: 1,
      unitPrice: 15000,
      total: 15000
    },
    {
      name: 'UI/UX Design',
      quantity: 3,
      unitPrice: 2000,
      total: 6000
    }
  ],
  discountType: 'percentage',
  discountValue: 10,
  vatRate: 15,
  created_at: new Date().toISOString()
};

console.log('🧪 Testing Clean PDF Generation');
console.log('📄 Test Quote Data:', JSON.stringify(testQuote, null, 2));

// Test the PDF generation
async function testCleanPDF() {
  try {
    console.log('🔄 Importing PDF generator...');
    const { generateQuotationPDF } = await import('./src/utils/pdfGenerator.ts');
    
    console.log('🔄 Generating clean PDF...');
    const blob = await generateQuotationPDF(testQuote);
    
    console.log('✅ Clean PDF generated successfully!');
    console.log('📊 Blob size:', blob.size, 'bytes');
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'test-clean-quotation.pdf';
    a.click();
    
    console.log('📥 Clean PDF download initiated');
    
  } catch (error) {
    console.error('❌ Error generating clean PDF:', error);
  }
}

// Run test if in browser
if (typeof window !== 'undefined') {
  testCleanPDF();
} else {
  console.log('📋 Run this in browser console or use test-clean-pdf.html');
} 