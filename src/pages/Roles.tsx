import React from 'react';
import { Shield, Users, Settings, Eye, Edit } from 'lucide-react';

export function Roles() {
  // Mock data
  const roles = [
    {
      id: '1',
      name: 'Super Admin',
      description: 'Full system access with all permissions',
      userCount: 1,
      permissions: ['All Permissions'],
    },
    {
      id: '2',
      name: 'Admin',
      description: 'Administrative access to most system features',
      userCount: 2,
      permissions: ['User Management', 'System Settings', 'All CRUD Operations'],
    },
    {
      id: '3',
      name: 'Manager',
      description: 'Project and team management capabilities',
      userCount: 5,
      permissions: ['Project Management', 'Team Management', 'Reports'],
    },
    {
      id: '4',
      name: 'Staff',
      description: 'Standard user access for daily operations',
      userCount: 12,
      permissions: ['View Projects', 'Manage Tasks', 'Create Reports'],
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Roles & Permissions</h1>
          <p className="text-dark-600">Manage user roles and their system permissions</p>
        </div>
        <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
          <Shield className="w-4 h-4" />
          <span>Create Role</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-600">Total Roles</p>
              <p className="text-2xl font-bold text-dark-900">{roles.length}</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <Shield className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-600">Total Users</p>
              <p className="text-2xl font-bold text-blue-600">
                {roles.reduce((sum, role) => sum + role.userCount, 0)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-600">Permission Sets</p>
              <p className="text-2xl font-bold text-green-600">24</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Settings className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((role) => (
          <div key={role.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-dark-900">{role.name}</h3>
                  <p className="text-sm text-dark-600">{role.description}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-dark-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-600">Users with this role:</span>
                <span className="text-sm font-medium text-dark-900">{role.userCount}</span>
              </div>
              
              <div>
                <span className="text-sm text-dark-600 block mb-2">Key Permissions:</span>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.map((permission, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  Manage Permissions
                </button>
                <button className="text-dark-600 hover:text-dark-800 text-sm">
                  View Users
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Permission Matrix */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-dark-900 mb-4">Permission Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-dark-700">Resource</th>
                <th className="text-center py-3 px-4 font-medium text-dark-700">Super Admin</th>
                <th className="text-center py-3 px-4 font-medium text-dark-700">Admin</th>
                <th className="text-center py-3 px-4 font-medium text-dark-700">Manager</th>
                <th className="text-center py-3 px-4 font-medium text-dark-700">Staff</th>
              </tr>
            </thead>
            <tbody>
              {[
                'User Management',
                'Vendor Management',
                'Customer Management',
                'Project Management',
                'Task Management',
                'Financial Management',
                'Reports & Analytics',
                'System Settings',
              ].map((resource, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-sm text-dark-900">{resource}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="w-4 h-4 bg-green-500 rounded-full inline-block"></span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`w-4 h-4 ${index < 6 ? 'bg-green-500' : 'bg-red-500'} rounded-full inline-block`}></span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`w-4 h-4 ${index < 4 ? 'bg-green-500' : 'bg-red-500'} rounded-full inline-block`}></span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`w-4 h-4 ${index < 2 ? 'bg-green-500' : 'bg-red-500'} rounded-full inline-block`}></span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}