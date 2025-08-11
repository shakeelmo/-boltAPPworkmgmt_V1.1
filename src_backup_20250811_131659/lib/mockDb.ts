import { User, Customer, Vendor } from '../types';

// Centralized mock database - all mock data is stored here
// This ensures consistency across all parts of the application

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@smartuniit.com',
    name: 'Ahmed Al-Rashid',
    role: 'admin',
    status: 'active',
    phone: '+966 11 123 4567',
    department: 'Management',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    email: 'manager@smartuniit.com',
    name: 'Fatima Al-Zahra',
    role: 'manager',
    status: 'active',
    phone: '+966 11 234 5678',
    department: 'Operations',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
  },
  {
    id: '3',
    email: 'tech@smartuniit.com',
    name: 'Omar Hassan',
    role: 'staff',
    status: 'active',
    phone: '+966 11 345 6789',
    department: 'Technical',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
];

export const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Saudi Telecom Company',
    email: 'contact@stc.com.sa',
    phone: '+966 11 123 4567',
    company: 'STC',
    address: 'King Fahd Road, Riyadh 12345, Saudi Arabia',
    status: 'active',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    createdBy: '1',
  },
  {
    id: '2',
    name: 'SABIC Industries',
    email: 'info@sabic.com',
    phone: '+966 13 987 6543',
    company: 'SABIC',
    address: 'Prince Sultan Road, Dammam 31411, Saudi Arabia',
    status: 'active',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    createdBy: '1',
  },
  {
    id: '3',
    name: 'ARAMCO Digital',
    email: 'digital@aramco.com',
    phone: '+966 12 555 7890',
    company: 'ARAMCO',
    address: 'Tahlia Street, Jeddah 21461, Saudi Arabia',
    status: 'active',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-25'),
    createdBy: '1',
  },
];

export const mockVendors: Vendor[] = [
  {
    id: '1',
    name: 'TechCorp Solutions',
    email: 'contact@techcorp.com',
    phone: '+966 11 123 4567',
    address: 'King Fahd Road, Riyadh 12345, Saudi Arabia',
    contactPerson: 'Ahmed Al-Rashid',
    website: 'https://techcorp.com',
    notes: 'Reliable IT infrastructure provider with 10+ years experience',
    status: 'active',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    createdBy: '1',
  },
  {
    id: '2',
    name: 'CloudNet Services',
    email: 'info@cloudnet.sa',
    phone: '+966 13 987 6543',
    address: 'Prince Sultan Road, Dammam 31411, Saudi Arabia',
    contactPerson: 'Fatima Al-Zahra',
    website: 'https://cloudnet.sa',
    notes: 'Specialized in cloud migration and managed services',
    status: 'active',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    createdBy: '1',
  },
  {
    id: '3',
    name: 'SecureIT Arabia',
    email: 'sales@secureit.com.sa',
    phone: '+966 12 555 7890',
    address: 'Tahlia Street, Jeddah 21461, Saudi Arabia',
    contactPerson: 'Omar Hassan',
    website: 'https://secureit.com.sa',
    notes: 'Cybersecurity specialists, certified partners',
    status: 'inactive',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-25'),
    createdBy: '1',
  },
];

// Helper functions for mock data operations
export const addMockUser = (user: User): void => {
  mockUsers.unshift(user); // Add to beginning of array
};

export const updateMockUser = (id: string, updates: Partial<User>): void => {
  const index = mockUsers.findIndex(user => user.id === id);
  if (index !== -1) {
    mockUsers[index] = { ...mockUsers[index], ...updates, updatedAt: new Date() };
  }
};

export const deleteMockUser = (id: string): void => {
  const index = mockUsers.findIndex(user => user.id === id);
  if (index !== -1) {
    mockUsers.splice(index, 1);
  }
};

export const addMockCustomer = (customer: Customer): void => {
  mockCustomers.unshift(customer);
};

export const updateMockCustomer = (id: string, updates: Partial<Customer>): void => {
  const index = mockCustomers.findIndex(customer => customer.id === id);
  if (index !== -1) {
    mockCustomers[index] = { ...mockCustomers[index], ...updates, updatedAt: new Date() };
  }
};

export const deleteMockCustomer = (id: string): void => {
  const index = mockCustomers.findIndex(customer => customer.id === id);
  if (index !== -1) {
    mockCustomers.splice(index, 1);
  }
};

export const addMockVendor = (vendor: Vendor): void => {
  mockVendors.unshift(vendor);
};

export const updateMockVendor = (id: string, updates: Partial<Vendor>): void => {
  const index = mockVendors.findIndex(vendor => vendor.id === id);
  if (index !== -1) {
    mockVendors[index] = { ...mockVendors[index], ...updates, updatedAt: new Date() };
  }
};

export const deleteMockVendor = (id: string): void => {
  const index = mockVendors.findIndex(vendor => vendor.id === id);
  if (index !== -1) {
    mockVendors.splice(index, 1);
  }
};