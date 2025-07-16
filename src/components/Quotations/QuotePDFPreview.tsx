import React from 'react';
import { X, Download, Send, Loader } from 'lucide-react';
import { Quote } from '../../types/quotation';
import { Customer } from '../../types';
import { useQuotations } from '../../hooks/useQuotations';
import { format } from 'date-fns';
import { pdfGenerator } from '../../utils/pdfGenerator';

interface QuotePDFPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  quote: Quote;
  customer: Customer;
}

const RiyalSymbol = ({ className = "w-4 h-4" }: { className?: string }) => (
  <img 
    src="/Riyal_symbol.png" 
    alt="SAR" 
    className={`inline-block ${className}`}
    style={{ background: 'transparent' }}
  />
);

export function QuotePDFPreview({ isOpen, onClose, quote, customer }: QuotePDFPreviewProps) {
  const { settings } = useQuotations();
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      await pdfGenerator.downloadQuotePDF(quote, customer, settings);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = () => {
    // In a real implementation, this would send the quote via email
    console.log('Sending quote via email:', quote.quoteNumber);
    alert('Email functionality would be implemented here. Quote details have been logged to console.');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[95vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-dark-900">
            Quote Preview - {quote.quoteNumber}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSend}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{isGenerating ? 'Generating...' : 'Download PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-dark-600" />
            </button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto max-h-[calc(95vh-120px)] bg-gray-50">
          {/* PDF Content Preview */}
          <div className="bg-white p-8 shadow-lg max-w-3xl mx-auto" style={{ minHeight: '297mm' }}>
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <img 
                  src="/smaruniit_logo.png" 
                  alt="Smart Universe" 
                  className="h-16 w-auto mb-4"
                />
                <div className="text-sm text-dark-600">
                  <p className="font-semibold text-lg text-dark-900 mb-2">
                    {settings?.companyInfo?.name || 'Smart Universe Communication and Information Technology'}
                  </p>
                  <p className="mb-1">{settings?.companyInfo?.address || 'King Abdulaziz Road, Riyadh'}</p>
                  <p className="mb-1">Phone: {settings?.companyInfo?.phone || '+966 50 123 4567'}</p>
                  <p className="mb-1">Email: {settings?.companyInfo?.email || 'info@smartuniit.com'}</p>
                  <p className="mb-1">CR: {settings?.companyInfo?.crNumber || '1010123456'}</p>
                  <p>VAT: {settings?.companyInfo?.vatNumber || '300155266800003'}</p>
                </div>
              </div>
              <div className="text-right">
                <h1 className="text-3xl font-bold text-primary-600 mb-2">QUOTATION</h1>
                <div className="text-sm text-dark-600">
                  <p className="mb-1"><strong>Quote #:</strong> {quote.quoteNumber}</p>
                  <p className="mb-1"><strong>Date:</strong> {format(quote.createdAt, 'dd/MM/yyyy')}</p>
                  <p className="mb-1"><strong>Valid Until:</strong> {format(quote.validUntil, 'dd/MM/yyyy')}</p>
                  <p><strong>Status:</strong> {quote.status.toUpperCase()}</p>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-dark-900 mb-3 border-b border-gray-300 pb-2">
                Bill To
              </h3>
              <div className="text-sm text-dark-600">
                <p className="font-semibold text-dark-900 mb-1">{customer.company || 'No company'}</p>
                <p className="mb-1">{customer.name || 'No contact'}</p>
                <p className="mb-1">{customer.email || 'No email'}</p>
                <p className="mb-1">{customer.phone || 'No phone'}</p>
                {customer.address && <p className="mb-1">{customer.address}</p>}
              </div>
            </div>

            {/* Line Items */}
            <div className="mb-8">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-primary-50">
                    <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">
                      Description / الوصف
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold">
                      Qty / الكمية
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-right text-sm font-semibold">
                      Unit Price / سعر الوحدة (<RiyalSymbol className="w-3 h-3" />)
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-right text-sm font-semibold">
                      Total / المجموع (<RiyalSymbol className="w-3 h-3" />)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {quote.lineItems.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="border border-gray-300 px-4 py-3 text-sm">
                        <div>
                          <p className="font-medium text-dark-900">{item.name}</p>
                          {item.nameAr && <p className="text-dark-600 text-xs" dir="rtl">{item.nameAr}</p>}
                          <p className="text-dark-600 text-xs mt-1">{item.description}</p>
                          {item.descriptionAr && <p className="text-dark-600 text-xs" dir="rtl">{item.descriptionAr}</p>}
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center text-sm">
                        {item.quantity}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-right text-sm">
                        {item.unitPrice.toLocaleString()}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-right text-sm font-medium">
                        {item.total.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-80">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-dark-600">Subtotal:</span>
                    <span className="text-sm font-medium flex items-center">
                      <RiyalSymbol className="w-3 h-3 mr-1" />
                      {Number(quote.subtotal).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-dark-600">VAT ({quote.vatRate}%):</span>
                    <span className="text-sm font-medium flex items-center">
                      <RiyalSymbol className="w-3 h-3 mr-1" />
                      {Number(quote.vatAmount).toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t border-gray-300 pt-2">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-dark-900">Total:</span>
                      <span className="text-lg font-bold text-primary-600 flex items-center">
                        <RiyalSymbol className="w-4 h-4 mr-1" />
                        {Number(quote.total).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {(quote.notes || quote.notesAr) && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-dark-900 mb-3 border-b border-gray-300 pb-2">
                  Terms & Conditions / الشروط والأحكام
                </h3>
                {quote.notes && (
                  <div className="mb-4">
                    <p className="text-sm text-dark-600 whitespace-pre-wrap">{quote.notes}</p>
                  </div>
                )}
                {quote.notesAr && (
                  <div className="mb-4" dir="rtl">
                    <p className="text-sm text-dark-600 whitespace-pre-wrap">{quote.notesAr}</p>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-gray-300 pt-6 mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-dark-900 mb-2">Acceptance</h4>
                  <p className="text-xs text-dark-600 mb-4">
                    By signing below, you agree to the terms and conditions of this quotation.
                  </p>
                  <div className="border-t border-gray-300 pt-2">
                    <p className="text-xs text-dark-600">Customer Signature & Date</p>
                  </div>
                </div>
                <div className="text-right">
                  <h4 className="font-semibold text-dark-900 mb-2">Company Stamp</h4>
                  <div className="h-16 border border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <span className="text-xs text-dark-400">Company Seal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}