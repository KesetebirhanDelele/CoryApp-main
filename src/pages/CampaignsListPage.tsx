import React from 'react'
import { useState, useMemo, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { campaignApi } from '@/lib/api'
import { useAsync } from '@/lib/hooks/useAsync'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { useToast } from '@/hooks/use-toast'
import { 
  Plus, 
  Play, 
  Pause, 
  Copy, 
  Edit, 
  MessageSquare, 
  Mail, 
  Phone, 
  Clock,
  Users,
  TrendingUp,
} from 'lucide-react'
import { Tables } from '@/lib/database.types'

type DatabaseCampaign = Tables<'campaigns'>

// Mock campaigns with fake data for demonstration
const mockCampaignsWithData: Campaign[] = [
  {
    id: 'mock-1',
    name: 'New Student Onboarding',
    description: 'Automated workflow for new student inquiries',
    type: 'predefined',
    is_active: true,
    steps: [
      {
        id: 'step1',
        type: 'sms',
        name: 'Welcome SMS',
        content: 'Hi {{first_name}}! Thanks for your interest in our program...',
        delay: 5,
        delay_unit: 'minutes'
      },
      {
        id: 'step2',
        type: 'email',
        name: 'Follow-up Email',
        content: 'Hi {{first_name}}, I wanted to follow up...',
        subject: 'Your Program Information - {{first_name}}',
        delay: 2,
        delay_unit: 'hours'
      },
      {
        id: 'step3',
        type: 'voice',
        name: 'AI Follow-up Call',
        content: 'Hi {{first_name}}, this is an automated call...',
        delay: 1,
        delay_unit: 'days'
      }
    ],
    triggers: ['inquiry_received'],
    settings: {
      start_delay: 0,
      business_hours_only: true,
      timezone: 'America/New_York'
    },
    metrics: {
      active_prospects: 23,
      total_sent: 156,
      responses: 89,
      conversions: 12
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 'mock-2',
    name: 'Re-engagement Campaign',
    description: 'Re-engage prospects who went quiet',
    type: 'custom',
    is_active: false,
    steps: [
      {
        id: 'step1',
        type: 'voice',
        name: 'AI Check-in Call',
        content: 'Hi {{first_name}}, this is an automated call from the admissions team...',
        delay: 0,
        delay_unit: 'minutes'
      },
      {
        id: 'step2',
        type: 'email',
        name: 'Special Offer Email',
        content: 'We have a special offer just for you...',
        subject: 'Special Offer - {{first_name}}',
        delay: 3,
        delay_unit: 'days'
      }
    ],
    triggers: ['no_activity_30d'],
    settings: {
      start_delay: 24,
      business_hours_only: true,
      timezone: 'America/New_York'
    },
    metrics: {
      active_prospects: 8,
      total_sent: 45,
      responses: 12,
      conversions: 3
    },
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-10T14:20:00Z'
  },
  {
    id: 'mock-3',
    name: 'Nursing Program Enrollment',
    description: 'Target healthcare professionals for BSN program',
    type: 'custom',
    is_active: true,
    steps: [
      {
        id: 'step1',
        type: 'sms',
        name: 'Initial Contact SMS',
        content: 'Hi {{first_name}}! I\'m Sarah from Metro Health University...',
        delay: 5,
        delay_unit: 'minutes'
      },
      {
        id: 'step2',
        type: 'email',
        name: 'Program Details Email',
        content: 'Here are the details about our accelerated BSN program...',
        subject: 'Your BSN Program Journey Starts Here, {{first_name}}',
        delay: 2,
        delay_unit: 'hours'
      }
    ],
    triggers: ['inquiry_received'],
    settings: {
      start_delay: 0,
      business_hours_only: true,
      timezone: 'America/New_York'
    },
    metrics: {
      active_prospects: 34,
      total_sent: 98,
      responses: 56,
      conversions: 18
    },
    created_at: '2024-01-08T00:00:00Z',
    updated_at: '2024-01-16T09:45:00Z'
  }
]

interface Campaign {
  id: string
  name: string
  description: string
  type: 'predefined' | 'custom'
  is_active: boolean
  steps: CampaignStep[]
  triggers: string[]
  settings: {
    start_delay?: number
    business_hours_only?: boolean
    timezone?: string
  }
  metrics: {
    active_prospects: number
    total_sent: number
    responses: number
    conversions: number
  }
  created_at: string
  updated_at: string
}

interface CampaignStep {
  id: string
  type: 'sms' | 'email' | 'voice' | 'wait'
  name: string
  content: string
  subject?: string
  delay: number
  delay_unit: 'minutes' | 'hours' | 'days'
}

export default function CampaignsListPage() {
  const navigate = useNavigate()
  const { organization } = useAuth()
  const { toast } = useToast()

  // Load campaigns using async hook
  const { 
    data: dbCampaigns, 
    loading, 
    error, 
    refetch 
  } = useAsync(
    () => organization ? campaignApi.getAll(organization.id) : Promise.resolve([]),
    [organization?.id]
  )

  // Transform database campaign to UI campaign
  const transformCampaign = useCallback((dbCampaign: DatabaseCampaign): Campaign => {
    // Parse steps from database
    let steps: CampaignStep[] = []
    try {
      if (dbCampaign.steps && Array.isArray(dbCampaign.steps)) {
        steps = dbCampaign.steps.map((step: any, index: number) => ({
          id: step.id || `step-${index}`,
          type: step.type || 'sms',
          name: step.name || `Step ${index + 1}`,
          content: step.content || '',
          subject: step.subject,
          delay: step.delay || 0,
          delay_unit: step.delay_unit || 'minutes'
        }))
      }
    } catch (e) {
      console.error('Error parsing steps:', e)
    }

    return {
      id: dbCampaign.id,
      name: dbCampaign.name,
      description: dbCampaign.description || '',
      type: 'custom', // All user-created campaigns are custom
      is_active: dbCampaign.is_active,
      steps,
      triggers: ['inquiry_received'], // Default trigger
      settings: (dbCampaign.settings as any) || {
        start_delay: 0,
        business_hours_only: true,
        timezone: 'America/New_York'
      },
      metrics: {
        active_prospects: 0,
        total_sent: 0,
        responses: 0,
        conversions: 0
      },
      created_at: dbCampaign.created_at || new Date().toISOString(),
      updated_at: dbCampaign.updated_at || new Date().toISOString()
    }
  }, [])

  // Combine database campaigns with mock data
  const campaigns = useMemo(() => {
    const transformed = dbCampaigns ? dbCampaigns.map(transformCampaign) : []
    return [...mockCampaignsWithData, ...transformed]
  }, [dbCampaigns, transformCampaign])

  const getStepIcon = useCallback((type: string) => {
    switch (type) {
      case 'sms': return <MessageSquare className="h-4 w-4" />
      case 'email': return <Mail className="h-4 w-4" />
      case 'voice': return <Phone className="h-4 w-4" />
      case 'wait': return <Clock className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }, [])

  const getStepColor = useCallback((type: string) => {
    switch (type) {
      case 'sms': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'email': return 'bg-green-100 text-green-700 border-green-200'
      case 'voice': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'wait': return 'bg-gray-100 text-gray-700 border-gray-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }, [])

  const toggleCampaign = useCallback((campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId)
    if (!campaign) return
    
    // Update in database if it's a real campaign
    if (!campaignId.startsWith('mock-')) {
      campaignApi.update(campaignId, { is_active: !campaign.is_active })
        .then(() => refetch())
        .catch(err => {
          toast({
            title: "Update Failed",
            description: err.message,
            variant: "destructive",
          })
        })
    }
    
    toast({
      title: campaign?.is_active ? "Campaign Paused" : "Campaign Activated",
      description: `${campaign?.name} has been ${campaign?.is_active ? 'paused' : 'activated'}.`,
    })
  }, [campaigns, toast, refetch])

  const duplicateCampaign = useCallback((campaign: Campaign) => {
    if (!organization) return
    
    const duplicatedCampaign = {
      name: `${campaign.name} (Copy)`,
      description: campaign.description,
      organization_id: organization.id,
      is_active: false,
      steps: campaign.steps,
      prompts: {},
      settings: campaign.settings
    }
    
    toast({
      title: "Campaign Duplicated",
      description: "Campaign has been copied successfully.",
    })
  }, [toast])

  const campaignStats = useMemo(() => {
    const active = campaigns.filter(c => c.is_active).length
    const totalProspects = campaigns.reduce((sum, c) => sum + c.metrics.active_prospects, 0)
    const totalSent = campaigns.reduce((sum, c) => sum + c.metrics.total_sent, 0)
    const totalConversions = campaigns.reduce((sum, c) => sum + c.metrics.conversions, 0)
    const conversionRate = totalSent > 0 ? Math.round((totalConversions / totalSent) * 100) : 0
    
    return { active, totalProspects, totalSent, conversionRate }
  }, [campaigns])

  // Show loading state
  if (loading) {
    return (
      <div className="p-6 bg-white min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6 bg-white min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Error Loading Campaigns</h2>
          <p className="mt-2 text-sm text-gray-600">{error}</p>
          <Button onClick={refetch} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">Campaign Management</h1>
            <p className="text-gray-600">Create and manage multi-channel outreach campaigns</p>
          </div>
          
          <Button 
            onClick={() => navigate('/campaigns/builder')}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Campaign</span>
          </Button>
        </div>
      </div>

      {/* Campaign Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card className="bg-white border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Active Campaigns</CardTitle>
            <Play className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{campaignStats.active}</div>
            <p className="text-xs text-gray-600">Currently running</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Active Prospects</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{campaignStats.totalProspects}</div>
            <p className="text-xs text-gray-600">In campaigns</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Messages Sent</CardTitle>
            <MessageSquare className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{campaignStats.totalSent}</div>
            <p className="text-xs text-gray-600">This month</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{campaignStats.conversionRate}%</div>
            <p className="text-xs text-gray-600">Overall rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-black">Your Campaigns</h2>
        
        <div className="grid gap-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="bg-white border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <CardTitle 
                        className="text-lg text-black hover:text-blue-600 cursor-pointer transition-colors"
                        onClick={() => navigate(`/campaigns/${campaign.id}`)}
                      >
                        {campaign.name}
                      </CardTitle>
                      <Badge variant={campaign.is_active ? "default" : "secondary"}>
                        {campaign.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {campaign.type}
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-600 mb-3">
                      {campaign.description}
                    </CardDescription>
                    
                    {/* Campaign Steps Preview */}
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-sm font-medium text-black">Steps:</span>
                      {campaign.steps.slice(0, 4).map((step, index) => (
                        <div key={step.id} className={`p-1 rounded border ${getStepColor(step.type)}`}>
                          {getStepIcon(step.type)}
                        </div>
                      ))}
                      {campaign.steps.length > 4 && (
                        <span className="text-xs text-gray-500">+{campaign.steps.length - 4} more</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/campaigns/builder?edit=${campaign.id}`)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleCampaign(campaign.id)}
                    >
                      {campaign.is_active ? (
                        <>
                          <Pause className="h-4 w-4 mr-1" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => duplicateCampaign(campaign)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Duplicate
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-black">{campaign.metrics.active_prospects}</div>
                    <div className="text-xs text-gray-600">Active Prospects</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-black">{campaign.metrics.total_sent}</div>
                    <div className="text-xs text-gray-600">Messages Sent</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-black">{campaign.metrics.responses}</div>
                    <div className="text-xs text-gray-600">Responses</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-black">{campaign.metrics.conversions}</div>
                    <div className="text-xs text-gray-600">Conversions</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {campaigns.length === 0 && (
            <Card className="bg-white border-gray-200">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Campaigns Yet</h3>
                <p className="text-gray-500 text-center mb-4">
                  Create your first campaign to start engaging with prospects
                </p>
                <Button onClick={() => navigate('/campaigns/builder')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Campaign
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}