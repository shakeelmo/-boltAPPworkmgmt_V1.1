import jsPDF from 'jspdf';
import { Proposal } from '../types/proposal';
import { format } from 'date-fns';

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