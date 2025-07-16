import React from 'react';
import { Calendar, Users, AlertCircle } from 'lucide-react';
import { Project } from '../../types';
import { format } from 'date-fns';

interface ProjectCardProps {
  project: Project;
}

const statusColors = {
  planning: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  'on-hold': 'bg-red-100 text-red-800',
};

const priorityColors = {
  low: 'text-green-600',
  medium: 'text-yellow-600',
  high: 'text-orange-600',
  urgent: 'text-red-600',
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-dark-900 mb-2">{project.title}</h3>
          <p className="text-dark-600 text-sm line-clamp-2">{project.description}</p>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
            {project.status.replace('-', ' ')}
          </span>
          {project.priority === 'urgent' && (
            <AlertCircle className={`w-4 h-4 ${priorityColors[project.priority]}`} />
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-dark-600">Progress</span>
          <span className="font-medium text-dark-900">{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center text-sm text-dark-600">
            <Calendar className="w-4 h-4 mr-1" />
            {format(project.startDate, 'MMM dd, yyyy')}
          </div>
          <div className="flex items-center text-sm text-dark-600">
            <Users className="w-4 h-4 mr-1" />
            {project.assignedTo.length} members
          </div>
        </div>
      </div>
    </div>
  );
}