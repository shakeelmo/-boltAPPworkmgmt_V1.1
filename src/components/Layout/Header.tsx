import React, { useState } from 'react';
import { Bell, Search, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';

export function Header() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div 
              className="w-12 h-12 rounded-full smart-universe-logo flex items-center justify-center overflow-hidden"
              style={{
                backgroundImage: `url(data:image/jpeg;base64,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)`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            />
            <div className="ml-3">
              <h1 className="text-xl smart-text">SMART</h1>
              <h2 className="text-lg universe-text -mt-1">UNIVERSE</h2>
              <p className="tagline-text">FOR COMMUNICATIONS AND INFORMATION TECHNOLOGY</p>
            </div>
          </div>
          <div className="hidden md:block">
            <h1 className="text-xl font-semibold text-dark-900">SmartUniit Task Flow</h1>
            <p className="text-sm text-dark-600">Business Workflow Management System</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search anything..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-dark-600 hover:text-dark-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-dark-900">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-dark-500">
                      No notifications
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${
                          !notification.isRead ? 'bg-blue-50' : ''
                        }`}
                      >
                        <h4 className="font-medium text-dark-900">{notification.title}</h4>
                        <p className="text-sm text-dark-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-dark-400 mt-2">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-4 border-t border-gray-200">
                  <button className="text-sm text-primary-600 hover:text-primary-700">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-dark-900">{user?.name}</p>
                <p className="text-xs text-dark-600 capitalize">{user?.role}</p>
              </div>
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <p className="font-medium text-dark-900">{user?.name}</p>
                  <p className="text-sm text-dark-600">{user?.email}</p>
                </div>
                <div className="py-2">
                  <button className="w-full px-4 py-2 text-left text-sm text-dark-700 hover:bg-gray-100 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-dark-700 hover:bg-gray-100 flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </button>
                  <hr className="my-2" />
                  <button
                    onClick={logout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}