import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Quote, QuotationSettings } from '../types/quotation';
import { Customer } from '../types';
import { format } from 'date-fns';

export class PDFGenerator {
  private static instance: PDFGenerator;
  
  public static getInstance(): PDFGenerator {
    if (!PDFGenerator.instance) {
      PDFGenerator.instance = new PDFGenerator();
    }
    return PDFGenerator.instance;
  }

  public async generateQuotePDF(
    quote: Quote, 
    customer: Customer, 
    settings: QuotationSettings | null
  ): Promise<Blob> {
    if (!settings) {
      throw new Error('Settings are required to generate PDF');
    }
    
    // Create a temporary container for the PDF content
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = '210mm'; // A4 width
    container.style.backgroundColor = 'white';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.fontSize = '12px';
    container.style.lineHeight = '1.4';
    container.style.color = '#000';
    
    // Generate the HTML content
    container.innerHTML = this.generateHTMLContent(quote, customer, settings);
    
    // Append to body temporarily
    document.body.appendChild(container);
    
    try {
      // Convert HTML to canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794, // A4 width in pixels at 96 DPI
        height: 1123, // A4 height in pixels at 96 DPI
      });
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      // Return as blob
      return pdf.output('blob');
    } finally {
      // Clean up
      document.body.removeChild(container);
    }
  }

  public async downloadQuotePDF(
    quote: Quote, 
    customer: Customer, 
    settings: QuotationSettings | null
  ): Promise<void> {
    if (!settings) {
      throw new Error('Settings are required to generate PDF');
    }
    
    const blob = await this.generateQuotePDF(quote, customer, settings);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${quote.quoteNumber}_${(customer.company || 'Unknown').replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private generateHTMLContent(
    quote: Quote, 
    customer: Customer, 
    settings: QuotationSettings
  ): string {
    const statusLabels = {
      draft: 'Draft / مسودة',
      sent: 'Sent / مرسل',
      approved: 'Approved / موافق عليه',
      rejected: 'Rejected / مرفوض',
    };

    return `
      <div style="padding: 20mm; font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4; color: #000;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 2px solid #f97316; padding-bottom: 20px;">
          <div style="flex: 1;">
            <div style="width: 120px; height: 60px; background: url('/smaruniit_logo.png') no-repeat center; background-size: contain; margin-bottom: 15px;"></div>
            <div style="font-size: 11px; color: #666;">
              <p style="font-weight: bold; font-size: 16px; color: #000; margin: 0 0 8px 0;">
                ${settings.companyInfo.name}
              </p>
              <p style="margin: 0 0 4px 0; direction: rtl;">${settings.companyInfo.nameAr}</p>
              <p style="margin: 0 0 4px 0;">${settings.companyInfo.address}</p>
              <p style="margin: 0 0 4px 0; direction: rtl;">${settings.companyInfo.addressAr}</p>
              <p style="margin: 0 0 4px 0;">Phone: ${settings.companyInfo.phone}</p>
              <p style="margin: 0 0 4px 0;">Email: ${settings.companyInfo.email}</p>
              <p style="margin: 0 0 4px 0;">CR: ${settings.companyInfo.crNumber}</p>
              <p style="margin: 0;">VAT: ${settings.companyInfo.vatNumber}</p>
            </div>
          </div>
          <div style="text-align: right;">
            <h1 style="font-size: 28px; font-weight: bold; color: #f97316; margin: 0 0 8px 0;">QUOTATION</h1>
            <h2 style="font-size: 24px; font-weight: bold; color: #f97316; margin: 0 0 20px 0; direction: rtl;">عرض سعر</h2>
            <div style="font-size: 11px; color: #666;">
              <p style="margin: 0 0 4px 0;"><strong>Quote #:</strong> ${quote.quoteNumber || 'DRAFT'}</p>
              <p style="margin: 0 0 4px 0;"><strong>Date:</strong> ${format(quote.createdAt, 'dd/MM/yyyy')}</p>
              <p style="margin: 0 0 4px 0;"><strong>Valid Until:</strong> ${format(quote.validUntil, 'dd/MM/yyyy')}</p>
              <p style="margin: 0;"><strong>Status:</strong> ${statusLabels[quote.status]}</p>
            </div>
          </div>
        </div>

        <!-- Customer Details -->
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 16px; font-weight: bold; color: #000; margin: 0 0 12px 0; border-bottom: 1px solid #ccc; padding-bottom: 8px;">
            Bill To
          </h3>
          <div style="font-size: 11px; color: #666;">
            <p style="font-weight: bold; color: #000; margin: 0 0 4px 0;">${customer.company ? customer.company : (customer.name ? customer.name : 'Customer')}</p>
            <p style="margin: 0 0 4px 0;">${customer.name || ''}</p>
            <p style="margin: 0 0 4px 0;">${customer.email || ''}</p>
            <p style="margin: 0 0 4px 0;">${customer.phone || ''}</p>
            ${customer.address ? `<p style="margin: 0 0 4px 0;">${customer.address}</p>` : ''}
          </div>
        </div>

        <!-- Line Items Table -->
        <div style="margin-bottom: 30px;">
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #ccc;">
            <thead>
              <tr style="background-color: #fef3e2;">
                <th style="border: 1px solid #ccc; padding: 12px 8px; text-align: left; font-size: 11px; font-weight: bold;">
                  Description
                </th>
                <th style="border: 1px solid #ccc; padding: 12px 8px; text-align: center; font-size: 11px; font-weight: bold;">
                  Qty
                </th>
                <th style="border: 1px solid #ccc; padding: 12px 8px; text-align: right; font-size: 11px; font-weight: bold;">
                  Unit Price (SAR)
                </th>
                <th style="border: 1px solid #ccc; padding: 12px 8px; text-align: right; font-size: 11px; font-weight: bold;">
                  Total (SAR)
                </th>
              </tr>
            </thead>
            <tbody>
              ${quote.lineItems.map((item, index) => `
                <tr style="background-color: ${index % 2 === 0 ? '#f9f9f9' : '#fff'};">
                  <td style="border: 1px solid #ccc; padding: 12px 8px; font-size: 10px; vertical-align: top;">
                    <div>
                      <p style="font-weight: bold; color: #000; margin: 0 0 4px 0;">${item.name}</p>
                      ${item.nameAr ? `<p style="color: #666; font-size: 9px; margin: 0 0 4px 0; direction: rtl;">${item.nameAr}</p>` : ''}
                      <p style="color: #666; font-size: 9px; margin: 0 0 4px 0;">${item.description}</p>
                      ${item.descriptionAr ? `<p style="color: #666; font-size: 9px; margin: 0; direction: rtl;">${item.descriptionAr}</p>` : ''}
                    </div>
                  </td>
                  <td style="border: 1px solid #ccc; padding: 12px 8px; text-align: center; font-size: 10px;">
                    ${item.quantity}
                  </td>
                  <td style="border: 1px solid #ccc; padding: 12px 8px; text-align: right; font-size: 10px;">
                    ${(item.unitPrice || 0).toLocaleString()}
                  </td>
                  <td style="border: 1px solid #ccc; padding: 12px 8px; text-align: right; font-size: 10px; font-weight: bold;">
                    ${(item.total || 0).toLocaleString()}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Totals -->
        <div style="display: flex; justify-content: flex-end; margin-bottom: 30px;">
          <div style="width: 300px;">
            <div style="background-color: #f9f9f9; padding: 16px; border-radius: 8px; border: 1px solid #e5e5e5;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 11px; color: #666;">Subtotal:</span>
                <div style="display: flex; align-items: center;">
                  <img src="/Riyal_symbol.png" alt="SAR" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; margin-right: 4px;" />
                  <span style="font-size: 11px; font-weight: bold;">${Number(quote.subtotal || 0).toLocaleString()}</span>
                </div>
              </div>
              ${(quote.discountAmount && quote.discountAmount > 0) ? `
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 11px; color: #666;">Discount ${quote.discountType === 'percentage' ? `(${quote.discountValue}%)` : '(Fixed)'}:</span>
                <div style="display: flex; align-items: center;">
                  <span style="font-size: 11px; font-weight: bold; color: #059669;">-<img src="/Riyal_symbol.png" alt="SAR" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; margin-right: 4px;" />
                  ${Number(quote.discountAmount || 0).toLocaleString()}</span>
                </div>
              </div>
              ` : ''}
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 11px; color: #666;">VAT (${quote.vatRate || 15}%):</span>
                <div style="display: flex; align-items: center;">
                  <img src="/Riyal_symbol.png" alt="SAR" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; margin-right: 4px;" />
                  <span style="font-size: 11px; font-weight: bold;">${Number(quote.vatAmount || 0).toLocaleString()}</span>
                </div>
              </div>
              <div style="border-top: 1px solid #ccc; padding-top: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 14px; font-weight: bold; color: #000;">Total:</span>
                  <div style="display: flex; align-items: center;">
                    <img src="/Riyal_symbol.png" alt="SAR" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 4px;" />
                    <span style="font-size: 14px; font-weight: bold; color: #f97316;">${Number(quote.total || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Notes -->
        ${(quote.notes || quote.notesAr) ? `
          <div style="margin-bottom: 30px;">
            <h3 style="font-size: 16px; font-weight: bold; color: #000; margin: 0 0 12px 0; border-bottom: 1px solid #ccc; padding-bottom: 8px;">
              Terms & Conditions
            </h3>
            ${quote.notes ? `
              <div style="margin-bottom: 16px;">
                <p style="font-size: 10px; color: #666; white-space: pre-wrap; margin: 0;">${quote.notes}</p>
              </div>
            ` : ''}
            ${quote.notesAr ? `
              <div style="margin-bottom: 16px; direction: rtl;">
                <p style="font-size: 10px; color: #666; white-space: pre-wrap; margin: 0;">${quote.notesAr}</p>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- Footer -->
        <div style="border-top: 1px solid #ccc; padding-top: 20px; margin-top: 30px;">
          <div style="display: flex; justify-content: space-between;">
            <div style="flex: 1; margin-right: 30px;">
              <h4 style="font-weight: bold; color: #000; margin: 0 0 8px 0; font-size: 12px;">Acceptance</h4>
              <p style="font-size: 9px; color: #666; margin: 0 0 16px 0;">
                By signing below, you agree to the terms and conditions of this quotation.
              </p>
              <div style="border-top: 1px solid #ccc; padding-top: 8px;">
                <p style="font-size: 9px; color: #666; margin: 0;">Customer Signature & Date</p>
              </div>
            </div>
            <div style="text-align: right;">
              <h4 style="font-weight: bold; color: #000; margin: 0 0 8px 0; font-size: 12px;">Company Stamp</h4>
              <div style="height: 60px; width: 120px; border: 2px dashed #ccc; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 9px; color: #999;">Company Seal</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Banking Details -->
        ${settings.companyInfo.bankingDetails ? `
          <div style="border-top: 1px solid #ccc; padding-top: 20px; margin-top: 20px;">
            <h4 style="font-weight: bold; color: #000; margin: 0 0 12px 0; font-size: 12px;">Banking Details</h4>
            <div style="font-size: 10px; color: #666;">
              <p style="margin: 0 0 4px 0;"><strong>Bank Name:</strong> ${settings.companyInfo.bankingDetails.bankName}</p>
              <p style="margin: 0 0 4px 0;"><strong>IBAN:</strong> ${settings.companyInfo.bankingDetails.iban}</p>
              <p style="margin: 0;"><strong>Account Number:</strong> ${settings.companyInfo.bankingDetails.accountNumber}</p>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }
}

export const pdfGenerator = PDFGenerator.getInstance();