import React from 'react';
import { Building2, Phone, Mail, Globe, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Vendor } from '../../types';

interface VendorCardProps {
  vendor: Vendor;
  onEdit: (vendor: Vendor) => void;
  onDelete: (vendorId: string) => void;
}

export function VendorCard({ vendor, onEdit, onDelete }: VendorCardProps) {
  const [showActions, setShowActions] = React.useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-dark-900">{vendor.name}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              vendor.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {vendor.status}
            </span>
          </div>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreHorizontal className="w-4 h-4 text-dark-600" />
          </button>
          
          {showActions && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              <button
                onClick={() => {
                  onEdit(vendor);
                  setShowActions(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-dark-700 hover:bg-gray-100 flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </button>
              <button
                onClick={() => {
                  onDelete(vendor.id);
                  setShowActions(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {vendor.contactPerson && (
          <div className="flex items-center text-sm text-dark-600">
            <span className="font-medium">Contact:</span>
            <span className="ml-2">{vendor.contactPerson}</span>
          </div>
        )}
        
        <div className="flex items-center text-sm text-dark-600">
          <Mail className="w-4 h-4 mr-2" />
          <a href={`mailto:${vendor.email}`} className="hover:text-primary-600">
            {vendor.email}
          </a>
        </div>
        
        {vendor.phone && (
          <div className="flex items-center text-sm text-dark-600">
            <Phone className="w-4 h-4 mr-2" />
            <a href={`tel:${vendor.phone}`} className="hover:text-primary-600">
              {vendor.phone}
            </a>
          </div>
        )}
        
        {vendor.website && (
          <div className="flex items-center text-sm text-dark-600">
            <Globe className="w-4 h-4 mr-2" />
            <a 
              href={vendor.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-primary-600"
            >
              {vendor.website}
            </a>
          </div>
        )}
        
        {vendor.offering && (
          <div className="text-sm text-dark-600">
            <span className="font-medium">Offering:</span>
            <span className="ml-2">{vendor.offering}</span>
          </div>
        )}
        
        {vendor.address && (
          <div className="text-sm text-dark-600">
            <span className="font-medium">Address:</span>
            <p className="mt-1">{vendor.address}</p>
          </div>
        )}
        
        {vendor.notes && (
          <div className="text-sm text-dark-600">
            <span className="font-medium">Notes:</span>
            <p className="mt-1 line-clamp-2">{vendor.notes}</p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-dark-500">
          Added {new Date(vendor.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}