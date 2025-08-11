import React, { useState } from 'react';
import { Bell, Check, CheckCheck, Trash2, Filter, Search } from 'lucide-react';

export function Notifications() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const notifications = [
    {
      id: '1',
      title: 'New Task Assigned',
      message: 'You have been assigned a new task: "Network Security Review"',
      type: 'info',
      isRead: false,
      actionUrl: '/tasks',
      createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    },
    {
      id: '2',
      title: 'Proposal Approved',
      message: 'Your proposal "Smart City IoT" has been approved by the client',
      type: 'success',
      isRead: false,
      actionUrl: '/proposals',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
      id: '3',
      title: 'Invoice Overdue',
      message: 'Invoice #INV-2024-001 is now overdue',
      type: 'warning',
      isRead: true,
      actionUrl: '/invoices',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    },
    {
      id: '4',
      title: 'Project Milestone Completed',
      message: 'Milestone "Phase 1 Implementation" has been completed',
      type: 'success',
      isRead: true,
      actionUrl: '/projects',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    },
    {
      id: '5',
      title: 'Budget Alert',
      message: 'Project "Digital Transformation" has exceeded 80% of allocated budget',
      type: 'warning',
      isRead: false,
      actionUrl: '/budget',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
    },
  ];

  const typeColors = {
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
  };

  const typeIcons = {
    info: '💡',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'unread' && !notification.isRead) ||
                         (filter === 'read' && notification.isRead) ||
                         notification.type === filter;
    
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Notifications</h1>
          <p className="text-dark-600">Stay updated with system activities and alerts</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <CheckCheck className="w-4 h-4" />
            <span>Mark All Read</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-600">Total</p>
              <p className="text-2xl font-bold text-dark-900">{notifications.length}</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <Bell className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-600">Unread</p>
              <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <Bell className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-600">Today</p>
              <p className="text-2xl font-bold text-blue-600">3</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-600">This Week</p>
              <p className="text-2xl font-bold text-green-600">12</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Bell className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-dark-600" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`bg-white rounded-xl shadow-sm border-l-4 p-6 hover:shadow-md transition-shadow ${
              !notification.isRead ? 'bg-blue-50 border-l-blue-500' : 'border-l-gray-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className={`p-2 rounded-lg border ${typeColors[notification.type]}`}>
                  <span className="text-lg">{typeIcons[notification.type]}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-dark-900">{notification.title}</h3>
                    {!notification.isRead && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-dark-600 mb-2">{notification.message}</p>
                  <p className="text-sm text-dark-500">{formatTimeAgo(notification.createdAt)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                {!notification.isRead && (
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {notification.actionUrl && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  View Details →
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-dark-900 mb-2">No notifications found</h3>
          <p className="text-dark-600">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}