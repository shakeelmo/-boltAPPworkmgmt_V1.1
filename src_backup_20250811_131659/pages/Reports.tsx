import React from 'react';
import { BarChart3, TrendingUp, Calendar, Users } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useTasks } from '../hooks/useTasks';

export function Reports() {
  const { projects } = useProjects();
  const { tasks } = useTasks();

  const projectsByStatus = {
    planning: projects.filter(p => p.status === 'planning').length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    'on-hold': projects.filter(p => p.status === 'on-hold').length,
  };

  const tasksByStatus = {
    todo: tasks.filter(t => t.status === 'todo').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    done: tasks.filter(t => t.status === 'done').length,
  };

  const completionRate = projects.length > 0 
    ? Math.round((projectsByStatus.completed / projects.length) * 100)
    : 0;

  const taskCompletionRate = tasks.length > 0
    ? Math.round((tasksByStatus.done / tasks.length) * 100)
    : 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-900">Reports & Analytics</h1>
        <p className="text-dark-600">Track performance and project insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-600">Project Completion</p>
              <p className="text-2xl font-bold text-green-600">{completionRate}%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-600">Task Completion</p>
              <p className="text-2xl font-bold text-blue-600">{taskCompletionRate}%</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-600">Active Projects</p>
              <p className="text-2xl font-bold text-primary-600">{projectsByStatus.active}</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <Calendar className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-600">Team Productivity</p>
              <p className="text-2xl font-bold text-secondary-600">85%</p>
            </div>
            <div className="p-3 bg-secondary-100 rounded-lg">
              <Users className="w-6 h-6 text-secondary-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-dark-900 mb-4">Project Status Distribution</h3>
          <div className="space-y-4">
            {Object.entries(projectsByStatus).map(([status, count]) => {
              const percentage = projects.length > 0 ? (count / projects.length) * 100 : 0;
              const colors = {
                planning: 'bg-yellow-500',
                active: 'bg-green-500',
                completed: 'bg-blue-500',
                'on-hold': 'bg-red-500',
              };
              
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${colors[status as keyof typeof colors]}`}></div>
                    <span className="text-sm font-medium text-dark-700 capitalize">
                      {status.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${colors[status as keyof typeof colors]}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-dark-600 w-8">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Task Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-dark-900 mb-4">Task Status Distribution</h3>
          <div className="space-y-4">
            {Object.entries(tasksByStatus).map(([status, count]) => {
              const percentage = tasks.length > 0 ? (count / tasks.length) * 100 : 0;
              const colors = {
                todo: 'bg-gray-500',
                'in-progress': 'bg-blue-500',
                done: 'bg-green-500',
              };
              
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${colors[status as keyof typeof colors]}`}></div>
                    <span className="text-sm font-medium text-dark-700 capitalize">
                      {status.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${colors[status as keyof typeof colors]}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-dark-600 w-8">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-dark-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-dark-900">Project "Smart City IoT Infrastructure" updated</p>
              <p className="text-xs text-dark-600">Progress increased to 65% - 2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-dark-900">New task assigned to Omar Hassan</p>
              <p className="text-xs text-dark-600">"Network connectivity testing" - 4 hours ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-dark-900">Project "Network Security Audit" completed</p>
              <p className="text-xs text-dark-600">All security measures implemented - 1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}