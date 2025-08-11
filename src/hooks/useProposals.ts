import { useState, useEffect } from 'react';
import { api } from '../lib/api';

// Simplified Proposal interface for API compatibility
interface SimpleProposal {
  id: string;
  title: string;
  description: string;
  customerId: string;
  vendorId?: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'won' | 'lost';
  value?: number;
  attachments: any[];
  activityLog: any[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mock data for when API is not available
const mockProposals: SimpleProposal[] = [
  {
    id: '1',
    title: 'Smart City IoT Infrastructure',
    description: 'Implementation of IoT sensors and communication systems for smart city initiatives including traffic monitoring, environmental sensors, and public safety systems.',
    customerId: '1',
    vendorId: '1',
    status: 'submitted',
    value: 250000,
    attachments: [
      {
        id: '1',
        name: 'Technical_Specifications.pdf',
        url: '/mock/tech-specs.pdf',
        type: 'application/pdf',
        size: 2048576,
        category: 'technical',
        uploadedBy: 'user1',
        uploadedAt: new Date('2024-01-15'),
      },
      {
        id: '2',
        name: 'Project_Timeline.xlsx',
        url: '/mock/timeline.xlsx',
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: 1024000,
        category: 'reference',
        uploadedBy: 'user1',
        uploadedAt: new Date('2024-01-16'),
      },
    ],
    activityLog: [
      {
        id: '1',
        user: 'Ahmed Al-Rashid',
        action: 'created',
        timestamp: new Date('2024-01-15T10:00:00'),
        details: 'Initial proposal created',
      },
      {
        id: '2',
        user: 'Ahmed Al-Rashid',
        action: 'status_changed',
        timestamp: new Date('2024-01-16T14:30:00'),
        details: 'Status changed from draft to submitted',
      },
      {
        id: '3',
        user: 'Fatima Al-Zahra',
        action: 'attachment_added',
        timestamp: new Date('2024-01-16T15:00:00'),
        details: 'Added Technical_Specifications.pdf',
      },
    ],
    createdBy: 'user1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-16'),
  },
  {
    id: '2',
    title: 'Digital Transformation Initiative',
    description: 'Complete digital transformation of business processes including ERP implementation, workflow automation, and staff training programs.',
    customerId: '2',
    vendorId: '2',
    status: 'approved',
    value: 500000,
    attachments: [
      {
        id: '3',
        name: 'Business_Requirements.docx',
        url: '/mock/requirements.docx',
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 1536000,
        category: 'technical',
        uploadedBy: 'user2',
        uploadedAt: new Date('2024-02-01'),
      },
    ],
    activityLog: [
      {
        id: '4',
        user: 'Fatima Al-Zahra',
        action: 'created',
        timestamp: new Date('2024-02-01T09:00:00'),
        details: 'Proposal created for digital transformation',
      },
      {
        id: '5',
        user: 'Ahmed Al-Rashid',
        action: 'status_changed',
        timestamp: new Date('2024-02-05T11:00:00'),
        details: 'Status changed to approved',
      },
    ],
    createdBy: 'user2',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-05'),
  },
  {
    id: '3',
    title: 'Cybersecurity Assessment',
    description: 'Comprehensive cybersecurity assessment and implementation of security measures for enterprise infrastructure.',
    customerId: '3',
    status: 'under_review',
    value: 75000,
    attachments: [],
    activityLog: [
      {
        id: '6',
        user: 'Omar Hassan',
        action: 'created',
        timestamp: new Date('2024-02-10T13:00:00'),
        details: 'Security assessment proposal created',
      },
    ],
    createdBy: 'user3',
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10'),
  },
];

const mockCustomers = [
          { id: '1', name: 'Saudi Telecom Company', email: 'contact@stc.com.sa', phone: '+966 550188288', company: 'STC' },
  { id: '2', name: 'SABIC Industries', email: 'info@sabic.com', phone: '+966 13 987 6543', company: 'SABIC' },
  { id: '3', name: 'ARAMCO Digital', email: 'digital@aramco.com', phone: '+966 12 555 7890', company: 'ARAMCO' },
];

const mockVendors = [
          { id: '1', name: 'TechCorp Solutions', email: 'contact@techcorp.com', phone: '+966 550188288', contactPerson: 'Ahmed Al-Rashid' },
  { id: '2', name: 'CloudNet Services', email: 'info@cloudnet.sa', phone: '+966 13 987 6543', contactPerson: 'Fatima Al-Zahra' },
];

export function useProposals() {
  const [proposals, setProposals] = useState<SimpleProposal[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        fetchProposals(),
        fetchCustomers(),
        fetchVendors(),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProposals = async () => {
    try {
      const { proposals } = await api.getProposals();
      setProposals(proposals.map((p: any) => {
        // Helper function to safely convert date strings to Date objects
        const safeDate = (dateValue: any): Date => {
          if (!dateValue) return new Date();
          try {
            const date = new Date(dateValue);
            return isNaN(date.getTime()) ? new Date() : date;
          } catch (error) {
            console.error('Error parsing date:', dateValue, error);
            return new Date();
          }
        };

        return {
          id: p.id,
          title: p.title,
          description: p.description,
          customerId: p.customer_id || p.customerId,
          vendorId: p.vendor_id || p.vendorId,
          status: p.status,
          value: p.value,
          attachments: p.attachments || [],
          activityLog: p.activity_log || p.activityLog || [],
          createdBy: p.created_by || p.createdBy,
          createdAt: safeDate(p.created_at || p.createdAt),
          updatedAt: safeDate(p.updated_at || p.updatedAt),
        };
      }));
    } catch (error) {
      console.error('Error fetching proposals:', error);
      // Fallback to mock data
      setProposals(mockProposals);
    }
  };

  const fetchCustomers = async () => {
    try {
      const { customers } = await api.getCustomers();
      setCustomers(customers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      // Fallback to mock data
      setCustomers(mockCustomers);
    }
  };

  const fetchVendors = async () => {
    try {
      const { vendors } = await api.getVendors();
      setVendors(vendors);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      // Fallback to mock data
      setVendors(mockVendors);
    }
  };

  const addProposal = async (proposal: Omit<SimpleProposal, 'id' | 'createdAt' | 'updatedAt' | 'attachments' | 'activityLog'>) => {
    try {
      const { proposal: newProposal } = await api.createProposal(proposal);
      setProposals(prev => [newProposal, ...prev]);
      return newProposal;
    } catch (error) {
      console.error('Error in addProposal:', error);
      throw error;
    }
  };

  const updateProposal = async (id: string, updates: Partial<SimpleProposal>) => {
    try {
      const { proposal: updatedProposal } = await api.updateProposal(id, updates);
      setProposals(prev => prev.map(proposal => 
        proposal.id === id 
          ? updatedProposal 
          : proposal
      ));
    } catch (error) {
      console.error('Error in updateProposal:', error);
      throw error;
    }
  };

  const deleteProposal = async (id: string) => {
    try {
      await api.deleteProposal(id);
      setProposals(prev => prev.filter(proposal => proposal.id !== id));
    } catch (error) {
      console.error('Error in deleteProposal:', error);
      throw error;
    }
  };

  const uploadAttachment = async (proposalId: string, file: File) => {
    try {
      // For now, create a mock attachment since API doesn't support file uploads
      const newAttachment = {
        id: Date.now().toString(),
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
        size: file.size,
        category: 'other' as const,
        uploadedBy: 'current-user',
        uploadedAt: new Date(),
      };

      setProposals(prev => prev.map(proposal => 
        proposal.id === proposalId 
          ? { 
              ...proposal, 
              attachments: [...proposal.attachments, newAttachment],
              activityLog: [
                ...proposal.activityLog,
                {
                  id: Date.now().toString(),
                  user: 'Current User',
                  action: 'attachment_added',
                  timestamp: new Date(),
                  details: `Added ${file.name}`,
                },
              ],
            }
          : proposal
      ));
      return newAttachment;
    } catch (error) {
      console.error('Error in uploadAttachment:', error);
      throw error;
    }
  };

  const removeAttachment = async (proposalId: string, attachmentId: string) => {
    try {
      const proposal = proposals.find(p => p.id === proposalId);
      if (!proposal) return;
      
      const updatedAttachments = proposal.attachments.filter(att => att.id !== attachmentId);
      
      const { proposal: updatedProposal } = await api.updateProposal(proposalId, { attachments: updatedAttachments });
      setProposals(prev => prev.map(p => 
        p.id === proposalId 
          ? updatedProposal 
          : p
      ));
    } catch (error) {
      console.error('Error in removeAttachment:', error);
      throw error;
    }
  };

  return {
    proposals,
    customers,
    vendors,
    isLoading,
    addProposal,
    updateProposal,
    deleteProposal,
    uploadAttachment,
    removeAttachment,
    refetch: fetchAllData,
  };
}