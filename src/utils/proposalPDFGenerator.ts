import jsPDF from 'jspdf';
import { Proposal } from '../types/proposal';
import { format } from 'date-fns';
// User's exact Smart Universe logo - using the provided base64 data URL
const SMART_UNIVERSE_LOGO_BASE64 = "data:image/jpeg;base64,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";

export class ProposalPDFGenerator {
  private static instance: ProposalPDFGenerator;
  
  public static getInstance(): ProposalPDFGenerator {
    if (!ProposalPDFGenerator.instance) {
      ProposalPDFGenerator.instance = new ProposalPDFGenerator();
    }
    return ProposalPDFGenerator.instance;
  }

  public async generateProposalPDF(proposal: Proposal, customer: any): Promise<void> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Add user's exact Smart Universe logo to PDF (top left corner)
    try {
      pdf.addImage(SMART_UNIVERSE_LOGO_BASE64, 'JPEG', 20, 20, 20, 20);
    } catch (error) {
      console.error('Error adding logo to PDF:', error);
    }

    // Helper function to add new page if needed
    const checkPageBreak = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
        return true;
      }
      return false;
    };

    // Helper function to add text with word wrap
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
      pdf.setFontSize(fontSize);
      const lines = pdf.splitTextToSize(text, maxWidth);
      pdf.text(lines, x, y);
      return lines.length * (fontSize * 0.35);
    };

    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PROPOSAL', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Document Control Section
    checkPageBreak(30);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DOCUMENT CONTROL', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Document Number: ${proposal.documentControl.documentNumber}`, 20, yPosition);
    yPosition += 5;
    pdf.text(`Version: ${proposal.documentControl.version}`, 20, yPosition);
    yPosition += 5;
    pdf.text(`Date: ${format(proposal.documentControl.date, 'dd/MM/yyyy')}`, 20, yPosition);
    yPosition += 5;
    pdf.text(`Prepared By: ${proposal.documentControl.preparedBy}`, 20, yPosition);
    yPosition += 15;

    // Table of Contents
    checkPageBreak(50);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TABLE OF CONTENTS', 20, yPosition);
    yPosition += 10;

    const tocItems = [
      '1. DOCUMENT PROPERTY',
      '2. CONFIDENTIALITY AGREEMENT',
      '3. INTRODUCTION',
      '4. UNDERSTANDING TO CUSTOMER REQUIREMENT',
      '5. CUSTOMER PREREQUISITES',
      '6. DELIVERABLES SCOPE',
      '7. ADDITIONAL CONDITIONS AND ASSUMPTIONS',
      '8. COMMERCIAL PROPOSAL',
      '9. PAYMENT TERMS & CONDITIONS',
      '10. DURATION OF PROJECT',
      '11. SOW ACCEPTANCE',
    ];

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    tocItems.forEach((item, index) => {
      pdf.text(item, 25, yPosition);
      yPosition += 5;
    });
    yPosition += 10;

    // Introduction Section
    checkPageBreak(40);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('3. INTRODUCTION', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(12);
    pdf.text('Document Purpose', 20, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    yPosition += addWrappedText(proposal.introduction.documentPurpose, 20, yPosition, pageWidth - 40);
    yPosition += 10;

    // Understanding Requirements Section
    checkPageBreak(40);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('4. UNDERSTANDING TO CUSTOMER REQUIREMENT', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('The Project high level scope understanding are as follows:', 20, yPosition);
    yPosition += 8;

    yPosition += addWrappedText(proposal.requirementUnderstanding.projectScope, 20, yPosition, pageWidth - 40);
    yPosition += 10;

    // Customer Prerequisites Section
    checkPageBreak(40);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('5. CUSTOMER PREREQUISITES', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    proposal.customerPrerequisites.items.forEach((item, index) => {
      checkPageBreak(10);
      pdf.text(`${index + 1}. ${item.description}`, 25, yPosition);
      yPosition += 6;
    });
    yPosition += 10;

    // Deliverables Section
    checkPageBreak(40);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('6. DELIVERABLES SCOPE', 20, yPosition);
    yPosition += 10;

    proposal.deliverables.forEach((deliverable, index) => {
      checkPageBreak(30);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`6.${index + 1} ${deliverable.title}:`, 20, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('• Task Requirements:', 25, yPosition);
      yPosition += 6;

      deliverable.tasks.forEach((task) => {
        checkPageBreak(15);
        pdf.text(`o ${task.description}`, 30, yPosition);
        yPosition += 5;
        
        task.details.forEach((detail) => {
          checkPageBreak(8);
          yPosition += addWrappedText(`  - ${detail}`, 35, yPosition, pageWidth - 70, 9);
          yPosition += 2;
        });
        yPosition += 3;
      });
      yPosition += 10;
    });

    // Additional Conditions Section
    checkPageBreak(40);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('7. ADDITIONAL CONDITIONS AND ASSUMPTIONS', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    proposal.additionalConditions.forEach((condition, index) => {
      checkPageBreak(15);
      yPosition += addWrappedText(`${index + 1}. ${condition.condition}`, 25, yPosition, pageWidth - 50);
      yPosition += 5;
    });
    yPosition += 10;

    // Commercial Proposal Section
    checkPageBreak(60);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('8. COMMERCIAL PROPOSAL:', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(12);
    pdf.text('ESTIMATED COST', 20, yPosition);
    yPosition += 10;

    // Commercial Table
    const tableStartY = yPosition;
    const colWidths = [15, 80, 20, 15, 25, 25];
    const headers = ['S.No', 'Description', 'Quantity', 'Units', 'Unit Price', 'Total'];
    
    // Table headers
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    let xPos = 20;
    headers.forEach((header, index) => {
      pdf.rect(xPos, yPosition, colWidths[index], 8);
      pdf.text(header, xPos + 2, yPosition + 5);
      xPos += colWidths[index];
    });
    yPosition += 8;

    // Table rows
    pdf.setFont('helvetica', 'normal');
    proposal.commercialProposal.items.forEach((item) => {
      checkPageBreak(8);
      xPos = 20;
      
      // S.No
      pdf.rect(xPos, yPosition, colWidths[0], 8);
      pdf.text(item.serialNumber.toString(), xPos + 2, yPosition + 5);
      xPos += colWidths[0];
      
      // Description
      pdf.rect(xPos, yPosition, colWidths[1], 8);
      const descLines = pdf.splitTextToSize(item.description, colWidths[1] - 4);
      pdf.text(descLines[0], xPos + 2, yPosition + 5);
      xPos += colWidths[1];
      
      // Quantity
      pdf.rect(xPos, yPosition, colWidths[2], 8);
      pdf.text(item.quantity.toString(), xPos + 2, yPosition + 5);
      xPos += colWidths[2];
      
      // Units
      pdf.rect(xPos, yPosition, colWidths[3], 8);
      pdf.text(item.unit, xPos + 2, yPosition + 5);
      xPos += colWidths[3];
      
      // Unit Price
      pdf.rect(xPos, yPosition, colWidths[4], 8);
      pdf.text(item.unitPrice.toString(), xPos + 2, yPosition + 5);
      xPos += colWidths[4];
      
      // Total
      pdf.rect(xPos, yPosition, colWidths[5], 8);
      pdf.text(item.total.toLocaleString(), xPos + 2, yPosition + 5);
      
      yPosition += 8;
    });

    // Totals
    yPosition += 5;
    const totalStartX = pageWidth - 80;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Total', totalStartX, yPosition);
    pdf.text(proposal.commercialProposal.subtotal.toLocaleString(), totalStartX + 40, yPosition);
    yPosition += 6;
    pdf.text(`VAT (${proposal.commercialProposal.vatRate}%)`, totalStartX, yPosition);
    pdf.text(proposal.commercialProposal.vatAmount.toLocaleString(), totalStartX + 40, yPosition);
    yPosition += 6;
    pdf.text(`Grand Total (in ${proposal.commercialProposal.currency})`, totalStartX, yPosition);
    pdf.text(proposal.commercialProposal.total.toLocaleString(), totalStartX + 40, yPosition);
    yPosition += 15;

    // Payment Terms Section
    checkPageBreak(30);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('9. PAYMENT TERMS & CONDITIONS', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    proposal.paymentTerms.milestones.forEach((milestone, index) => {
      checkPageBreak(10);
      pdf.text(`${milestone.description}: ${milestone.percentage}% (${milestone.amount.toLocaleString()} ${proposal.paymentTerms.currency})`, 25, yPosition);
      yPosition += 6;
      milestone.conditions.forEach((condition) => {
        pdf.text(`- ${condition}`, 30, yPosition);
        yPosition += 5;
      });
      yPosition += 3;
    });
    yPosition += 10;

    // Project Duration Section
    checkPageBreak(20);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('10. DURATION OF PROJECT', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`This project is expected to be completed within ${proposal.projectDuration.totalDays} days.`, 20, yPosition);
    yPosition += 15;

    // SOW Acceptance Section
    checkPageBreak(30);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('11. SOW ACCEPTANCE', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const acceptanceText = 'By signing this document, the SOW document is officially approved and acknowledged as the only document that defines the project scope based on the signed contract.';
    yPosition += addWrappedText(acceptanceText, 20, yPosition, pageWidth - 40);
    yPosition += 20;

    // Signature Section
    checkPageBreak(40);
    pdf.line(20, yPosition, 80, yPosition);
    pdf.text('Customer Signature & Date', 20, yPosition + 5);
    
    pdf.line(pageWidth - 80, yPosition, pageWidth - 20, yPosition);
    pdf.text('Company Signature & Date', pageWidth - 80, yPosition + 5);

    // Save the PDF
    const filename = `Proposal_${proposal.title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    pdf.save(filename);
  }
}

export const proposalPDFGenerator = ProposalPDFGenerator.getInstance();