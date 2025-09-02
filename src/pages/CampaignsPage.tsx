import { useState, useMemo, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { useNavigate } from 'react-router-dom'
import { 
  Plus, 
  Play, 
  Pause, 
  Copy, 
  Edit, 
  Trash2, 
  MessageSquare, 
  Mail, 
  Phone, 
  Clock,
  Users,
  TrendingUp,
  ChevronRight,
  Sparkles,
  Eye,
  Save
} from 'lucide-react'

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
  conditions?: {
    on_response?: 'continue' | 'stop' | 'jump_to'
    on_no_response?: 'continue' | 'stop' | 'jump_to'
    jump_to_step?: string
  }
}

interface CampaignQuestions {
  name: string
  goal: string
  target_audience: string
  program_details: string
  key_benefits: string
  objections: string
  tone: 'professional' | 'friendly' | 'urgent' | 'casual'
  desired_action: string
}

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'New Student Onboarding',
    description: 'Automated workflow for new student inquiries',
    type: 'predefined',
    is_active: true,
    steps: [
      {
        id: 'step1',
        type: 'sms',
        name: 'Welcome SMS',
        content: 'Hi {{first_name}}! Thanks for your interest in our program. I\'m Sarah from admissions. Can we schedule a quick 10-minute call to discuss your goals?',
        delay: 5,
        delay_unit: 'minutes'
      },
      {
        id: 'step2',
        type: 'email',
        name: 'Follow-up Email',
        content: 'Hi {{first_name}},\n\nI wanted to follow up on your interest in our program...',
        subject: 'Your Program Information - {{first_name}}',
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
      active_prospects: 23,
      total_sent: 156,
      responses: 89,
      conversions: 12
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
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
  }
]

export default function CampaignsListPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [campaignQuestions, setCampaignQuestions] = useState<CampaignQuestions>({
    name: '',
    goal: '',
    target_audience: '',
    program_details: '',
    key_benefits: '',
    objections: '',
    tone: 'professional',
    desired_action: ''
  })
  const [generatedPrompts, setGeneratedPrompts] = useState<CampaignStep[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

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

  const generatePrompts = useCallback(async () => {
    setIsGenerating(true)
    try {
      // Simulate AI prompt generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const generated: CampaignStep[] = [
        {
          id: 'gen-sms-1',
          type: 'sms',
          name: 'Initial Contact SMS',
          content: `Hi {{first_name}}! I'm Sarah from ${campaignQuestions.program_details}. I saw your interest in our program. ${campaignQuestions.key_benefits}. Can we chat for 10 minutes about your goals?`,
          delay: 5,
          delay_unit: 'minutes'
        },
        {
          id: 'gen-email-1',
          type: 'email',
          name: 'Follow-up Email',
          subject: `Your ${campaignQuestions.program_details} Journey Starts Here, {{first_name}}`,
          content: `Hi {{first_name}},\n\nI hope this email finds you well. I wanted to personally reach out regarding your interest in ${campaignQuestions.program_details}.\n\n${campaignQuestions.key_benefits}\n\nI understand you might have concerns about ${campaignQuestions.objections}, and I'd love to address those directly.\n\n${campaignQuestions.desired_action}\n\nBest regards,\nSarah Johnson\nAdmissions Team`,
          delay: 2,
          delay_unit: 'hours'
        },
        {
          id: 'gen-voice-1',
          type: 'voice',
          name: 'AI Follow-up Call',
          content: `Hi {{first_name}}, this is Sarah from the admissions team at ${campaignQuestions.program_details}. I wanted to personally follow up on your inquiry. ${campaignQuestions.key_benefits}. I have just a few minutes to discuss how this program can help you achieve ${campaignQuestions.goal}. Are you available for a quick chat?`,
          delay: 1,
          delay_unit: 'days'
        }
      ]
      
      setGeneratedPrompts(generated)
      setCurrentStep(2)
      
      toast({
        title: "Prompts Generated!",
        description: "AI has created personalized campaign content based on your inputs.",
      })
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate prompts. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }, [campaignQuestions, toast])

  const updatePromptContent = useCallback((stepId: string, field: string, value: string) => {
    setGeneratedPrompts(prev => prev.map(step => 
      step.id === stepId ? { ...step, [field]: value } : step
    ))
  }, [])

  const saveCampaign = useCallback(async () => {
    try {
      const newCampaign: Campaign = {
        id: Date.now().toString(),
        name: campaignQuestions.name,
        description: `${campaignQuestions.goal} - ${campaignQuestions.target_audience}`,
        type: 'custom',
        is_active: false,
        steps: generatedPrompts,
        triggers: ['inquiry_received'],
        settings: {
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      setCampaigns(prev => [newCampaign, ...prev])
      
      // Reset form
      setCampaignQuestions({
        name: '',
        goal: '',
        target_audience: '',
        program_details: '',
        key_benefits: '',
        objections: '',
        tone: 'professional',
        desired_action: ''
      })
      setGeneratedPrompts([])
      setCurrentStep(1)
      setIsCreateDialogOpen(false)
      
      toast({
        title: "Campaign Created!",
        description: "Your campaign has been saved and is ready to activate.",
      })
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save campaign. Please try again.",
        variant: "destructive",
      })
    }
  }, [campaignQuestions, generatedPrompts, toast])

  const toggleCampaign = useCallback((campaignId: string) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === campaignId 
        ? { ...campaign, is_active: !campaign.is_active }
        : campaign
    ))
  }, [])

  const duplicateCampaign = useCallback((campaign: Campaign) => {
    const duplicated: Campaign = {
      ...campaign,
      id: Date.now().toString(),
      name: `${campaign.name} (Copy)`,
      is_active: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metrics: {
        active_prospects: 0,
        total_sent: 0,
        responses: 0,
        conversions: 0
      }
    }
    setCampaigns(prev => [duplicated, ...prev])
    
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

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">Campaign Management</h1>
            <p className="text-gray-600">Create and manage multi-channel outreach campaigns</p>
          </div>
          
          <Button 
            className="flex items-center space-x-2"
            onClick={() => navigate('/campaigns/builder')}
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
                      <CardTitle className="text-lg text-black">{campaign.name}</CardTitle>
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
        </div>
      </div>
    </div>
  )
}