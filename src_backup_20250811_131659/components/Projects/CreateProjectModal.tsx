import React, { useState, useEffect } from 'react';
import { X, Calendar, Users, Flag, Building2, User, DollarSign, FileText, Plus, Trash2, Clock, Target } from 'lucide-react';
import { Project, ProjectPhase, ProjectMilestone, ProjectResource, ProjectRisk } from '../../types/project';
import { useAuth } from '../../contexts/AuthContext';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  customers: any[];
  users: any[];
  editProject?: Project | null;
}

export function CreateProjectModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  customers, 
  users, 
  editProject 
}: CreateProjectModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'team' | 'timeline' | 'budget' | 'risks'>('basic');
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  
  // Basic Information
  const [basicData, setBasicData] = useState({
    title: '',
    description: '',
    customerId: '',
    status: 'planning' as Project['status'],
    priority: 'medium' as Project['priority'],
    category: 'development',
    tags: [] as string[],
  });

  // New Customer Data
  const [customerData, setCustomerData] = useState({
    companyName: '',
    contactName: '',
    phone: '',
    email: '',
    address: '',
    industry: '',
    website: '',
  });

  // Project Details
  const [projectDetails, setProjectDetails] = useState({
    objectives: [''] as string[],
    scope: '',
    deliverables: [''] as string[],
    assumptions: [''] as string[],
    constraints: [''] as string[],
    successCriteria: [''] as string[],
  });

  // Team & Resources
  const [teamData, setTeamData] = useState({
    managerId: user?.id || '',
    assignedTo: [] as string[],
    resources: [] as ProjectResource[],
    stakeholders: [] as { name: string; role: string; email: string; }[],
  });

  // Timeline & Phases
  const [timelineData, setTimelineData] = useState({
    startDate: '',
    endDate: '',
    estimatedDuration: 30,
    phases: [] as ProjectPhase[],
    milestones: [] as ProjectMilestone[],
  });

  // Budget Information
  const [budgetData, setBudgetData] = useState({
    totalBudget: '',
    currency: 'SAR',
    budgetBreakdown: [] as { category: string; amount: number; description: string; }[],
    contingency: 10,
  });

  // Risk Management
  const [riskData, setRiskData] = useState({
    risks: [] as ProjectRisk[],
    mitigation: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: FileText },
    { id: 'details', label: 'Project Details', icon: Target },
    { id: 'team', label: 'Team & Resources', icon: Users },
    { id: 'timeline', label: 'Timeline & Phases', icon: Calendar },
    { id: 'budget', label: 'Budget', icon: DollarSign },
    { id: 'risks', label: 'Risks & Mitigation', icon: Flag },
  ];

  // Initialize form data when editing
  useEffect(() => {
    if (editProject) {
      setBasicData({
        title: editProject.title,
        description: editProject.description,
        customerId: editProject.customerId,
        status: editProject.status,
        priority: editProject.priority,
        category: editProject.category || 'development',
        tags: editProject.tags || [],
      });
      
      setProjectDetails({
        objectives: editProject.objectives || [''],
        scope: editProject.scope || '',
        deliverables: editProject.deliverables || [''],
        assumptions: editProject.assumptions || [''],
        constraints: editProject.constraints || [''],
        successCriteria: editProject.successCriteria || [''],
      });
      
      setTeamData({
        managerId: editProject.managerId,
        assignedTo: editProject.assignedTo,
        resources: editProject.resources || [],
        stakeholders: editProject.stakeholders || [],
      });
      
      setTimelineData({
        startDate: editProject.startDate.toISOString().split('T')[0],
        endDate: editProject.endDate?.toISOString().split('T')[0] || '',
        estimatedDuration: editProject.estimatedDuration || 30,
        phases: editProject.phases || [],
        milestones: editProject.milestones || [],
      });
      
      setBudgetData({
        totalBudget: editProject.budget?.toString() || '',
        currency: editProject.currency || 'SAR',
        budgetBreakdown: editProject.budgetBreakdown || [],
        contingency: editProject.contingency || 10,
      });
      
      setRiskData({
        risks: editProject.risks || [],
        mitigation: editProject.mitigation || '',
      });
    }
  }, [editProject]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!basicData.title.trim()) {
      newErrors.title = 'Project title is required';
    }

    if (!basicData.description.trim()) {
      newErrors.description = 'Project description is required';
    }

    if (!isNewCustomer && !basicData.customerId) {
      newErrors.customerId = 'Customer is required';
    }

    if (isNewCustomer) {
      if (!customerData.companyName.trim()) {
        newErrors.companyName = 'Company name is required';
      }
      if (!customerData.contactName.trim()) {
        newErrors.contactName = 'Contact name is required';
      }
      if (!customerData.email.trim()) {
        newErrors.email = 'Email is required';
      }
    }

    if (!timelineData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setActiveTab('basic');
      return;
    }
    
    const projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
      title: basicData.title.trim(),
      description: basicData.description.trim(),
      customerId: isNewCustomer ? 'new-customer' : basicData.customerId,
      status: basicData.status,
      priority: basicData.priority,
      category: basicData.category,
      tags: basicData.tags,
      
      // Project Details
      objectives: projectDetails.objectives.filter(obj => obj.trim()),
      scope: projectDetails.scope,
      deliverables: projectDetails.deliverables.filter(del => del.trim()),
      assumptions: projectDetails.assumptions.filter(ass => ass.trim()),
      constraints: projectDetails.constraints.filter(con => con.trim()),
      successCriteria: projectDetails.successCriteria.filter(crit => crit.trim()),
      
      // Team & Resources
      managerId: teamData.managerId,
      assignedTo: teamData.assignedTo,
      resources: teamData.resources,
      stakeholders: teamData.stakeholders,
      
      // Timeline
      startDate: new Date(timelineData.startDate),
      endDate: timelineData.endDate ? new Date(timelineData.endDate) : undefined,
      estimatedDuration: timelineData.estimatedDuration,
      phases: timelineData.phases,
      milestones: timelineData.milestones,
      
      // Budget
      budget: budgetData.totalBudget ? Number(budgetData.totalBudget) : undefined,
      currency: budgetData.currency,
      budgetBreakdown: budgetData.budgetBreakdown,
      contingency: budgetData.contingency,
      
      // Risk Management
      risks: riskData.risks,
      mitigation: riskData.mitigation,
      
      // Progress
      progress: 0,
      documents: [],
      
      // New Customer Data (if applicable)
      newCustomerData: isNewCustomer ? customerData : undefined,
    };

    onSubmit(projectData);
    onClose();
  };

  const addListItem = (
    setter: React.Dispatch<React.SetStateAction<any>>,
    field: string,
    defaultValue: string = ''
  ) => {
    setter((prev: any) => ({
      ...prev,
      [field]: [...prev[field], defaultValue],
    }));
  };

  const updateListItem = (
    setter: React.Dispatch<React.SetStateAction<any>>,
    field: string,
    index: number,
    value: string
  ) => {
    setter((prev: any) => ({
      ...prev,
      [field]: prev[field].map((item: string, i: number) => i === index ? value : item),
    }));
  };

  const removeListItem = (
    setter: React.Dispatch<React.SetStateAction<any>>,
    field: string,
    index: number
  ) => {
    setter((prev: any) => ({
      ...prev,
      [field]: prev[field].filter((_: any, i: number) => i !== index),
    }));
  };

  const addPhase = () => {
    const newPhase: ProjectPhase = {
      id: Date.now().toString(),
      name: '',
      description: '',
      startDate: new Date(),
      endDate: new Date(),
      status: 'planned',
      deliverables: [],
      dependencies: [],
    };
    setTimelineData(prev => ({
      ...prev,
      phases: [...prev.phases, newPhase],
    }));
  };

  const addMilestone = () => {
    const newMilestone: ProjectMilestone = {
      id: Date.now().toString(),
      title: '',
      description: '',
      dueDate: new Date(),
      status: 'pending',
      criteria: [],
    };
    setTimelineData(prev => ({
      ...prev,
      milestones: [...prev.milestones, newMilestone],
    }));
  };

  const addRisk = () => {
    const newRisk: ProjectRisk = {
      id: Date.now().toString(),
      title: '',
      description: '',
      probability: 'medium',
      impact: 'medium',
      category: 'technical',
      mitigation: '',
      owner: '',
      status: 'identified',
    };
    setRiskData(prev => ({
      ...prev,
      risks: [...prev.risks, newRisk],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-dark-900">
            {editProject ? 'Edit Project' : 'Create New Project'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-dark-600" />
          </button>
        </div>

        <div className="flex">
          {/* Sidebar Navigation */}
          <div className="w-64 border-r border-gray-200 p-4 overflow-y-auto max-h-[calc(95vh-120px)]">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto max-h-[calc(95vh-120px)]">
            <form onSubmit={handleSubmit} className="p-6">
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-dark-900">Basic Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={basicData.title}
                      onChange={(e) => setBasicData(prev => ({ ...prev, title: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.title ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter project title"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      Project Description *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={basicData.description}
                      onChange={(e) => setBasicData(prev => ({ ...prev, description: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.description ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Describe the project objectives and scope"
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                  </div>

                  {/* Customer Selection */}
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      Customer *
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            checked={!isNewCustomer}
                            onChange={() => setIsNewCustomer(false)}
                            className="mr-2"
                          />
                          Existing Customer
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            checked={isNewCustomer}
                            onChange={() => setIsNewCustomer(true)}
                            className="mr-2"
                          />
                          New Customer
                        </label>
                      </div>
                      
                      {!isNewCustomer ? (
                        <select
                          value={basicData.customerId}
                          onChange={(e) => setBasicData(prev => ({ ...prev, customerId: e.target.value }))}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                            errors.customerId ? 'border-red-300' : 'border-gray-300'
                          }`}
                          required
                        >
                          <option value="">Select Customer</option>
                          {customers.map((customer) => (
                            <option key={customer.id} value={customer.id}>
                              {customer.name} - {customer.company}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="Company Name *"
                            value={customerData.companyName}
                            onChange={(e) => setCustomerData(prev => ({ ...prev, companyName: e.target.value }))}
                            className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                              errors.companyName ? 'border-red-300' : 'border-gray-300'
                            }`}
                            required
                          />
                          <input
                            type="text"
                            placeholder="Contact Name *"
                            value={customerData.contactName}
                            onChange={(e) => setCustomerData(prev => ({ ...prev, contactName: e.target.value }))}
                            className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                              errors.contactName ? 'border-red-300' : 'border-gray-300'
                            }`}
                            required
                          />
                          <input
                            type="email"
                            placeholder="Email *"
                            value={customerData.email}
                            onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                            className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                              errors.email ? 'border-red-300' : 'border-gray-300'
                            }`}
                            required
                          />
                          <input
                            type="tel"
                            placeholder="Phone"
                            value={customerData.phone}
                            onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                          <input
                            type="text"
                            placeholder="Industry"
                            value={customerData.industry}
                            onChange={(e) => setCustomerData(prev => ({ ...prev, industry: e.target.value }))}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                          <input
                            type="url"
                            placeholder="Website"
                            value={customerData.website}
                            onChange={(e) => setCustomerData(prev => ({ ...prev, website: e.target.value }))}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                      )}
                      {(errors.customerId || errors.companyName || errors.contactName || errors.email) && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.customerId || errors.companyName || errors.contactName || errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-2">
                        Status
                      </label>
                      <select
                        value={basicData.status}
                        onChange={(e) => setBasicData(prev => ({ ...prev, status: e.target.value as Project['status'] }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="planning">Planning</option>
                        <option value="active">Active</option>
                        <option value="on-hold">On Hold</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-2">
                        Priority
                      </label>
                      <select
                        value={basicData.priority}
                        onChange={(e) => setBasicData(prev => ({ ...prev, priority: e.target.value as Project['priority'] }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-2">
                        Category
                      </label>
                      <select
                        value={basicData.category}
                        onChange={(e) => setBasicData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="development">Development</option>
                        <option value="infrastructure">Infrastructure</option>
                        <option value="consulting">Consulting</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="research">Research</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'details' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-dark-900">Project Details</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      Project Scope
                    </label>
                    <textarea
                      rows={4}
                      value={projectDetails.scope}
                      onChange={(e) => setProjectDetails(prev => ({ ...prev, scope: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Define the project scope and boundaries"
                    />
                  </div>

                  {/* Objectives */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-dark-700">
                        Project Objectives
                      </label>
                      <button
                        type="button"
                        onClick={() => addListItem(setProjectDetails, 'objectives')}
                        className="text-primary-600 hover:text-primary-700 text-sm flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Objective
                      </button>
                    </div>
                    <div className="space-y-2">
                      {projectDetails.objectives.map((objective, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={objective}
                            onChange={(e) => updateListItem(setProjectDetails, 'objectives', index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Enter project objective"
                          />
                          <button
                            type="button"
                            onClick={() => removeListItem(setProjectDetails, 'objectives', index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Deliverables */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-dark-700">
                        Key Deliverables
                      </label>
                      <button
                        type="button"
                        onClick={() => addListItem(setProjectDetails, 'deliverables')}
                        className="text-primary-600 hover:text-primary-700 text-sm flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Deliverable
                      </button>
                    </div>
                    <div className="space-y-2">
                      {projectDetails.deliverables.map((deliverable, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={deliverable}
                            onChange={(e) => updateListItem(setProjectDetails, 'deliverables', index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Enter deliverable"
                          />
                          <button
                            type="button"
                            onClick={() => removeListItem(setProjectDetails, 'deliverables', index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Success Criteria */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-dark-700">
                        Success Criteria
                      </label>
                      <button
                        type="button"
                        onClick={() => addListItem(setProjectDetails, 'successCriteria')}
                        className="text-primary-600 hover:text-primary-700 text-sm flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Criteria
                      </button>
                    </div>
                    <div className="space-y-2">
                      {projectDetails.successCriteria.map((criteria, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={criteria}
                            onChange={(e) => updateListItem(setProjectDetails, 'successCriteria', index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Enter success criteria"
                          />
                          <button
                            type="button"
                            onClick={() => removeListItem(setProjectDetails, 'successCriteria', index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'team' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-dark-900">Team & Resources</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-2">
                        Project Manager
                      </label>
                      <select
                        value={teamData.managerId}
                        onChange={(e) => setTeamData(prev => ({ ...prev, managerId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Select Project Manager</option>
                        {users.filter(u => ['admin', 'manager'].includes(u.role)).map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name} - {user.role}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-2">
                        Team Members
                      </label>
                      <select
                        multiple
                        value={teamData.assignedTo}
                        onChange={(e) => setTeamData(prev => ({ 
                          ...prev, 
                          assignedTo: Array.from(e.target.selectedOptions, option => option.value)
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        size={4}
                      >
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name} - {user.role}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple members</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'timeline' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-dark-900">Timeline & Phases</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={timelineData.startDate}
                        onChange={(e) => setTimelineData(prev => ({ ...prev, startDate: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors.startDate ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.startDate && (
                        <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={timelineData.endDate}
                        onChange={(e) => setTimelineData(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-2">
                        Estimated Duration (days)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={timelineData.estimatedDuration}
                        onChange={(e) => setTimelineData(prev => ({ ...prev, estimatedDuration: Number(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'budget' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-dark-900">Budget Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-2">
                        Total Budget
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={budgetData.totalBudget}
                        onChange={(e) => setBudgetData(prev => ({ ...prev, totalBudget: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-2">
                        Currency
                      </label>
                      <select
                        value={budgetData.currency}
                        onChange={(e) => setBudgetData(prev => ({ ...prev, currency: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="SAR">SAR - Saudi Riyal</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-2">
                        Contingency (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={budgetData.contingency}
                        onChange={(e) => setBudgetData(prev => ({ ...prev, contingency: Number(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'risks' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-dark-900">Risk Management</h3>
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-medium text-dark-700">
                        Project Risks
                      </label>
                      <button
                        type="button"
                        onClick={addRisk}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Risk</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {riskData.risks.map((risk, index) => (
                        <div key={risk.id} className="bg-gray-50 p-4 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                              type="text"
                              placeholder="Risk Title"
                              value={risk.title}
                              onChange={(e) => {
                                const updatedRisks = [...riskData.risks];
                                updatedRisks[index] = { ...risk, title: e.target.value };
                                setRiskData(prev => ({ ...prev, risks: updatedRisks }));
                              }}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                            <div className="flex space-x-2">
                              <select
                                value={risk.probability}
                                onChange={(e) => {
                                  const updatedRisks = [...riskData.risks];
                                  updatedRisks[index] = { ...risk, probability: e.target.value as any };
                                  setRiskData(prev => ({ ...prev, risks: updatedRisks }));
                                }}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              >
                                <option value="low">Low Probability</option>
                                <option value="medium">Medium Probability</option>
                                <option value="high">High Probability</option>
                              </select>
                              <select
                                value={risk.impact}
                                onChange={(e) => {
                                  const updatedRisks = [...riskData.risks];
                                  updatedRisks[index] = { ...risk, impact: e.target.value as any };
                                  setRiskData(prev => ({ ...prev, risks: updatedRisks }));
                                }}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              >
                                <option value="low">Low Impact</option>
                                <option value="medium">Medium Impact</option>
                                <option value="high">High Impact</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedRisks = riskData.risks.filter((_, i) => i !== index);
                                  setRiskData(prev => ({ ...prev, risks: updatedRisks }));
                                }}
                                className="text-red-600 hover:text-red-800 p-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <textarea
                            placeholder="Risk Description"
                            value={risk.description}
                            onChange={(e) => {
                              const updatedRisks = [...riskData.risks];
                              updatedRisks[index] = { ...risk, description: e.target.value };
                              setRiskData(prev => ({ ...prev, risks: updatedRisks }));
                            }}
                            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            rows={2}
                          />
                          <textarea
                            placeholder="Mitigation Strategy"
                            value={risk.mitigation}
                            onChange={(e) => {
                              const updatedRisks = [...riskData.risks];
                              updatedRisks[index] = { ...risk, mitigation: e.target.value };
                              setRiskData(prev => ({ ...prev, risks: updatedRisks }));
                            }}
                            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            rows={2}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 mt-8">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-dark-600 hover:text-dark-800 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {editProject ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}