import React from 'react';
import { Calendar, User, Flag } from 'lucide-react';
import { Task } from '../../types';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, status: Task['status']) => void;
}

const statusColors = {
  todo: 'bg-gray-100 text-gray-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  done: 'bg-green-100 text-green-800',
};

const priorityColors = {
  low: 'text-green-600',
  medium: 'text-yellow-600',
  high: 'text-orange-600',
  urgent: 'text-red-600',
};

export function TaskCard({ task, onStatusChange }: TaskCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-dark-900 flex-1">{task.title}</h4>
        <div className="flex items-center space-x-2 ml-2">
          <Flag className={`w-4 h-4 ${priorityColors[task.priority]}`} />
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value as Task['status'])}
            className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${statusColors[task.status]} focus:ring-2 focus:ring-primary-500`}
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      <p className="text-sm text-dark-600 mb-3 line-clamp-2">{task.description}</p>

      <div className="flex items-center justify-between text-xs text-dark-500">
        <div className="flex items-center">
          <User className="w-3 h-3 mr-1" />
          Assigned
        </div>
        {task.dueDate && (
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {format(task.dueDate, 'MMM dd')}
          </div>
        )}
      </div>
    </div>
  );
}