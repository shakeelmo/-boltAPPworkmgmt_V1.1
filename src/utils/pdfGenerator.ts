import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import '@abdulrysr/saudi-riyal-new-symbol-font';
import { SMART_UNIVERSE_LOGO_BASE64 } from './logoBase64';


// Saudi Riyal symbol - using the correct Unicode character
const SAR_SYMBOL = '﷼';

export async function generateQuotationPDF(quote: any, settings: any = {}) {
  console.log('PDF Generator - Input quote:', quote);
  console.log('PDF Generator - Input settings:', settings);
  
  // Calculate totals properly including discount
  const lineItems = quote.lineItems || [];
  const subtotal = lineItems.reduce((sum: number, item: any) => {
    const quantity = item.quantity || 0;
    const unitPrice = item.unitPrice || 0;
    const itemTotal = item.total || (quantity * unitPrice) || 0;
    console.log('Item calculation:', { item, quantity, unitPrice, itemTotal });
    return sum + itemTotal;
  }, 0);
  
  // Calculate discount
  const discountType = quote.discountType || 'percentage';
  const discountValue = quote.discountValue || 0;
  let discountAmount = 0;
  if (discountValue > 0) {
    if (discountType === 'percentage') {
      discountAmount = subtotal * (discountValue / 100);
    } else {
      discountAmount = discountValue;
    }
  }
  
  const vatRate = quote.vatRate || settings?.vatRate || 15; // 15% VAT
  const vatAmount = (subtotal - discountAmount) * (vatRate / 100);
  const total = subtotal - discountAmount + vatAmount;
  
  console.log('PDF Generator - Calculated totals:', { subtotal, discountAmount, vatAmount, total, lineItemsCount: lineItems.length });

  // Custom terms and conditions - use the actual terms from the quote
  const customTerms = quote.terms || settings.defaultTerms || [
    'Payment terms: 30 days from invoice date',
    'All prices are in Saudi Riyals (SAR)',
    'VAT is included in all prices',
    'This quotation is valid for 30 days',
    'Delivery will be made within 7-14 business days'
  ];

  // Get customer data - handle both quote.customer and separate customer object
  const customer = quote.customer || quote;
  
  console.log('PDF Generator - Customer data:', customer);

  // Use the actual Smart Universe logo image (properly converted base64)
  // Enhanced for better PDF rendering compatibility
  const LOGO_HTML = `
    <div style="width: 140px; height: 80px; display: flex; align-items: center; justify-content: center; background: white; position: relative; z-index: 10; overflow: hidden; border: none; outline: none;">
      <img 
        src="${SMART_UNIVERSE_LOGO_BASE64}" 
        alt="Smart Universe Logo" 
        style="width: 100%; height: 100%; object-fit: contain; position: relative; z-index: 1; border: none; outline: none; box-shadow: none; filter: none; display: block; max-width: 100%; max-height: 100%;" 
        crossorigin="anonymous"
        onload="console.log('Logo loaded successfully')"
        onerror="console.error('Logo failed to load')"
      />
    </div>
  `;

  // Generate the HTML content
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700&display=swap');
        
        @page {
          size: A4;
          margin: 15mm;
        }
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          color: #333;
          line-height: 1.4;
          position: relative;
          min-height: 297mm;
          font-size: 12px;
        }
        .container {
          max-width: 210mm;
          margin: 0 auto;
          padding: 20px;
          background: white;
          position: relative;
          min-height: 297mm;
          padding-bottom: 180px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          border-bottom: 2px solid #1E40AF;
          padding-bottom: 20px;
        }
        .left-section {
          display: flex;
          align-items: flex-start;
          flex: 0 0 50%;
        }
        .right-section {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          flex: 0 0 50%;
          text-align: right;
        }
        .logo-section {
          flex: 0 0 140px;
          position: relative;
          z-index: 10;
          margin-right: 20px;
        }
        .logo {
          width: 140px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          position: relative;
          z-index: 10;
          overflow: hidden;
          border: none;
          outline: none;
          box-shadow: none;
        }
        .company-info-left {
          flex: 1;
          margin-left: 30px;
          position: relative;
          z-index: 1;
          padding-top: 5px;
        }
        .company-name {
          font-size: 24px;
          font-weight: bold;
          color: #1E40AF;
          margin-bottom: 5px;
          text-align: left;
        }
        .company-name-ar {
          font-size: 20px;
          font-weight: bold;
          color: #1E40AF;
          margin-bottom: 15px;
          direction: rtl;
          font-family: 'Noto Sans Arabic', Arial, sans-serif;
          white-space: normal;
          overflow: visible;
          text-overflow: clip;
          max-width: none;
          line-height: 1.3;
          letter-spacing: 0px;
          padding-top: 5px;
          margin-top: 5px;
          text-align: right;
          word-wrap: break-word;
          word-break: normal;
        }
        .company-details {
          font-size: 12px;
          color: #666;
          line-height: 1.6;
          text-align: left;
        }
        .quote-info {
          text-align: right;
        }
        .quote-title {
          font-size: 28px;
          font-weight: bold;
          color: #1E40AF;
          margin-bottom: 10px;
        }
        .quote-number {
          font-size: 14px;
          color: #666;
          margin-bottom: 5px;
        }
        .quote-date {
          font-size: 12px;
          color: #666;
        }
        .customer-section {
          margin-bottom: 30px;
          display: flex;
          justify-content: space-between;
        }
        .customer-info {
          flex: 1;
        }
        .section-title {
          font-size: 16px;
          font-weight: bold;
          color: #1E40AF;
          margin-bottom: 10px;
          border-bottom: 1px solid #e0e0e0;
          padding-bottom: 5px;
          text-align: left;
        }
        .customer-details {
          font-size: 12px;
          line-height: 1.6;
          text-align: left;
        }
        .items-section {
          margin-bottom: 30px;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        .items-table th {
          background: #1E40AF;
          color: white;
          padding: 12px 8px;
          text-align: left;
          font-weight: bold;
          font-size: 12px;
        }
        .items-table td {
          padding: 10px 8px;
          border-bottom: 1px solid #e0e0e0;
          font-size: 12px;
        }
        .items-table tr:nth-child(even) {
          background: #f9f9f9;
        }
        .totals-section {
          margin-bottom: 30px;
        }
        .totals-table {
          width: 300px;
          margin-left: auto;
          border-collapse: collapse;
        }
        .totals-table td {
          padding: 8px 12px;
          border-bottom: 1px solid #e0e0e0;
          font-size: 12px;
        }
        .totals-table .discount-row {
          color: #059669;
          font-weight: bold;
        }
        .totals-table .total-row {
          font-weight: bold;
          font-size: 14px;
          background: #1E40AF;
          color: white;
        }
        .terms-section {
          margin-bottom: 30px;
          display: flex;
          justify-content: space-between;
        }
        .terms-left {
          flex: 1;
          margin-right: 20px;
        }
        .banking-right {
          flex: 1;
        }
        .terms-title {
          font-size: 14px;
          font-weight: bold;
          color: #1E40AF;
          margin-bottom: 10px;
          text-align: left;
        }
        .terms-list {
          font-size: 11px;
          line-height: 1.4;
          color: #666;
          text-align: left;
        }
        .terms-list li {
          margin-bottom: 5px;
        }
        .footer {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: #1E40AF;
          color: white;
          padding: 12px 20px;
          font-size: 10px;
          text-align: center;
          width: 100%;
          box-sizing: border-box;
          z-index: 1000;
          min-height: 60px;
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        .page-number {
          position: absolute;
          bottom: 12px;
          right: 20px;
          font-size: 10px;
          color: white;
          z-index: 1001;
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          font-weight: bold;
        }
        .riyal-symbol {
          font-family: 'Noto Sans Arabic', sans-serif;
          font-weight: bold;
          font-size: 12px;
        }
        .contact-info {
          margin-top: 10px;
          font-size: 10px;
          line-height: 1.4;
        }
        .footer-content {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        .arabic-terms {
          direction: rtl;
          text-align: right;
          font-family: 'Noto Sans Arabic', sans-serif;
          margin-top: 15px;
        }
        .arabic-terms .terms-title {
          text-align: right;
        }
        .arabic-terms .terms-list {
          text-align: right;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header with Logo and Company Info -->
        <div class="header">
          <!-- Left Side: English Company Info -->
          <div class="left-section">
            <div class="logo-section">
              <div class="logo">
                ${LOGO_HTML}
              </div>
            </div>
            <div class="company-info-left">
              <div class="company-details">
                FOR COMMUNICATIONS AND INFORMATION TECHNOLOGY<br>
                Riyadh, Saudi Arabia<br>
                Phone: +966 11 123 4567<br>
                Email: info@smartuniit.com<br>
                CR: 1234567890 | VAT: 300123456789
              </div>
            </div>
          </div>
          
          <!-- Right Side: Arabic Company Name and Quote Info -->
          <div class="right-section">
            <div class="company-name-ar">مؤسسة الكون الذكي للاتصالات و تقنية المعلومات</div>
            <div class="quote-info">
              <div class="quote-title">QUOTATION</div>
              <div class="quote-number">Quote #: ${quote.quote_number || quote.quoteNumber || 'N/A'}</div>
              <div class="quote-date">Date: ${new Date(quote.created_at || quote.createdAt || Date.now()).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</div>
            </div>
          </div>
        </div>

        <!-- Customer Section -->
        <div class="customer-section">
          <div class="customer-info">
            <div class="section-title">Bill To:</div>
            <div class="customer-details">
              ${customer.name || 'Customer Name'}<br>
              ${customer.address || 'Customer Address'}<br>
              Phone: ${customer.phone || 'N/A'}<br>
              Email: ${customer.email || 'N/A'}
            </div>
          </div>
        </div>

        <!-- Items Section -->
        <div class="items-section">
          <div class="section-title">Items & Services</div>
          <table class="items-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${lineItems.map((item: any, index: number) => {
                const quantity = item.quantity || 0;
                const unitPrice = item.unitPrice || 0;
                const itemTotal = item.total || (quantity * unitPrice) || 0;
                return `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.name || item.description || 'Item'}</td>
                  <td>${quantity} pcs</td>
                  <td>${unitPrice.toFixed(2)} <span class="riyal-symbol">${SAR_SYMBOL}</span></td>
                  <td>${itemTotal.toFixed(2)} <span class="riyal-symbol">${SAR_SYMBOL}</span></td>
                </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Totals Section -->
        <div class="totals-section">
          <table class="totals-table">
            <tr>
              <td>المجموع الفرعي / Subtotal</td>
              <td>${subtotal.toFixed(2)} <span class="riyal-symbol">${SAR_SYMBOL}</span></td>
            </tr>
            ${discountAmount > 0 ? `
            <tr class="discount-row">
              <td>الخصم / Discount (${discountType === 'percentage' ? discountValue + '%' : 'Fixed'})</td>
              <td>-${discountAmount.toFixed(2)} <span class="riyal-symbol">${SAR_SYMBOL}</span></td>
            </tr>
            ` : ''}
            <tr>
              <td>ضريبة القيمة المضافة / VAT (${vatRate}%)</td>
              <td>${vatAmount.toFixed(2)} <span class="riyal-symbol">${SAR_SYMBOL}</span></td>
            </tr>
            <tr class="total-row">
              <td>المجموع الكلي / Total</td>
              <td>${total.toFixed(2)} <span class="riyal-symbol">${SAR_SYMBOL}</span></td>
            </tr>
          </table>
        </div>

        <!-- Terms and Banking Details -->
        <div class="terms-section">
          <div class="terms-left">
            <div class="terms-title">Terms & Conditions / الشروط والأحكام:</div>
            <div class="terms-list">
              ${quote.terms ? quote.terms.split('\n').map((term: string) => `<div>• ${term}</div>`).join('') : 
                Array.isArray(customTerms) ? customTerms.map((term: string) => `<div>• ${term}</div>`).join('') : 
                `<div>• ${customTerms}</div>`}
            </div>
            ${quote.termsAr ? `
            <div class="terms-title arabic-terms">الشروط والأحكام:</div>
            <div class="terms-list arabic-terms">
              ${quote.termsAr.split('\n').map((term: string) => `<div>• ${term}</div>`).join('')}
            </div>
            ` : ''}
          </div>
          <div class="banking-right">
            <div class="terms-title">Banking Details:</div>
            <div class="terms-list">
              <strong>Bank Name:</strong> Saudi National Bank<br>
              <strong>Account Name:</strong> Smart Universe<br>
              <strong>IBAN:</strong> SA03 8000 0000 6080 1016 7519<br>
              <strong>Swift Code:</strong> SNBASAJE<br>
              <strong>Branch:</strong> Riyadh Main Branch
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer footer-content">
          <div class="contact-info">
            <strong>Smart Universe</strong> | For Communications and Information Technology<br>
            Riyadh, Saudi Arabia | Phone: +966 11 123 4567 | Email: info@smartuniit.com<br>
            CR: 1234567890 | VAT: 300123456789
          </div>
          <div class="page-number">Page 1 of 1</div>
        </div>
      </div>
    </body>
    </html>
  `;

  console.log('PDF Generator - Generated HTML content length:', htmlContent.length);

  try {
    // Create a temporary div to render the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.style.width = '210mm';
    tempDiv.style.height = '297mm';
    tempDiv.style.backgroundColor = 'white';
    document.body.appendChild(tempDiv);

    // Wait for images to load with extended timeout
    console.log('PDF Generator - Waiting for images to load...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('PDF Generator - Images load timeout completed');

    // Convert to canvas with enhanced image handling
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 794, // A4 width in pixels at 96 DPI
      height: 1123, // A4 height in pixels at 96 DPI
      scrollX: 0,
      scrollY: 0,
      imageTimeout: 15000, // 15 seconds timeout for images
      logging: true, // Enable logging for debugging
      onclone: function(clonedDoc) {
        // Ensure images are properly loaded in the cloned document
        const images = clonedDoc.querySelectorAll('img');
        images.forEach(img => {
          if (img.src.startsWith('data:')) {
            console.log('Processing base64 image in cloned document');
          }
        });
      }
    });

    // Remove temporary div
    document.body.removeChild(tempDiv);

    // Convert canvas to image data
    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // Create PDF using jsPDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Add image to PDF
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

    // Return as blob
    const blob = pdf.output('blob');
    console.log('PDF Generator - Successfully generated PDF blob:', blob);
    return blob;
  } catch (error) {
    console.error('PDF Generator - Error generating PDF:', error);
    throw error;
  }
}

// Test function to verify PDF generation
export async function testPDFGeneration() {
  const testQuote = {
    id: 'test-quote-123',
    quote_number: 'Q-TEST-001',
    customer: {
      name: 'Test Customer Company',
      address: '123 Test Street, Riyadh, Saudi Arabia',
      phone: '+966 50 123 4567',
      email: 'test@example.com'
    },
    lineItems: [
      {
        name: 'Web Development Services',
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
    created_at: new Date().toISOString()
  };

  try {
    const blob = await generateQuotationPDF(testQuote);
    console.log('PDF Generation Test - Success:', blob);
    return blob;
  } catch (error) {
    console.error('PDF Generation Test - Error:', error);
    throw error;
  }
}