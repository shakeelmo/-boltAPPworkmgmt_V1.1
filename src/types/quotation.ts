import { Customer } from './index';

export interface QuoteLineItem {
  id: string;
  serviceId?: string;
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  customerId: string;
  customer?: Customer;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  lineItems: QuoteLineItem[];
  subtotal: number;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  discountAmount?: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  validUntil: Date;
  notes?: string;
  notesAr?: string;
  assignedTo?: string;
  signatureUrl?: string;
  stampUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface Service {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  defaultPrice: number;
  category: string;
  isActive: boolean;
}

export interface QuotationSettings {
  vatRate: number;
  companyInfo: {
    name: string;
    nameAr: string;
    address: string;
    addressAr: string;
    phone: string;
    email: string;
    crNumber: string;
    vatNumber: string;
    logo?: string;
    bankingDetails?: {
      bankName: string;
      iban: string;
      accountNumber: string;
    };
  };
}