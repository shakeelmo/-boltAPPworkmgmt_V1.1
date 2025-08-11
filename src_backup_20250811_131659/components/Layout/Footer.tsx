import React from 'react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-6 mt-auto">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <span>© 2024 Smart Universe. All rights reserved.</span>
          <span>•</span>
          <span>Version 1.1.0</span>
        </div>
        <div className="flex items-center space-x-4">
          <a href="#" className="hover:text-primary-600 transition-colors">Privacy Policy</a>
          <span>•</span>
          <a href="#" className="hover:text-primary-600 transition-colors">Terms of Service</a>
          <span>•</span>
          <a href="#" className="hover:text-primary-600 transition-colors">Support</a>
        </div>
      </div>
    </footer>
  );
} 