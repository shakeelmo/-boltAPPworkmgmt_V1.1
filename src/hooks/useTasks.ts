import { useState, useEffect } from 'react';
import { supabase, isConnectedToSupabase } from '../lib/supabase';
import { Task } from '../types';

// Mock data for when Supabase is not connected
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Setup Development Environment',
    description: 'Configure development tools and environment',
    projectId: '1',
    assignedTo: 'user1',
    status: 'in-progress',
    priority: 'high',
    dueDate: new Date('2024-02-15'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    title: 'Design Database Schema',
    description: 'Create comprehensive database design',
    projectId: '1',
    assignedTo: 'user2',
    status: 'todo',
    priority: 'medium',
    dueDate: new Date('2024-02-20'),
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
  },
];

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      
      if (!isConnectedToSupabase()) {
        // Use mock data when Supabase is not connected
        setTasks(mockTasks);
        return;
      }

      const { data, error } = await supabase!
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
        return;
      }

      const formattedTasks: Task[] = data.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        projectId: task.project_id,
        assignedTo: task.assigned_to || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.due_date ? new Date(task.due_date) : undefined,
        createdAt: new Date(task.created_at),
        updatedAt: new Date(task.updated_at),
      }));

      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error in fetchTasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (!isConnectedToSupabase()) {
        // Mock implementation when Supabase is not connected
        const newTask: Task = {
          ...task,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setTasks(prev => [newTask, ...prev]);
        return;
      }

      const { error } = await supabase!
        .from('tasks')
        .insert({
          title: task.title,
          description: task.description,
          project_id: task.projectId,
          assigned_to: task.assignedTo,
          status: task.status,
          priority: task.priority,
          due_date: task.dueDate?.toISOString().split('T')[0],
        });

      if (error) {
        console.error('Error creating task:', error);
        throw error;
      }

      // Refresh tasks list
      await fetchTasks();
    } catch (error) {
      console.error('Error in addTask:', error);
      throw error;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      if (!isConnectedToSupabase()) {
        // Mock implementation when Supabase is not connected
        setTasks(prev => prev.map(task => 
          task.id === id 
            ? { ...task, ...updates, updatedAt: new Date() }
            : task
        ));
        return;
      }

      const updateData: any = {};
      
      if (updates.title) updateData.title = updates.title;
      if (updates.description) updateData.description = updates.description;
      if (updates.projectId) updateData.project_id = updates.projectId;
      if (updates.assignedTo) updateData.assigned_to = updates.assignedTo;
      if (updates.status) updateData.status = updates.status;
      if (updates.priority) updateData.priority = updates.priority;
      if (updates.dueDate) updateData.due_date = updates.dueDate.toISOString().split('T')[0];

      const { error } = await supabase!
        .from('tasks')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating task:', error);
        throw error;
      }

      // Refresh tasks list
      await fetchTasks();
    } catch (error) {
      console.error('Error in updateTask:', error);
      throw error;
    }
  };

  return { tasks, isLoading, addTask, updateTask, refetch: fetchTasks };
}