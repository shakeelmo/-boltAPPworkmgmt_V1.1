import React, { useState, useEffect } from 'react';
import { X, DollarSign, User, Building2, FileText, AlertCircle, Plus, Trash2, Calendar, Clock, Upload, Image } from 'lucide-react';
import { Proposal, DocumentControl, Introduction, RequirementUnderstanding, CustomerPrerequisites, Deliverable, AdditionalCondition, CommercialProposal, PaymentTerms, ProjectDuration, CommercialItem, DeliverableTask, PaymentMilestone, ProjectPhase } from '../../types/proposal';
import { useAuth } from '../../contexts/AuthContext';

interface CreateProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (proposal: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt' | 'attachments' | 'activityLog'>) => void;
  customers: any[];
  vendors: any[];
  editProposal?: Proposal | null;
}

export function CreateProposalModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  customers, 
  vendors, 
  editProposal 
}: CreateProposalModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'basic' | 'document' | 'introduction' | 'requirements' | 'prerequisites' | 'deliverables' | 'conditions' | 'commercial' | 'payment' | 'timeline'>('basic');
  
  // Basic Information
  const [basicData, setBasicData] = useState({
    title: '',
    description: '',
    customerId: '',
    vendorId: '',
    status: 'draft' as Proposal['status'],
    value: '',
  });

  // Logo Upload State
  const [customerLogo, setCustomerLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoError, setLogoError] = useState<string>('');

  // Document Control
  const [documentControl, setDocumentControl] = useState<DocumentControl>({
    documentNumber: `PROP-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
    version: '1.0',
    date: new Date(),
    preparedBy: user?.name || 'Current User',
    reviewedBy: '',
    approvedBy: '',
    confidentialityLevel: 'confidential',
  });

  // Introduction
  const [introduction, setIntroduction] = useState<Introduction>({
    documentPurpose: 'This document presents our technical and commercial proposal for the implementation of fiber optic cable infrastructure.',
    projectOverview: 'Complete fiber optic cable installation including excavation, cable laying, equipment installation, and testing.',
    objectives: [
      'Establish reliable fiber optic connectivity',
      'Ensure minimal disruption to operations',
      'Provide comprehensive testing and documentation',
      'Deliver project within specified timeline'
    ],
  });

  // Requirement Understanding
  const [requirements, setRequirements] = useState<RequirementUnderstanding>({
    projectScope: 'The project involves laying fiber optic cables from the Data Center to Sales Office and Admin Office with complete infrastructure setup.',
    highLevelRequirements: [
      'Fiber optic cable installation between multiple locations',
      'Excavation and trenching work',
      'Installation of manholes and cable protection',
      'Equipment installation and configuration',
      'Testing and commissioning'
    ],
    technicalRequirements: [
      '8-core fiber optic cable for Data Center to Sales Office',
      '48-core fiber optic cable for Data Center to Admin Office',
      'PVC pipe protection with appropriate specifications',
      'Patch panels and cable management systems',
      'Professional cable testing and certification'
    ],
    businessRequirements: [
      'Minimal disruption to daily operations',
      'Compliance with safety standards',
      'Proper documentation and handover',
      'Warranty and support provisions'
    ],
  });

  // Customer Prerequisites
  const [prerequisites, setPrerequisites] = useState<CustomerPrerequisites>({
    items: [
      {
        id: '1',
        description: 'Excavation permits and approvals from relevant authorities',
        responsibility: 'customer',
        mandatory: true,
      },
      {
        id: '2',
        description: 'Site access and security clearances',
        responsibility: 'customer',
        mandatory: true,
      },
      {
        id: '3',
        description: 'Utility clearance and coordination',
        responsibility: 'shared',
        mandatory: true,
      },
      {
        id: '4',
        description: 'Power supply for equipment installation',
        responsibility: 'customer',
        mandatory: true,
      },
    ],
  });

  // Deliverables
  const [deliverables, setDeliverables] = useState<Deliverable[]>([
    {
      id: '1',
      title: 'Laying Fiber Optic cable from Data Center office to Sales Office',
      description: 'Complete fiber optic cable installation including excavation, cable laying, and equipment setup for Sales Office connectivity.',
      tasks: [
        {
          id: '1-1',
          description: 'Excavation of soft soil land from Data Center office to Sales office',
          details: ['Excavate trench 30cm width x 40cm depth', 'Length approximately 75 meters'],
        },
        {
          id: '1-2',
          description: 'Make 2 manholes on the way',
          details: ['40x40cm manholes with fiber manhole covers', 'Proper drainage and access'],
        },
        {
          id: '1-3',
          description: 'Laying the PVC 1½" pipe along the excavated land',
          details: ['Class 3 PVC pipe installation', 'Proper bedding and protection'],
        },
        {
          id: '1-4',
          description: 'Install 10cm Galvanized Cable Tray on External wall',
          details: ['From Data Center to excavation starting point', 'Proper mounting and support'],
        },
        {
          id: '1-5',
          description: 'Install Cabinet and patch panels in Data Center',
          details: ['Deploy 2 patch panels', 'Cable management system'],
        },
        {
          id: '1-6',
          description: 'Pull 8-core fiber optic cable',
          details: ['15 meters over ceiling in flexible pipe', 'Through cable tray and PVC pipe to Sales office'],
        },
        {
          id: '1-7',
          description: 'Install Cabinet and patch panel in Sales office',
          details: ['1 patch panel installation', 'Proper cable termination'],
        },
        {
          id: '1-8',
          description: 'Testing and handover',
          details: ['Fiber optic testing', 'Cable labeling and tagging', 'Documentation handover'],
        },
      ],
      acceptanceCriteria: [
        'All fiber optic tests pass specifications',
        'Proper cable labeling completed',
        'Documentation provided',
        'Customer sign-off obtained'
      ],
      timeline: '10 working days',
    },
    {
      id: '2',
      title: 'Laying Fiber Optic cable from Data Center to Admin Office',
      description: 'Complete fiber optic cable installation for Admin Office with higher capacity requirements.',
      tasks: [
        {
          id: '2-1',
          description: 'Excavation of soft soil land from Data Center to Admin office',
          details: ['Excavate trench 30cm width x 40cm depth', 'Length approximately 195 meters'],
        },
        {
          id: '2-2',
          description: 'Making 5 manholes on the way',
          details: ['40x40cm manholes with fiber manhole covers', 'Strategic placement for cable access'],
        },
        {
          id: '2-3',
          description: 'Laying the PVC 3" pipe along the excavated land',
          details: ['Class 3 PVC pipe for 48-core cable', 'Proper installation and protection'],
        },
        {
          id: '2-4',
          description: 'Pull 48-core fiber optic cable',
          details: ['15 meters over ceiling in flexible pipe', 'Through cable tray and PVC pipe system'],
        },
        {
          id: '2-5',
          description: 'Install Cabinet and patch panel in Admin office',
          details: ['1 patch panel installation', 'Cable termination and management'],
        },
        {
          id: '2-6',
          description: 'Testing and handover',
          details: ['Comprehensive fiber testing', 'Cable labeling and documentation'],
        },
      ],
      acceptanceCriteria: [
        'All 48 cores tested and certified',
        'Proper documentation provided',
        'Customer acceptance obtained',
        'Warranty documentation provided'
      ],
      timeline: '15 working days',
    },
  ]);

  // Additional Conditions
  const [conditions, setConditions] = useState<AdditionalCondition[]>([
    {
      id: '1',
      condition: 'Any task/activities which are not mentioned in the above scope will be considered as a change request which will be chargeable activity.',
      category: 'scope',
    },
    {
      id: '2',
      condition: 'Smart UniIT will be responsible only for procurement of hardware mentioned in the commercial proposal and any other addition will subject to additional charges.',
      category: 'responsibility',
    },
    {
      id: '3',
      condition: 'Smart Universe is not responsible for third-party preparatory work (e.g., permits for digging, city region electricity-availability logistics, clearance from gardening permit etc.).',
      category: 'responsibility',
    },
    {
      id: '4',
      condition: 'The project will be completed within 25 days from the start date provided the site is accessible every day.',
      category: 'timeline',
    },
    {
      id: '5',
      condition: 'All the device configuration connecting the Fiber cables is out of scope of the project.',
      category: 'scope',
    },
    {
      id: '6',
      condition: 'After testing the cables and tagging the project will be considered as completed.',
      category: 'scope',
    },
    {
      id: '7',
      condition: 'Smart UniIT will not be responsible for any delay occurred due to force majeure or any delay in readiness from customer.',
      category: 'risk',
    },
    {
      id: '8',
      condition: 'Smart UniIT will allocate resource for this project considering that it will be a continuous engagement. However, customer will have to consider 2 weeks resource mobilization period, if any task/activity is on hold for any reason.',
      category: 'timeline',
    },
    {
      id: '9',
      condition: 'Upon commencement of the engagement, customer will provide Smart UniIT with any policy and procedure requirements relevant to the excavation, gardening permit etc.',
      category: 'responsibility',
    },
    {
      id: '10',
      condition: 'During the full course of the installation, Customer will provide Smart UniIT with appropriate site access, guidance and technical resources as required for successful progress.',
      category: 'responsibility',
    },
  ]);

  // Commercial Proposal
  const [commercial, setCommercial] = useState<CommercialProposal>({
    items: [
      {
        id: '1',
        serialNumber: 1,
        description: 'Excavation of Cable Trench 30cm width x 40cm depth for Fiber Optic Cable from main Data center to Admin Office.',
        quantity: 195,
        unit: 'Meters',
        unitPrice: 50,
        total: 9750,
      },
      {
        id: '2',
        serialNumber: 2,
        description: 'Excavation of Cable Trench 30cm width x 40cm depth for Fiber Optic Cable from main Data center to Sales Office.',
        quantity: 75,
        unit: 'Meters',
        unitPrice: 50,
        total: 3750,
      },
      {
        id: '3',
        serialNumber: 3,
        description: 'Laying/pulling 8 core Fiber Optic Cable in Trench from Data Center to Sales office.(Cable is not Included)',
        quantity: 75,
        unit: 'Meters',
        unitPrice: 18,
        total: 1350,
      },
      {
        id: '4',
        serialNumber: 4,
        description: 'Laying/pulling 48core Fiber Optic Cable in Trench from Data Center to Admin office.(Cable is not Included)',
        quantity: 195,
        unit: 'Meters',
        unitPrice: 10,
        total: 1950,
      },
      {
        id: '5',
        serialNumber: 5,
        description: 'Laying PVC Pipe 3" dia class 3 for 48core Fiber Optic Cable in Trench from Data Center to Admin office. (Included with pipe and accessories)',
        quantity: 130,
        unit: 'Meters',
        unitPrice: 75,
        total: 9750,
      },
    ],
    subtotal: 26550,
    vatRate: 15,
    vatAmount: 3982.5,
    total: 30532.5,
    currency: 'SAR',
    validityPeriod: 30,
  });

  // Payment Terms
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>({
    structure: 'milestone',
    milestones: [
      {
        id: '1',
        description: 'Advance Payment',
        percentage: 50,
        amount: 15266.25,
        conditions: ['Upon contract signing', 'Before project commencement'],
      },
      {
        id: '2',
        description: 'Final Payment',
        percentage: 50,
        amount: 15266.25,
        conditions: ['Upon project completion', 'After successful testing and handover'],
      },
    ],
    currency: 'SAR',
    paymentMethod: ['Bank Transfer', 'Cheque'],
    latePenalty: 2,
    advancePayment: 50,
  });

  // Project Duration
  const [projectDuration, setProjectDuration] = useState<ProjectDuration>({
    totalDays: 25,
    phases: [
      {
        id: '1',
        name: 'Site Preparation and Permits',
        duration: 3,
        startDay: 1,
        endDay: 3,
        deliverables: ['Site survey', 'Permit approvals', 'Material procurement'],
      },
      {
        id: '2',
        name: 'Excavation and Infrastructure',
        duration: 10,
        startDay: 4,
        endDay: 13,
        deliverables: ['Trenching completed', 'Manholes installed', 'PVC pipes laid'],
      },
      {
        id: '3',
        name: 'Cable Installation',
        duration: 8,
        startDay: 14,
        endDay: 21,
        deliverables: ['Fiber cables pulled', 'Equipment installed', 'Terminations completed'],
      },
      {
        id: '4',
        name: 'Testing and Handover',
        duration: 4,
        startDay: 22,
        endDay: 25,
        deliverables: ['Testing completed', 'Documentation provided', 'Customer handover'],
      },
    ],
    criticalPath: ['Site access approval', 'Weather conditions', 'Material availability'],
    assumptions: [
      'Site is accessible daily during working hours',
      'No underground utilities conflicts',
      'Weather conditions are favorable',
      'Customer provides timely approvals'
    ],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when editing
  useEffect(() => {
    if (editProposal) {
      setBasicData({
        title: editProposal.title,
        description: editProposal.description,
        customerId: editProposal.customerId,
        vendorId: editProposal.vendorId || '',
        status: editProposal.status,
        value: editProposal.value?.toString() || '',
      });
      
      if (editProposal.documentControl) {
        setDocumentControl(editProposal.documentControl);
      }
      
      if (editProposal.introduction) {
        setIntroduction(editProposal.introduction);
      }
      
      if (editProposal.requirementUnderstanding) {
        setRequirements(editProposal.requirementUnderstanding);
      }
      
      if (editProposal.customerPrerequisites) {
        setPrerequisites(editProposal.customerPrerequisites);
      }
      
      if (editProposal.deliverables) {
        setDeliverables(editProposal.deliverables);
      }
      
      if (editProposal.additionalConditions) {
        setConditions(editProposal.additionalConditions);
      }
      
      if (editProposal.commercialProposal) {
        setCommercial(editProposal.commercialProposal);
      }
      
      if (editProposal.paymentTerms) {
        setPaymentTerms(editProposal.paymentTerms);
      }
      
      if (editProposal.projectDuration) {
        setProjectDuration(editProposal.projectDuration);
      }
    }
  }, [editProposal]);

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: FileText },
    { id: 'document', label: 'Document Control', icon: FileText },
    { id: 'introduction', label: 'Introduction', icon: FileText },
    { id: 'requirements', label: 'Requirements', icon: FileText },
    { id: 'prerequisites', label: 'Prerequisites', icon: FileText },
    { id: 'deliverables', label: 'Deliverables', icon: FileText },
    { id: 'conditions', label: 'Conditions', icon: FileText },
    { id: 'commercial', label: 'Commercial', icon: DollarSign },
    { id: 'payment', label: 'Payment Terms', icon: DollarSign },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!basicData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!basicData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!basicData.customerId) {
      newErrors.customerId = 'Customer is required';
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
    
    const proposalData: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt' | 'attachments' | 'activityLog'> = {
      title: basicData.title.trim(),
      description: basicData.description.trim(),
      customerId: basicData.customerId,
      vendorId: basicData.vendorId || undefined,
      status: basicData.status,
      value: basicData.value ? Number(basicData.value) : undefined,
      documentControl,
      introduction,
      requirementUnderstanding: requirements,
      customerPrerequisites: prerequisites,
      deliverables,
      additionalConditions: conditions,
      commercialProposal: commercial,
      paymentTerms,
      projectDuration,
      createdBy: user?.id || 'current-user',
      // Include customer logo data
      customerLogo: customerLogo || undefined,
      logoFile: logoFile || undefined,
    };

    onSubmit(proposalData);
    onClose();
  };

  const addCommercialItem = () => {
    const newItem: CommercialItem = {
      id: Date.now().toString(),
      serialNumber: commercial.items.length + 1,
      description: '',
      quantity: 1,
      unit: 'Each',
      unitPrice: 0,
      total: 0,
    };
    setCommercial(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const updateCommercialItem = (id: string, updates: Partial<CommercialItem>) => {
    setCommercial(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const updated = { ...item, ...updates };
          if (updates.quantity !== undefined || updates.unitPrice !== undefined) {
            updated.total = updated.quantity * updated.unitPrice;
          }
          return updated;
        }
        return item;
      }),
    }));
  };

  const removeCommercialItem = (id: string) => {
    setCommercial(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id),
    }));
  };

  const calculateCommercialTotals = () => {
    const subtotal = commercial.items.reduce((sum, item) => sum + item.total, 0);
    const vatAmount = subtotal * (commercial.vatRate / 100);
    const total = subtotal + vatAmount;
    
    setCommercial(prev => ({
      ...prev,
      subtotal,
      vatAmount,
      total,
    }));
  };

  useEffect(() => {
    calculateCommercialTotals();
  }, [commercial.items, commercial.vatRate]);

  const addObjective = () => {
    setIntroduction(prev => ({
      ...prev,
      objectives: [...prev.objectives, ''],
    }));
  };

  const updateObjective = (index: number, value: string) => {
    setIntroduction(prev => ({
      ...prev,
      objectives: prev.objectives.map((obj, i) => i === index ? value : obj),
    }));
  };

  const removeObjective = (index: number) => {
    setIntroduction(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index),
    }));
  };

  const addRequirement = (type: 'highLevelRequirements' | 'technicalRequirements' | 'businessRequirements') => {
    setRequirements(prev => ({
      ...prev,
      [type]: [...prev[type], ''],
    }));
  };

  const updateRequirement = (type: 'highLevelRequirements' | 'technicalRequirements' | 'businessRequirements', index: number, value: string) => {
    setRequirements(prev => ({
      ...prev,
      [type]: prev[type].map((req, i) => i === index ? value : req),
    }));
  };

  const removeRequirement = (type: 'highLevelRequirements' | 'technicalRequirements' | 'businessRequirements', index: number) => {
    setRequirements(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  // Logo Upload Handlers
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setLogoError('Please select a valid image file (PNG, JPG, JPEG, GIF)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setLogoError('File size must be less than 5MB');
      return;
    }

    setLogoError('');
    setLogoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setCustomerLogo(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setCustomerLogo(null);
    setLogoFile(null);
    setLogoError('');
  };

  const getSelectedCustomer = () => {
    return customers.find(c => c.id === basicData.customerId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-dark-900">
            {editProposal ? 'Edit Proposal' : 'Create New Proposal'}
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
                      Proposal Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={basicData.title}
                      onChange={(e) => setBasicData(prev => ({ ...prev, title: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.title ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter proposal title"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={basicData.description}
                      onChange={(e) => setBasicData(prev => ({ ...prev, description: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.description ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Describe the proposal"
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-2">
                        Customer *
                      </label>
                      <select
                        required
                        value={basicData.customerId}
                        onChange={(e) => setBasicData(prev => ({ ...prev, customerId: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors.customerId ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select a customer</option>
                        {customers.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.name} - {customer.company}
                          </option>
                        ))}
                      </select>
                      {errors.customerId && (
                        <p className="mt-1 text-sm text-red-600">{errors.customerId}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-2">
                        Vendor (Optional)
                      </label>
                      <select
                        value={basicData.vendorId}
                        onChange={(e) => setBasicData(prev => ({ ...prev, vendorId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Select a vendor</option>
                        {vendors.map((vendor) => (
                          <option key={vendor.id} value={vendor.id}>
                            {vendor.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-2">
                        Status
                      </label>
                      <select
                        value={basicData.status}
                        onChange={(e) => setBasicData(prev => ({ ...prev, status: e.target.value as Proposal['status'] }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="draft">Draft</option>
                        <option value="submitted">Submitted</option>
                        <option value="under_review">Under Review</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="won">Won</option>
                        <option value="lost">Lost</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-2">
                        Estimated Value (SAR)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={basicData.value}
                        onChange={(e) => setBasicData(prev => ({ ...prev, value: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Customer Logo Upload Section */}
                  <div className="border-t pt-6 mt-6">
                    <h4 className="text-md font-semibold text-dark-900 mb-4">Customer Logo Upload</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Upload a customer logo to be included in the proposal PDF. This logo will appear on the cover page.
                    </p>
                    
                    <div className="space-y-4">
                      {/* Logo Upload Area */}
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-dark-700 mb-2">
                            Customer Logo
                          </label>
                          <div className="flex items-center space-x-3">
                            <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Logo
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="hidden"
                              />
                            </label>
                            {customerLogo && (
                              <button
                                type="button"
                                onClick={removeLogo}
                                className="inline-flex items-center px-3 py-2 border border-red-300 rounded-lg shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Remove
                              </button>
                            )}
                          </div>
                          {logoError && (
                            <p className="mt-1 text-sm text-red-600">{logoError}</p>
                          )}
                          <p className="mt-1 text-xs text-gray-500">
                            Supported formats: PNG, JPG, JPEG, GIF (max 5MB)
                          </p>
                        </div>
                      </div>

                      {/* Logo Preview */}
                      {customerLogo && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-dark-700 mb-2">
                            Logo Preview
                          </label>
                          <div className="flex items-center space-x-4">
                            <div className="w-32 h-20 border border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                              <img
                                src={customerLogo}
                                alt="Customer Logo Preview"
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-600">
                                <strong>File:</strong> {logoFile?.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                <strong>Size:</strong> {logoFile?.size ? (logoFile.size / 1024 / 1024).toFixed(2) : '0'} MB
                              </p>
                              <p className="text-sm text-gray-600">
                                <strong>Type:</strong> {logoFile?.type}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Selected Customer Info */}
                      {getSelectedCustomer() && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <h5 className="text-sm font-medium text-dark-700 mb-2">Selected Customer</h5>
                          <div className="text-sm text-gray-600">
                            <p><strong>Name:</strong> {getSelectedCustomer()?.name}</p>
                            <p><strong>Company:</strong> {getSelectedCustomer()?.company}</p>
                            <p><strong>Email:</strong> {getSelectedCustomer()?.email}</p>
                            {!customerLogo && (
                              <p className="mt-2 text-xs text-orange-600">
                                💡 Tip: Upload a logo for this customer to make the proposal more professional
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'document' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-dark-900">Document Control</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-2">
                        Document Number
                      </label>
                      <input
                        type="text"
                        value={documentControl.documentNumber}
                        onChange={(e) => setDocumentControl(prev => ({ ...prev, documentNumber: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-2">
                        Version
                      </label>
                      <input
                        type="text"
                        value={documentControl.version}
                        onChange={(e) => setDocumentControl(prev => ({ ...prev, version: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-2">
                        Prepared By
                      </label>
                      <input
                        type="text"
                        value={documentControl.preparedBy}
                        onChange={(e) => setDocumentControl(prev => ({ ...prev, preparedBy: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-2">
                        Confidentiality Level
                      </label>
                      <select
                        value={documentControl.confidentialityLevel}
                        onChange={(e) => setDocumentControl(prev => ({ ...prev, confidentialityLevel: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="public">Public</option>
                        <option value="confidential">Confidential</option>
                        <option value="restricted">Restricted</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'introduction' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-dark-900">Introduction</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      Document Purpose
                    </label>
                    <textarea
                      rows={3}
                      value={introduction.documentPurpose}
                      onChange={(e) => setIntroduction(prev => ({ ...prev, documentPurpose: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      Project Overview
                    </label>
                    <textarea
                      rows={3}
                      value={introduction.projectOverview}
                      onChange={(e) => setIntroduction(prev => ({ ...prev, projectOverview: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-dark-700">
                        Objectives
                      </label>
                      <button
                        type="button"
                        onClick={addObjective}
                        className="text-primary-600 hover:text-primary-700 text-sm flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Objective
                      </button>
                    </div>
                    <div className="space-y-2">
                      {introduction.objectives.map((objective, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={objective}
                            onChange={(e) => updateObjective(index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Enter objective"
                          />
                          <button
                            type="button"
                            onClick={() => removeObjective(index)}
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

              {activeTab === 'requirements' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-dark-900">Requirement Understanding</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      Project Scope
                    </label>
                    <textarea
                      rows={4}
                      value={requirements.projectScope}
                      onChange={(e) => setRequirements(prev => ({ ...prev, projectScope: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  {/* High Level Requirements */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-dark-700">
                        High Level Requirements
                      </label>
                      <button
                        type="button"
                        onClick={() => addRequirement('highLevelRequirements')}
                        className="text-primary-600 hover:text-primary-700 text-sm flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Requirement
                      </button>
                    </div>
                    <div className="space-y-2">
                      {requirements.highLevelRequirements.map((req, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={req}
                            onChange={(e) => updateRequirement('highLevelRequirements', index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Enter requirement"
                          />
                          <button
                            type="button"
                            onClick={() => removeRequirement('highLevelRequirements', index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Technical Requirements */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-dark-700">
                        Technical Requirements
                      </label>
                      <button
                        type="button"
                        onClick={() => addRequirement('technicalRequirements')}
                        className="text-primary-600 hover:text-primary-700 text-sm flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Requirement
                      </button>
                    </div>
                    <div className="space-y-2">
                      {requirements.technicalRequirements.map((req, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={req}
                            onChange={(e) => updateRequirement('technicalRequirements', index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Enter technical requirement"
                          />
                          <button
                            type="button"
                            onClick={() => removeRequirement('technicalRequirements', index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Business Requirements */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-dark-700">
                        Business Requirements
                      </label>
                      <button
                        type="button"
                        onClick={() => addRequirement('businessRequirements')}
                        className="text-primary-600 hover:text-primary-700 text-sm flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Requirement
                      </button>
                    </div>
                    <div className="space-y-2">
                      {requirements.businessRequirements.map((req, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={req}
                            onChange={(e) => updateRequirement('businessRequirements', index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Enter business requirement"
                          />
                          <button
                            type="button"
                            onClick={() => removeRequirement('businessRequirements', index)}
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

              {activeTab === 'commercial' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-dark-900">Commercial Proposal</h3>
                    <button
                      type="button"
                      onClick={addCommercialItem}
                      className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Item</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 px-4 py-2 text-left">S.No</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Quantity</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Units</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Unit Price</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Total</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {commercial.items.map((item, index) => (
                          <tr key={item.id}>
                            <td className="border border-gray-300 px-4 py-2">
                              {index + 1}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              <textarea
                                value={item.description}
                                onChange={(e) => updateCommercialItem(item.id, { description: e.target.value })}
                                className="w-full px-2 py-1 border border-gray-200 rounded text-sm min-w-[300px]"
                                rows={2}
                                placeholder="Enter item description"
                              />
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateCommercialItem(item.id, { quantity: Number(e.target.value) || 1 })}
                                className="w-20 px-2 py-1 border border-gray-200 rounded text-sm"
                              />
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              <input
                                type="text"
                                value={item.unit}
                                onChange={(e) => updateCommercialItem(item.id, { unit: e.target.value })}
                                className="w-20 px-2 py-1 border border-gray-200 rounded text-sm"
                                placeholder="Unit"
                              />
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) => updateCommercialItem(item.id, { unitPrice: Number(e.target.value) || 0 })}
                                className="w-24 px-2 py-1 border border-gray-200 rounded text-sm"
                              />
                            </td>
                            <td className="border border-gray-300 px-4 py-2 font-medium">
                              {item.total.toLocaleString()}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              <button
                                type="button"
                                onClick={() => removeCommercialItem(item.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-end">
                      <div className="w-64 space-y-2">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span className="font-medium">{commercial.subtotal.toLocaleString()} {commercial.currency}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>VAT ({commercial.vatRate}%):</span>
                          <span className="font-medium">{commercial.vatAmount.toLocaleString()} {commercial.currency}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 font-bold text-lg">
                          <span>Grand Total:</span>
                          <span>{commercial.total.toLocaleString()} {commercial.currency}</span>
                        </div>
                      </div>
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
                  {editProposal ? 'Update Proposal' : 'Create Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}