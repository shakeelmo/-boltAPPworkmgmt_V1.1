import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export function useInvoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.getInvoices();
      const formattedInvoices = response.invoices.map((invoice: any) => ({
        id: invoice.id,
        customerId: invoice.customer_id,
        projectId: invoice.project_id,
        quotationId: invoice.quotation_id,
        invoiceNumber: invoice.invoice_number,
        amount: invoice.amount,
        currency: invoice.currency,
        status: invoice.status,
        dueDate: new Date(invoice.due_date),
        paidDate: invoice.paid_date ? new Date(invoice.paid_date) : null,
        lineItems: invoice.lineItems?.map((item: any) => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          total: item.total,
        })) || [],
        notes: invoice.notes,
        createdAt: new Date(invoice.created_at),
        updatedAt: new Date(invoice.updated_at),
        createdBy: invoice.created_by,
        customerName: invoice.customer_name,
        projectTitle: invoice.project_title,
        createdByName: invoice.created_by_name,
      }));

      setInvoices(formattedInvoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setError('Failed to fetch invoices');
    } finally {
      setIsLoading(false);
    }
  };

  const addInvoice = async (invoice: any) => {
    try {
      setError(null);
      
      const invoiceData = {
        customer_id: invoice.customerId,
        project_id: invoice.projectId,
        quotation_id: invoice.quotationId,
        invoice_number: invoice.invoiceNumber,
        amount: invoice.amount,
        currency: invoice.currency,
        due_date: invoice.dueDate.toISOString().split('T')[0],
        lineItems: invoice.lineItems?.map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        })) || [],
      };

      const response = await api.createInvoice(invoiceData);
      
      // Refresh invoices list
      await fetchInvoices();
      return response.invoice;
    } catch (error) {
      console.error('Error creating invoice:', error);
      setError('Failed to create invoice');
      throw error;
    }
  };

  const updateInvoice = async (id: string, updates: any) => {
    try {
      setError(null);
      
      const updateData: any = {};
      
      if (updates.customerId) updateData.customer_id = updates.customerId;
      if (updates.projectId) updateData.project_id = updates.projectId;
      if (updates.quotationId) updateData.quotation_id = updates.quotationId;
      if (updates.invoiceNumber) updateData.invoice_number = updates.invoiceNumber;
      if (updates.amount !== undefined) updateData.amount = updates.amount;
      if (updates.currency) updateData.currency = updates.currency;
      if (updates.status) updateData.status = updates.status;
      if (updates.dueDate) updateData.due_date = updates.dueDate.toISOString().split('T')[0];
      if (updates.paidDate) updateData.paid_date = updates.paidDate.toISOString().split('T')[0];
      if (updates.notes) updateData.notes = updates.notes;

      await api.updateInvoice(id, updateData);
      
      // Refresh invoices list
      await fetchInvoices();
    } catch (error) {
      console.error('Error updating invoice:', error);
      setError('Failed to update invoice');
      throw error;
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      setError(null);
      
      await api.deleteInvoice(id);
      
      // Refresh invoices list
      await fetchInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      setError('Failed to delete invoice');
      throw error;
    }
  };

  return {
    invoices,
    isLoading,
    error,
    fetchInvoices,
    addInvoice,
    updateInvoice,
    deleteInvoice,
  };
}