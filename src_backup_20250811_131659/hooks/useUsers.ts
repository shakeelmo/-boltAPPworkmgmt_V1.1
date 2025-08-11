import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { User } from '../types';

// Transform backend data to frontend format
const transformUserData = (backendUser: any): User => {
  return {
    id: backendUser.id,
    name: backendUser.name,
    email: backendUser.email,
    role: backendUser.role,
    status: backendUser.status,
    phone: backendUser.phone,
    department: backendUser.department,
    avatar: backendUser.avatar,
    createdAt: new Date(backendUser.createdAt),
    updatedAt: new Date(backendUser.updatedAt),
  };
};

// Transform frontend data to backend format
const transformToBackendFormat = (frontendUser: any) => {
  return {
    name: frontendUser.name,
    email: frontendUser.email,
    password: frontendUser.password,
    role: frontendUser.role,
    phone: frontendUser.phone,
    department: frontendUser.department,
    status: frontendUser.status,
  };
};

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await api.getUsers();
      const transformedUsers = (response.users || []).map(transformUserData);
      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const addUser = async (user: any) => {
    try {
      console.log('Creating user with data:', user);
      const backendData = transformToBackendFormat(user);
      console.log('Transformed backend data:', backendData);
      
      const response = await api.createUser(backendData);
      console.log('API response:', response);
      
      const newUser = transformUserData(response.user);
      console.log('Transformed new user:', newUser);
      
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (error: any) {
      console.error('Error creating user:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw error;
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    try {
      const backendData = transformToBackendFormat(updates);
      const response = await api.updateUser(id, backendData);
      const updatedUser = transformUserData(response.user);
      setUsers(prev => prev.map(user => 
        user.id === id ? updatedUser : user
      ));
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await api.deleteUser(id);
      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  return { 
    users, 
    isLoading, 
    addUser, 
    updateUser, 
    deleteUser,
    refetch: fetchUsers
  };
}