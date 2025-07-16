import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Quote, Service, QuotationSettings } from '../types/quotation';
import { Customer } from '../types';

// Mock data for when Supabase is not connected
const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@techsolutions.com',
    phone: '+966 50 123 4567',
    company: 'Tech Solutions Ltd',
    address: 'King Abdulaziz Road, Riyadh',
    status: 'active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    createdBy: '1',
  },
];

const mockServices: Service[] = [
  {
    id: '1',
    name: 'Web Development',
    nameAr: 'تطوير المواقع',
    description: 'Custom website development services',
    descriptionAr: 'خدمات تطوير المواقع المخصصة',
    defaultPrice: 5000,
    category: 'Development',
    isActive: true,
  },
  {
    id: '2',
    name: 'Mobile App Development',
    nameAr: 'تطوير تطبيقات الجوال',
    description: 'iOS and Android app development',
    descriptionAr: 'تطوير تطبيقات iOS و Android',
    defaultPrice: 8000,
    category: 'Development',
    isActive: true,
  },
];

export function useQuotations() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [settings, setSettings] = useState<QuotationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        fetchQuotes(),
        fetchCustomers(),
        fetchServices(),
        fetchSettings(),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuotes = async () => {
    try {
      setIsLoading(true);
      const { quotations } = await api.getQuotations();
      setQuotes(quotations.map((q: any) => {
        // Calculate totals from line items if not provided
        const lineItems = (q.lineItems || q.line_items || []).map((item: any) => ({
          id: item.id,
          serviceId: item.service_id || item.serviceId || '',
          name: item.name || item.description || '',
          nameAr: item.nameAr || item.name_ar || '',
          description: item.description || '',
          descriptionAr: item.descriptionAr || item.description_ar || '',
          quantity: item.quantity || 0,
          unitPrice: item.unit_price || item.unitPrice || 0,
          total: item.total || 0,
        }));

        const subtotal = lineItems.reduce((sum: number, item: any) => sum + (item.total || 0), 0);
        const vatRate = q.vat_rate || q.vatRate || 15;
        const vatAmount = q.vat_amount || q.vatAmount || (subtotal * vatRate / 100);
        const total = q.total || q.amount || (subtotal + vatAmount);

        return {
          id: q.id,
          quoteNumber: q.quote_number || q.quoteNumber || `Q-${q.id}`,
          customerId: String(q.customer_id || q.customerId || ''),
          status: q.status || 'draft',
          lineItems,
          subtotal,
          discountType: q.discount_type || q.discountType || 'percentage',
          discountValue: q.discount_value || q.discountValue || 0,
          discountAmount: q.discount_amount || q.discountAmount || 0,
          vatRate,
          vatAmount,
          total,
          validUntil: q.valid_until ? new Date(q.valid_until) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          notes: q.terms || q.notes || '',
          notesAr: q.notesAr || q.notes_ar || '',
          assignedTo: q.assignedTo || q.assigned_to || '',
          createdBy: q.created_by || q.createdBy || '',
          createdAt: new Date(q.created_at || q.createdAt || Date.now()),
          updatedAt: new Date(q.updated_at || q.updatedAt || Date.now()),
        };
      }));
    } catch (error) {
      console.error('Error fetching quotations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const { customers } = await api.getCustomers();
      setCustomers(customers);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchServices = async () => {
    // Remove supabase logic, use mockServices for now
    setServices(mockServices);
  };

  const fetchSettings = async () => {
    try {
      const response = await api.getCompanySettings() as any;
      const settings = response.settings;
      setSettings({
        vatRate: settings.vatRate || 15,
        companyInfo: {
          name: settings.name,
          nameAr: settings.nameAr,
          address: settings.address,
          addressAr: settings.addressAr,
          phone: settings.phone,
          email: settings.email,
          crNumber: settings.crNumber,
          vatNumber: settings.vatNumber,
          bankingDetails: settings.bankingDetails,
        },
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Fallback to default settings
      setSettings({
        vatRate: 15,
        companyInfo: {
          name: 'Smart Universe Communication and Information Technology',
          nameAr: 'مؤسسة الكون الذكي للاتصالات و تقنية المعلومات',
          address: 'King Abdulaziz Road, Riyadh',
          addressAr: 'طريق الملك عبدالعزيز، الرياض',
          phone: '+966 50 123 4567',
          email: 'info@smartuniit.com',
          crNumber: '1010123456',
          vatNumber: '300155266800003',
          bankingDetails: {
            bankName: 'Saudi National Bank',
            iban: 'SA3610000041000000080109',
            accountNumber: '41000000080109'
          },
        },
      });
    }
  };

  const addQuote = async (quote: Omit<Quote, 'id' | 'createdAt' | 'updatedAt' | 'quoteNumber'>) => {
    try {
      const payload = {
        proposal_id: null, // No proposal linking for now
        customerId: quote.customerId,
        customer_id: quote.customerId,
        amount: quote.total,
        currency: 'SAR',
        valid_until: quote.validUntil,
        terms: quote.notes,
        lineItems: quote.lineItems,
        discountType: quote.discountType,
        discountValue: quote.discountValue,
        discountAmount: quote.discountAmount,
      };
      const { quotation } = await api.createQuotation(payload);
      await fetchQuotes();
      return quotation;
    } catch (error) {
      throw error;
    }
  };

  const updateQuote = async (id: string, updates: Partial<Quote>) => {
    try {
      // Always send amount to backend, and validate it exists
      const amount = updates.total;
      if (amount === undefined || amount === null) {
        throw new Error('Total is required to update a quotation.');
      }
      const payload = {
        ...updates,
        customerId: updates.customerId,
        customer_id: updates.customerId,
        amount,
        discountType: updates.discountType,
        discountValue: updates.discountValue,
        discountAmount: updates.discountAmount,
      };
      const { quotation } = await api.updateQuotation(id, payload);
      await fetchQuotes();
      return quotation;
    } catch (error) {
      console.error('Error updating quotation:', error);
      throw error;
    }
  };

  const deleteQuote = async (id: string) => {
    try {
      await api.deleteQuotation(id);
      await fetchQuotes();
    } catch (error) {
      console.error('Error deleting quotation:', error);
      throw error;
    }
  };

  const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCustomers(prev => [...prev, newCustomer]);
    return newCustomer;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(customer => 
      customer.id === id 
        ? { ...customer, ...updates, updatedAt: new Date() }
        : customer
    ));
  };

  const duplicateQuote = async (quoteId: string) => {
    const originalQuote = quotes.find(q => q.id === quoteId);
    if (originalQuote) {
      const duplicatedQuote = {
        ...originalQuote,
        status: 'draft' as const,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      };
      delete (duplicatedQuote as any).id;
      delete (duplicatedQuote as any).quoteNumber;
      delete (duplicatedQuote as any).createdAt;
      delete (duplicatedQuote as any).updatedAt;
      return await addQuote(duplicatedQuote);
    }
  };

  return {
    quotes,
    customers,
    services,
    settings,
    isLoading,
    addQuote,
    updateQuote,
    deleteQuote,
    duplicateQuote,
    addCustomer,
    updateCustomer,
    refetch: fetchAllData,
  };
}