export interface Project {
  id: string;
  title: string;
  description: string;
  customerId: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  tags: string[];
  
  // Project Details
  objectives: string[];
  scope: string;
  deliverables: string[];
  assumptions: string[];
  constraints: string[];
  successCriteria: string[];
  
  // Team & Resources
  managerId: string;
  assignedTo: string[];
  resources: ProjectResource[];
  stakeholders: ProjectStakeholder[];
  
  // Timeline
  startDate: Date;
  endDate?: Date;
  estimatedDuration: number;
  phases: ProjectPhase[];
  milestones: ProjectMilestone[];
  
  // Budget
  budget?: number;
  currency: string;
  budgetBreakdown: BudgetBreakdown[];
  contingency: number;
  
  // Risk Management
  risks: ProjectRisk[];
  mitigation: string;
  
  // Progress & Status
  progress: number;
  documents: ProjectDocument[];
  
  // Activity Log
  activityLog: ProjectActivity[];
  
  // Customer Data (for new customers)
  newCustomerData?: NewCustomerData;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectResource {
  id: string;
  name: string;
  type: 'human' | 'equipment' | 'software' | 'other';
  description: string;
  cost?: number;
  availability: string;
}

export interface ProjectStakeholder {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  influence: 'low' | 'medium' | 'high';
  interest: 'low' | 'medium' | 'high';
}

export interface ProjectPhase {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'planned' | 'active' | 'completed' | 'delayed';
  deliverables: string[];
  dependencies: string[];
  progress: number;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: 'pending' | 'completed' | 'overdue';
  criteria: string[];
  completedDate?: Date;
}

export interface BudgetBreakdown {
  id: string;
  category: string;
  amount: number;
  description: string;
  spent?: number;
}

export interface ProjectRisk {
  id: string;
  title: string;
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  category: 'technical' | 'financial' | 'operational' | 'external' | 'other';
  mitigation: string;
  owner: string;
  status: 'identified' | 'mitigated' | 'occurred' | 'closed';
}

export interface ProjectDocument {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  category: 'requirement' | 'design' | 'technical' | 'contract' | 'other';
  uploadedBy: string;
  uploadedAt: Date;
}

export interface ProjectActivity {
  id: string;
  user: string;
  action: string;
  timestamp: Date;
  details?: string;
  section?: string;
}

export interface NewCustomerData {
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  industry: string;
  website: string;
}

// Project Template Types
export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  phases: ProjectPhase[];
  milestones: ProjectMilestone[];
  deliverables: string[];
  risks: ProjectRisk[];
  estimatedDuration: number;
}

// Project Report Types
export interface ProjectReport {
  id: string;
  projectId: string;
  type: 'status' | 'progress' | 'financial' | 'risk' | 'completion';
  title: string;
  content: string;
  generatedAt: Date;
  generatedBy: string;
}