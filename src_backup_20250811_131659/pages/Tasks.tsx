import React, { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { TaskCard } from '../components/Tasks/TaskCard';
import { CreateTaskModal } from '../components/Tasks/CreateTaskModal';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../contexts/AuthContext';

export function Tasks() {
  const { user } = useAuth();
  const { tasks, addTask, updateTask, isLoading } = useTasks();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleTaskStatusChange = (taskId: string, status: any) => {
    updateTask(taskId, { status });
  };

  const handleCreateTask = (taskData: any) => {
    addTask(taskData);
  };

  const todoTasks = filteredTasks.filter(t => t.status === 'todo');
  const inProgressTasks = filteredTasks.filter(t => t.status === 'in-progress');
  const doneTasks = filteredTasks.filter(t => t.status === 'done');

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Tasks</h1>
          <p className="text-dark-600">Manage and track all your tasks</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-dark-600" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* To Do Column */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-dark-900">To Do</h3>
            <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm">
              {todoTasks.length}
            </span>
          </div>
          <div className="space-y-3">
            {todoTasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onStatusChange={handleTaskStatusChange}
              />
            ))}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-dark-900">In Progress</h3>
            <span className="bg-blue-200 text-blue-700 px-2 py-1 rounded-full text-sm">
              {inProgressTasks.length}
            </span>
          </div>
          <div className="space-y-3">
            {inProgressTasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onStatusChange={handleTaskStatusChange}
              />
            ))}
          </div>
        </div>

        {/* Done Column */}
        <div className="bg-green-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-dark-900">Done</h3>
            <span className="bg-green-200 text-green-700 px-2 py-1 rounded-full text-sm">
              {doneTasks.length}
            </span>
          </div>
          <div className="space-y-3">
            {doneTasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onStatusChange={handleTaskStatusChange}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
}