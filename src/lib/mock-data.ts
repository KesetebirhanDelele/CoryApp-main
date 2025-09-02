// Memoized data to prevent unnecessary re-renders
export const mockProspects = [
  {
    id: '1',
    institution_id: 'org-1',
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1-555-0123',
    status: 'new_inquiry' as const,
    source: 'Website Form',
    campaign_id: 'campaign-1',
    current_campaign_stage: 'initial_contact',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    institution_id: 'org-1',
    first_name: 'Michael',
    last_name: 'Chen',
    email: 'michael.chen@email.com',
    phone: '+1-555-0124',
    status: 'contacted' as const,
    source: 'Canvas LMS',
    campaign_id: 'campaign-2',
    current_campaign_stage: 'follow_up',
    created_at: '2024-01-14T14:20:00Z',
    updated_at: '2024-01-15T09:15:00Z',
  },
  {
    id: '3',
    institution_id: 'org-1',
    first_name: 'Emily',
    last_name: 'Rodriguez',
    email: 'emily.rodriguez@email.com',
    phone: '+1-555-0125',
    status: 'appointment_set' as const,
    source: 'HubSpot',
    campaign_id: 'campaign-1',
    current_campaign_stage: 'appointment_scheduled',
    created_at: '2024-01-13T16:45:00Z',
    updated_at: '2024-01-14T11:30:00Z',
  },
  {
    id: '4',
    institution_id: 'org-1',
    first_name: 'David',
    last_name: 'Thompson',
    email: 'david.thompson@email.com',
    phone: '+1-555-0126',
    status: 'applied' as const,
    source: 'Referral',
    campaign_id: 'campaign-3',
    current_campaign_stage: 'application_submitted',
    created_at: '2024-01-12T09:00:00Z',
    updated_at: '2024-01-14T15:20:00Z',
  },
  {
    id: '5',
    institution_id: 'org-1',
    first_name: 'Jessica',
    last_name: 'Williams',
    email: 'jessica.williams@email.com',
    phone: '+1-555-0127',
    status: 'enrolled' as const,
    source: 'Higher Gear',
    campaign_id: 'campaign-4',
    current_campaign_stage: 'enrollment_complete',
    created_at: '2024-01-10T13:15:00Z',
    updated_at: '2024-01-13T10:45:00Z',
  },
]

export const mockCampaigns = [
  {
    id: 'campaign-1',
    institution_id: 'org-1',
    name: 'New Student Onboarding',
    description: 'Automated workflow for new student inquiries',
    type: 'predefined' as const,
    definition: {
      stages: ['initial_contact', 'follow_up', 'appointment_scheduled', 'enrolled'],
      triggers: ['inquiry_received', 'no_response_24h', 'appointment_booked'],
      actions: ['send_welcome_email', 'schedule_call', 'send_sms_reminder']
    },
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'campaign-2',
    institution_id: 'org-1',
    name: 'Re-engagement Campaign',
    description: 'Re-engage prospects who went quiet',
    type: 'predefined' as const,
    definition: {
      stages: ['dormant', 'follow_up', 'interested', 'scheduled'],
      triggers: ['no_activity_30d', 'email_opened', 'link_clicked'],
      actions: ['send_reengagement_email', 'ai_call', 'send_special_offer']
    },
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
]

export const mockIntegrations = [
  {
    id: 'canvas-integration',
    org_id: 'org-1',
    integration_type: 'canvas' as const,
    status: 'connected' as const,
    connected_at: '2024-01-10T15:30:00Z',
    updated_at: '2024-01-15T09:00:00Z',
    created_by: 'user-1'
  },
  {
    id: 'hubspot-integration',
    org_id: 'org-1',
    integration_type: 'hubspot' as const,
    status: 'connected' as const,
    connected_at: '2024-01-08T10:00:00Z',
    updated_at: '2024-01-14T16:30:00Z',
    created_by: 'user-1'
  },
  {
    id: 'hgl-integration',
    org_id: 'org-1',
    integration_type: 'hgl' as const,
    status: 'disconnected' as const,
    updated_at: '2024-01-01T00:00:00Z',
    created_by: 'user-1'
  },
  {
    id: 'webhook-integration',
    org_id: 'org-1',
    integration_type: 'webhook' as const,
    status: 'disconnected' as const,
    updated_at: '2024-01-01T00:00:00Z',
    created_by: 'user-1'
  }
]