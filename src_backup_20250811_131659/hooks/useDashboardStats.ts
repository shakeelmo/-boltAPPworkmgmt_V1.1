import { useState, useEffect } from 'react';
import { DashboardStats } from '../types';

// Mock dashboard stats
const mockStats: DashboardStats = {
  vendors: {
    total: 15,
    active: 12,
    inactive: 3,
  },
  customers: {
    total: 28,
    active: 25,
    inactive: 3,
  },
  proposals: {
    total: 42,
    draft: 8,
    submitted: 15,
    approved: 12,
    rejected: 7,
  },
  projects: {
    total: 18,
    active: 8,
    completed: 7,
    onHold: 3,
  },
  tasks: {
    total: 156,
    todo: 45,
    inProgress: 32,
    done: 79,
  },
  invoices: {
    total: 89,
    paid: 67,
    pending: 15,
    overdue: 7,
    totalAmount: 2450000, // $2.45M
  },
};

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats(mockStats);
      setIsLoading(false);
    }, 500);
  }, []);

  return { stats, isLoading };
}