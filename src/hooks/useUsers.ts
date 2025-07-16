import { useState, useEffect } from 'react';
import { supabase, isConnectedToSupabase } from '../lib/supabase';
import { User } from '../types';
import { mockUsers, addMockUser, updateMockUser, deleteMockUser } from '../lib/mockDb';
import toast from 'react-hot-toast';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      if (!isConnectedToSupabase()) {
        // Use centralized mock data when Supabase is not connected
        setUsers([...mockUsers]); // Create a copy to avoid direct mutation
        return;
      }

      const { data, error } = await supabase!
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        // Fallback to mock data
        setUsers([...mockUsers]);
        return;
      }

      const formattedUsers: User[] = data.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar_url,
        phone: user.phone,
        department: user.department,
        status: user.status || 'active',
        createdAt: new Date(user.created_at),
        updatedAt: new Date(user.updated_at),
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error in fetchUsers:', error);
      // Fallback to mock data
      setUsers([...mockUsers]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendPasswordResetEmail = async (email: string, name: string) => {
    try {
      if (!isConnectedToSupabase()) {
        // Mock implementation - show success message
        toast.success(`Password reset email would be sent to ${email} in production`);
        return;
      }

      // Send invitation email using Supabase Auth
      const { data, error } = await supabase!.auth.admin.inviteUserByEmail(email, {
        data: {
          name: name,
          invited_by: 'admin'
        },
        redirectTo: `${window.location.origin}/auth/callback`
      });

      if (error) {
        console.error('Error sending invitation email:', error);
        
        // If admin.inviteUserByEmail is not available, try alternative approach
        if (error.message.includes('admin') || error.message.includes('permission')) {
          // Fallback: Use password reset for existing users or show instructions
          const { error: resetError } = await supabase!.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`
          });
          
          if (resetError) {
            throw new Error('Unable to send invitation email. Please check your Supabase configuration.');
          } else {
            toast.success(`Password setup email sent to ${email}`);
          }
        } else {
          throw error;
        }
      } else {
        toast.success(`Invitation email sent to ${email}. They can now set their password.`);
      }
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      toast.error(`Failed to send invitation email: ${error.message}`);
      throw error;
    }
  };

  const addUser = async (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (!isConnectedToSupabase()) {
        // Mock implementation when Supabase is not connected
        const newUser: User = {
          ...user,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        // Add to centralized mock data
        addMockUser(newUser);
        
        // Update local state
        setUsers(prev => [newUser, ...prev]);
        
        // Show mock success message
        toast.success(`User created successfully. In production, an invitation email would be sent to ${user.email}`);
        return newUser;
      }

      // First, create the user profile in the users table
      const { data, error } = await supabase!
        .from('users')
        .insert({
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          department: user.department,
          status: user.status,
          avatar_url: user.avatar,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user:', error);
        throw error;
      }

      const newUser: User = {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        avatar: data.avatar_url,
        phone: data.phone,
        department: data.department,
        status: data.status || 'active',
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      setUsers(prev => [newUser, ...prev]);

      // After successfully creating the user profile, send invitation email
      try {
        await sendPasswordResetEmail(user.email, user.name);
      } catch (emailError) {
        // User was created but email failed - still show success but mention email issue
        toast.warning('User created successfully, but invitation email could not be sent. Please manually provide login instructions.');
      }

      return newUser;
    } catch (error) {
      console.error('Error in addUser:', error);
      throw error;
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    try {
      if (!isConnectedToSupabase()) {
        // Mock implementation when Supabase is not connected
        updateMockUser(id, updates);
        setUsers(prev => prev.map(user => 
          user.id === id 
            ? { ...user, ...updates, updatedAt: new Date() }
            : user
        ));
        return;
      }

      const updateData: any = {};
      
      if (updates.email) updateData.email = updates.email;
      if (updates.name) updateData.name = updates.name;
      if (updates.role) updateData.role = updates.role;
      if (updates.phone) updateData.phone = updates.phone;
      if (updates.department) updateData.department = updates.department;
      if (updates.status) updateData.status = updates.status;
      if (updates.avatar) updateData.avatar_url = updates.avatar;

      const { error } = await supabase!
        .from('users')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating user:', error);
        throw error;
      }

      setUsers(prev => prev.map(user => 
        user.id === id 
          ? { ...user, ...updates, updatedAt: new Date() }
          : user
      ));
    } catch (error) {
      console.error('Error in updateUser:', error);
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      if (!isConnectedToSupabase()) {
        // Mock implementation when Supabase is not connected
        deleteMockUser(id);
        setUsers(prev => prev.filter(user => user.id !== id));
        return;
      }

      const { error } = await supabase!
        .from('users')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting user:', error);
        throw error;
      }

      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (error) {
      console.error('Error in deleteUser:', error);
      throw error;
    }
  };

  const resendInvitation = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) {
        throw new Error('User not found');
      }

      await sendPasswordResetEmail(user.email, user.name);
    } catch (error) {
      console.error('Error resending invitation:', error);
      throw error;
    }
  };

  return { 
    users, 
    isLoading, 
    addUser, 
    updateUser, 
    deleteUser, 
    resendInvitation,
    refetch: fetchUsers 
  };
}