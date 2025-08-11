import { useState, useEffect } from 'react';
import { Notification } from '../types';

// Mock notifications for demo
const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    title: 'New Task Assigned',
    message: 'You have been assigned a new task: "Network Security Review"',
    type: 'info',
    isRead: false,
    actionUrl: '/tasks',
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
  },
  {
    id: '2',
    userId: '1',
    title: 'Proposal Approved',
    message: 'Your proposal "Smart City IoT" has been approved by the client',
    type: 'success',
    isRead: false,
    actionUrl: '/proposals',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: '3',
    userId: '1',
    title: 'Invoice Overdue',
    message: 'Invoice #INV-2024-001 is now overdue',
    type: 'warning',
    isRead: true,
    actionUrl: '/invoices',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
];

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setNotifications(mockNotifications);
      setIsLoading(false);
    }, 500);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  };
}