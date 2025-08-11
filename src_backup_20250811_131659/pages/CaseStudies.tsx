import React, { useState } from 'react';
import { Plus, Search, Filter, BookOpen, Eye, Edit, Trash2 } from 'lucide-react';

export function CaseStudies() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data
  const caseStudies = [
    {
      id: '1',
      title: 'Smart City IoT Implementation Success',
      description: 'How we transformed Riyadh\'s infrastructure with IoT sensors and real-time monitoring',
      customer: 'Saudi Telecom Company',
      project: 'Smart City IoT Infrastructure',
      tags: ['IoT', 'Smart City', 'Infrastructure'],
      isPublished: true,
      createdAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      title: 'Digital Transformation at SABIC',
      description: 'Complete digital overhaul of business processes resulting in 40% efficiency improvement',
      customer: 'SABIC Industries',
      project: 'Digital Transformation Initiative',
      tags: ['Digital Transformation', 'Process Automation', 'Efficiency'],
      isPublished: false,
      createdAt: new Date('2024-02-01'),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Case Studies</h1>
          <p className="text-dark-600">Showcase successful projects and client outcomes</p>
        </div>
        <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Create Case Study</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-600">Total Case Studies</p>
              <p className="text-2xl font-bold text-dark-900">{caseStudies.length}</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-600">Published</p>
              <p className="text-2xl font-bold text-green-600">
                {caseStudies.filter(cs => cs.isPublished).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-600">Draft</p>
              <p className="text-2xl font-bold text-yellow-600">
                {caseStudies.filter(cs => !cs.isPublished).length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Edit className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search case studies..."
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
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Case Studies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {caseStudies.map((caseStudy) => (
          <div key={caseStudy.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-dark-900 mb-2">{caseStudy.title}</h3>
                <p className="text-dark-600 text-sm line-clamp-2 mb-3">{caseStudy.description}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                caseStudy.isPublished 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {caseStudy.isPublished ? 'Published' : 'Draft'}
              </span>
            </div>

            <div className="space-y-3">
              <div className="text-sm">
                <span className="font-medium text-dark-700">Customer:</span>
                <span className="text-dark-600 ml-2">{caseStudy.customer}</span>
              </div>
              
              <div className="text-sm">
                <span className="font-medium text-dark-700">Project:</span>
                <span className="text-dark-600 ml-2">{caseStudy.project}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {caseStudy.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-xs text-dark-500">
                  Created {caseStudy.createdAt.toLocaleDateString()}
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-dark-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}