import React, { useState, useEffect } from 'react';
import { X, Building2, Mail, Phone, Globe, MapPin, User, FileText } from 'lucide-react';
import { Vendor } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface CreateVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (vendor: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editVendor?: Vendor | null;
}

export function CreateVendorModal({ isOpen, onClose, onSubmit, editVendor }: CreateVendorModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    contactPerson: '',
    website: '',
    notes: '',
    offering: '',
    status: 'active' as Vendor['status'],
  });

  // Reset form when modal opens/closes or editVendor changes
  useEffect(() => {
    if (editVendor) {
      setFormData({
        name: editVendor.name,
        email: editVendor.email,
        phone: editVendor.phone || '',
        address: editVendor.address || '',
        contactPerson: editVendor.contactPerson || '',
        website: editVendor.website || '',
        notes: editVendor.notes || '',
        offering: editVendor.offering || '',
        status: editVendor.status,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        contactPerson: '',
        website: '',
        notes: '',
        offering: '',
        status: 'active',
      });
    }
  }, [editVendor, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const vendorData: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'> = {
      ...formData,
      createdBy: user?.id || '',
    };

    onSubmit(vendorData);
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-dark-900">
            {editVendor ? 'Edit Vendor' : 'Add New Vendor'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-dark-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-dark-700 mb-2">
                <Building2 className="w-4 h-4 inline mr-1" />
                Company Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter company name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label htmlFor="contactPerson" className="block text-sm font-medium text-dark-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Contact Person
              </label>
              <input
                type="text"
                id="contactPerson"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter contact person name"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-dark-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-dark-700 mb-2">
                <Globe className="w-4 h-4 inline mr-1" />
                Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label htmlFor="offering" className="block text-sm font-medium text-dark-700 mb-2">
                What does this vendor do? (Offerings, services, hardware, etc)
              </label>
              <input
                type="text"
                id="offering"
                name="offering"
                value={formData.offering}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g. IT Services, Hardware Supplier, Consulting, etc."
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-dark-700 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-dark-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Address
            </label>
            <textarea
              id="address"
              name="address"
              rows={3}
              value={formData.address}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter full address"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-dark-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Additional notes about the vendor"
            />
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-dark-600 hover:text-dark-800 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {editVendor ? 'Update Vendor' : 'Add Vendor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}