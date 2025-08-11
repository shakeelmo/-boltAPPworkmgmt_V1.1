import React, { useState } from 'react';
import { Plus, Search, Filter, Building2, Phone, Mail, Globe, MoreHorizontal, Download } from 'lucide-react';
import { useVendors } from '../hooks/useVendors';
import { CreateVendorModal } from '../components/Vendors/CreateVendorModal';
import { VendorCard } from '../components/Vendors/VendorCard';
import { Vendor } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

export function Vendors() {
  const { vendors, addVendor, updateVendor, deleteVendor, isLoading } = useVendors();
  const { user, hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Debug user and permissions
  console.log('Current user:', user);
  console.log('User has vendor create permission:', hasPermission('vendors', 'create'));
  console.log('User has vendor read permission:', hasPermission('vendors', 'read'));

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (vendor.contactPerson && vendor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (vendor.offering && vendor.offering.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (vendorData: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingVendor) {
        // Update existing vendor
        await updateVendor(editingVendor.id, vendorData);
        setEditingVendor(null);
      } else {
        // Create new vendor
        console.log('Creating vendor with data:', vendorData);
        await addVendor(vendorData);
        console.log('Vendor created successfully');
      }
    } catch (error) {
      console.error('Error handling vendor submission:', error);
      alert('Failed to save vendor. Please try again.');
    }
  };

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setIsCreateModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        await deleteVendor(id);
      } catch (error) {
        console.error('Error deleting vendor:', error);
        alert('Failed to delete vendor. Please try again.');
      }
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await api.exportVendors();
    } catch (error) {
      console.error('Error exporting vendors:', error);
      alert('Failed to export vendors. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const isSuperAdmin = user?.role === 'superadmin';

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-dark-900">Vendors</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Vendor
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search vendors by name, email, contact person, or offering..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            
            {/* Export button - only for superadmin */}
            {isSuperAdmin && (
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {isExporting ? 'Exporting...' : 'Export Excel'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing {filteredVendors.length} of {vendors.length} vendors
        </p>
      </div>

      {/* Vendors Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredVendors.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No vendors found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating your first vendor.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              onEdit={() => handleEdit(vendor)}
              onDelete={() => handleDelete(vendor.id)}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <CreateVendorModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingVendor(null);
        }}
        onSubmit={handleSubmit}
        editVendor={editingVendor}
      />
    </div>
  );
}