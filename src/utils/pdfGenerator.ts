import jsPDF from 'jspdf';
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

  // Create PDF using jsPDF
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (2 * margin);
  
  let currentY = margin;
  let pageNumber = 1;

  // Function to add a new page
  const addNewPage = () => {
    pdf.addPage();
    pageNumber++;
    currentY = margin;
  };

  // Function to check if we need a new page
  const checkPageBreak = (requiredHeight: number) => {
    if (currentY + requiredHeight > pageHeight - margin) {
      addNewPage();
      return true;
    }
    return false;
  };

  // Function to add text with word wrapping
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12) => {
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);
    lines.forEach((line: string) => {
      if (currentY + 5 > pageHeight - margin) {
        addNewPage();
      }
      pdf.text(line, x, currentY);
      currentY += 5;
    });
    return lines.length * 5;
  };

  // Function to add header (only on first page)
  const addHeader = () => {
    if (pageNumber === 1) {
      // Add logo
      try {
        pdf.addImage(SMART_UNIVERSE_LOGO_BASE64, 'JPEG', margin, currentY, 35, 20);
      } catch (error) {
        console.warn('Could not add logo:', error);
      }
      
      // Company info (English)
      pdf.setFontSize(10);
      pdf.setTextColor(102, 102, 102);
      pdf.text('FOR COMMUNICATIONS AND INFORMATION TECHNOLOGY', margin + 40, currentY + 5);
      pdf.text('Riyadh, Saudi Arabia', margin + 40, currentY + 10);
      pdf.text('Phone: +966 11 123 4567', margin + 40, currentY + 15);
      pdf.text('Email: info@smartuniit.com', margin + 40, currentY + 20);
      pdf.text('CR: 1234567890 | VAT: 300123456789', margin + 40, currentY + 25);

      // Company name (Arabic) - Right side
      pdf.setFontSize(12);
      pdf.setTextColor(30, 64, 175);
      const arabicText = 'مؤسسة الكون الذكي للاتصالات و تقنية المعلومات';
      const arabicWidth = pdf.getTextWidth(arabicText);
      pdf.text(arabicText, pageWidth - margin - arabicWidth, currentY + 10);

             // QUOTATION title
       pdf.setFontSize(20);
       pdf.setTextColor(30, 64, 175);
       pdf.setFont('helvetica', 'bold');
       const titleText = 'QUOTATION';
      const titleWidth = pdf.getTextWidth(titleText);
      pdf.text(titleText, pageWidth - margin - titleWidth, currentY + 25);

      // Quote number and date
      pdf.setFontSize(10);
      pdf.setTextColor(102, 102, 102);
      pdf.setFont('helvetica', 'normal');
      const quoteNumber = `Quote #: ${quote.quote_number || quote.quoteNumber || 'N/A'}`;
      const quoteDate = `Date: ${new Date(quote.created_at || quote.createdAt || Date.now()).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`;
      const quoteNumberWidth = pdf.getTextWidth(quoteNumber);
      const quoteDateWidth = pdf.getTextWidth(quoteDate);
      pdf.text(quoteNumber, pageWidth - margin - quoteNumberWidth, currentY + 35);
      pdf.text(quoteDate, pageWidth - margin - quoteDateWidth, currentY + 40);

      currentY += 50;
      
      // Add separator line
      pdf.setDrawColor(30, 64, 175);
      pdf.setLineWidth(0.5);
      pdf.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 10;
    }
  };

  // Function to add customer section (only on first page)
  const addCustomerSection = () => {
    if (pageNumber === 1) {
      pdf.setFontSize(12);
      pdf.setTextColor(30, 64, 175);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Bill To:', margin, currentY);
      currentY += 8;

      pdf.setFontSize(10);
      pdf.setTextColor(51, 51, 51);
      pdf.setFont('helvetica', 'normal');
      pdf.text(customer.name || 'Customer Name', margin, currentY);
      currentY += 5;
      pdf.text(customer.address || 'Customer Address', margin, currentY);
      currentY += 5;
      pdf.text(`Phone: ${customer.phone || 'N/A'}`, margin, currentY);
      currentY += 5;
      pdf.text(`Email: ${customer.email || 'N/A'}`, margin, currentY);
      currentY += 15;
    }
  };

  // Function to add items table with pagination
  const addItemsTable = () => {
    const tableHeaderHeight = 15;
    const rowHeight = 12;
    const maxRowsPerPage = Math.floor((pageHeight - margin - currentY - 100) / rowHeight); // Leave space for totals and footer
    
    // Add table header
    pdf.setFontSize(12);
    pdf.setTextColor(30, 64, 175);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Items & Services', margin, currentY);
    currentY += 8;

    // Table headers
    pdf.setFillColor(30, 64, 175);
    pdf.setTextColor(255, 255, 255);
    pdf.rect(margin, currentY, contentWidth, tableHeaderHeight, 'F');
    
    const colWidths = [10, 80, 25, 35, 35];
    const colX = [margin, margin + 10, margin + 90, margin + 115, margin + 150];
    
    pdf.text('#', colX[0], currentY + 10);
    pdf.text('Description', colX[1], currentY + 10);
    pdf.text('Quantity', colX[2], currentY + 10);
    pdf.text('Unit Price', colX[3], currentY + 10);
    pdf.text('Total', colX[4], currentY + 10);
    
    currentY += tableHeaderHeight;

    // Add items
    pdf.setFontSize(10);
    pdf.setTextColor(51, 51, 51);
    pdf.setFont('helvetica', 'normal');
    
    let rowCount = 0;
    
    lineItems.forEach((item: any, index: number) => {
      // Check if we need a new page
      if (rowCount >= maxRowsPerPage) {
        addNewPage();
        rowCount = 0;
        
        // Re-add table header on new page
        pdf.setFillColor(30, 64, 175);
        pdf.setTextColor(255, 255, 255);
        pdf.rect(margin, currentY, contentWidth, tableHeaderHeight, 'F');
        
        pdf.text('#', colX[0], currentY + 10);
        pdf.text('Description', colX[1], currentY + 10);
        pdf.text('Quantity', colX[2], currentY + 10);
        pdf.text('Unit Price', colX[3], currentY + 10);
        pdf.text('Total', colX[4], currentY + 10);
        
        currentY += tableHeaderHeight;
      }

      const quantity = item.quantity || 0;
      const unitPrice = item.unitPrice || 0;
      const itemTotal = item.total || (quantity * unitPrice) || 0;

      // Add row
      pdf.text((index + 1).toString(), colX[0], currentY + 8);
      
      // Handle long descriptions with wrapping
      const description = item.name || item.description || 'Item';
      const descLines = pdf.splitTextToSize(description, colWidths[1] - 2);
      descLines.forEach((line: string, lineIndex: number) => {
        pdf.text(line, colX[1], currentY + 8 + (lineIndex * 4));
      });
      
      pdf.text(`${quantity} pcs`, colX[2], currentY + 8);
      pdf.text(`${unitPrice.toFixed(2)} ${SAR_SYMBOL}`, colX[3], currentY + 8);
      pdf.text(`${itemTotal.toFixed(2)} ${SAR_SYMBOL}`, colX[4], currentY + 8);

      // Adjust row height for wrapped text
      const rowActualHeight = Math.max(rowHeight, descLines.length * 4 + 4);
      currentY += rowActualHeight;
      rowCount++;
    });
  };

  // Function to add totals section
  const addTotalsSection = () => {
    // Check if we need a new page for totals
    if (currentY + 80 > pageHeight - margin) {
      addNewPage();
    }

    const totalsX = pageWidth - margin - 80;
    
    pdf.setFontSize(10);
    pdf.setTextColor(51, 51, 51);
    pdf.setFont(undefined, 'normal');

    // Subtotal
    pdf.text('المجموع الفرعي / Subtotal', totalsX, currentY);
    pdf.text(`${subtotal.toFixed(2)} ${SAR_SYMBOL}`, pageWidth - margin - 10, currentY, { align: 'right' });
    currentY += 8;

    // Discount
    if (discountAmount > 0) {
      const discountLabel = discountType === 'percentage' 
        ? `الخصم / Discount (${discountValue}%)`
        : 'الخصم / Discount (Fixed)';
      pdf.text(discountLabel, totalsX, currentY);
      pdf.text(`-${discountAmount.toFixed(2)} ${SAR_SYMBOL}`, pageWidth - margin - 10, currentY, { align: 'right' });
      currentY += 8;
    }

    // VAT
    pdf.text(`ضريبة القيمة المضافة / VAT (${vatRate}%)`, totalsX, currentY);
    pdf.text(`${vatAmount.toFixed(2)} ${SAR_SYMBOL}`, pageWidth - margin - 10, currentY, { align: 'right' });
    currentY += 8;

    // Total
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('المجموع الكلي / Total', totalsX, currentY);
    pdf.text(`${total.toFixed(2)} ${SAR_SYMBOL}`, pageWidth - margin - 10, currentY, { align: 'right' });
    currentY += 15;
  };

  // Function to add footer
  const addFooter = () => {
    // Check if we need a new page for footer
    if (currentY + 100 > pageHeight - margin) {
      addNewPage();
    }

    // Terms and conditions
    pdf.setFontSize(10);
    pdf.setTextColor(51, 51, 51);
    pdf.setFont(undefined, 'normal');
    
    pdf.text('Terms and Conditions:', margin, currentY);
    currentY += 8;
    
    customTerms.forEach((term: string) => {
      const lines = pdf.splitTextToSize(`• ${term}`, contentWidth);
      lines.forEach((line: string) => {
        pdf.text(line, margin, currentY);
        currentY += 5;
      });
    });

    currentY += 10;

    // Arabic terms
    pdf.text('الشروط والأحكام:', margin, currentY);
    currentY += 8;
    
    const arabicTerms = [
      '• شروط الدفع: 30 يوم من تاريخ الفاتورة',
      '• جميع الأسعار بالريال السعودي',
      '• ضريبة القيمة المضافة مشمولة في جميع الأسعار',
      '• هذه العروض صالحة لمدة 30 يوم',
      '• سيتم التسليم خلال 7-14 يوم عمل'
    ];
    
    arabicTerms.forEach((term: string) => {
      const lines = pdf.splitTextToSize(term, contentWidth);
      lines.forEach((line: string) => {
        pdf.text(line, margin, currentY);
        currentY += 5;
      });
    });
  };

  // Function to add page numbers
  const addPageNumbers = () => {
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.setTextColor(102, 102, 102);
      pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 30, pageHeight - 10);
    }
  };

  try {
    // Generate PDF content
    addHeader();
    addCustomerSection();
    addItemsTable();
    addTotalsSection();
    addFooter();
    addPageNumbers();

    // Return as blob
    const blob = pdf.output('blob');
    console.log('PDF Generator - Successfully generated multi-page PDF blob:', blob);
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