import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import '@abdulrysr/saudi-riyal-new-symbol-font';

// Saudi Riyal symbol - using the correct Unicode character
const SAR_SYMBOL = '﷼';

export async function generateQuotationPDF(quote: any, settings: any = {}) {
  console.log('PDF Generator - Input quote:', quote);
  console.log('PDF Generator - Input settings:', settings);
  
  // Calculate totals properly
  const lineItems = quote.lineItems || [];
  const subtotal = lineItems.reduce((sum: number, item: any) => {
    const quantity = item.quantity || 0;
    const unitPrice = item.unitPrice || 0;
    const itemTotal = item.total || (quantity * unitPrice) || 0;
    console.log('Item calculation:', { item, quantity, unitPrice, itemTotal });
    return sum + itemTotal;
  }, 0);
  const vatRate = 15; // 15% VAT
  const vatAmount = (subtotal * vatRate) / 100;
  const total = subtotal + vatAmount;
  
  console.log('PDF Generator - Calculated totals:', { subtotal, vatAmount, total, lineItemsCount: lineItems.length });

  // Custom terms and conditions
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

  // Updated Smart Universe logo to exactly match the attached design
  const LOGO_BASE64 = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSJ3aGl0ZSIvPgo8dGV4dCB4PSI2MCIgeT0iMzAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiNGRjZCMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlNNQVJUPC90ZXh0Pgo8dGV4dCB4PSI2MCIgeT0iNDUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiMxRTQwQUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlVOSVZFUlNFPC90ZXh0Pgo8bGluZSB4MT0iMjAiIHkxPSI2MCIgeDI9IjMwIiB5Mj0iNjAiIHN0cm9rZT0iI0ZGNkIwMCIgc3Ryb2tlLXdpZHRoPSIxIi8+Cjx0ZXh0IHg9IjYwIiB5PSI3MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjgiIGZpbGw9IiNGRjZCMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkZPUiBDT01NVU5JQ0FUSU9OUyBBTkQgSU5GT1JNQVRJT04gVEVDSE5PTE9HWTwvdGV4dD4KPGxpbmUgeDE9IjkwIiB5MT0iNjAiIHgyPSIxMDAiIHkyPSI2MCIgc3Ryb2tlPSIjRkY2QjAwIiBzdHJva2Utd2lkdGg9IjEiLz4KPGNpcmNsZSBjeD0iOTAiIGN5PSIzMCIgcj0iNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0ZGNkIwMCIgc3Ryb2tlLXdpZHRoPSIzIi8+Cjwvc3ZnPg==';

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
          margin: 10mm;
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
          padding-bottom: 220px; /* Increased padding for footer */
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          border-bottom: 2px solid #1E40AF;
          padding-bottom: 20px;
        }
        .logo-section {
          flex: 0 0 200px;
        }
        .logo {
          width: 120px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e0e0e0;
          border-radius: 50%;
          overflow: hidden;
          background: white;
        }
        .logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .company-info {
          flex: 1;
          margin-left: 30px;
        }
        .company-name {
          font-size: 24px;
          font-weight: bold;
          color: #1E40AF;
          margin-bottom: 5px;
        }
        .company-name-ar {
          font-size: 26px;
          font-weight: bold;
          color: #1E40AF;
          margin-bottom: 5px;
          direction: rtl;
          font-family: 'Noto Sans Arabic', sans-serif;
          white-space: nowrap;
          overflow: visible;
          text-overflow: clip;
          max-width: none;
          line-height: 1.5;
          letter-spacing: 0px;
          padding-top: 8px;
          margin-top: 10px;
        }
        .company-details {
          font-size: 12px;
          color: #666;
          line-height: 1.6;
        }
        .quote-info {
          flex: 0 0 200px;
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
        }
        .customer-details {
          font-size: 12px;
          line-height: 1.6;
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
        }
        .terms-list {
          font-size: 11px;
          line-height: 1.4;
          color: #666;
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
          padding: 20px;
          font-size: 11px;
          text-align: center;
          width: 100%;
          box-sizing: border-box;
          z-index: 1000;
          min-height: 140px;
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        .page-number {
          position: absolute;
          bottom: 60px;
          right: 20px;
          font-size: 12px;
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
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header with Logo and Company Info -->
        <div class="header">
          <div class="logo-section">
            <div class="logo">
              <img src="${LOGO_BASE64}" alt="Smart Universe Logo" />
            </div>
          </div>
          <div class="company-info">
            <div class="company-name">SMART UNIVERSE</div>
            <div class="company-name-ar">الكون الذكي</div>
            <div class="company-details">
              FOR COMMUNICATIONS AND INFORMATION TECHNOLOGY<br>
              Riyadh, Saudi Arabia<br>
              Phone: +966 11 123 4567<br>
              Email: info@smartuniit.com<br>
              CR: 1234567890 | VAT: 300123456789
            </div>
          </div>
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
          <div class="page-number">Page 1</div>
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

    // Wait for images to load
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Convert to canvas
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 794, // A4 width in pixels at 96 DPI
      height: 1123, // A4 height in pixels at 96 DPI
      scrollX: 0,
      scrollY: 0
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