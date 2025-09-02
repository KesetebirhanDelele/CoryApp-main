import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Users, 
  MessageSquare, 
  Mail, 
  Phone, 
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit
} from 'lucide-react'

interface CampaignDetails {
  id: string
  name: string
  description: string
  status: 'active' | 'paused' | 'completed'
  created_at: string
  updated_at: string
  metrics: {
    total_prospects: number
    active_prospects: number
    completed_prospects: number
    total_sent: number
    responses: number
    conversions: number
    conversion_rate: number
    response_rate: number
  }
  steps: Array<{
    id: string
    type: 'sms' | 'email' | 'voice'
    name: string
    sent: number
    delivered: number
    opened?: number
    clicked?: number
    responded: number
  }>
  recent_activity: Array<{
    id: string
    type: 'prospect_added' | 'message_sent' | 'response_received' | 'conversion'
    prospect_name: string
    message: string
    timestamp: string
  }>
  prospects: Array<{
    id: string
    name: string
    email: string
    phone: string
    status: 'active' | 'completed' | 'opted_out'
    current_step: number
    last_contact: string
    responses: number
    converted: boolean
  }>
}

// Mock data for campaign details
const mockCampaignDetails: CampaignDetails = {
  id: '1',
  name: 'New Student Onboarding',
  description: 'Automated workflow for new student inquiries',
  status: 'active',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-15T10:30:00Z',
  metrics: {
    total_prospects: 156,
    active_prospects: 89,
    completed_prospects: 67,
    total_sent: 423,
    responses: 187,
    conversions: 34,
    conversion_rate: 21.8,
    response_rate: 44.2
  },
  steps: [
    {
      id: 'step1',
      type: 'sms',
      name: 'Welcome SMS',
      sent: 156,
      delivered: 154,
      responded: 89
    },
    {
      id: 'step2',
      type: 'email',
      name: 'Follow-up Email',
      sent: 134,
      delivered: 132,
      opened: 98,
      clicked: 45,
      responded: 67
    },
    {
      id: 'step3',
      type: 'voice',
      name: 'AI Follow-up Call',
      sent: 89,
      delivered: 87,
      responded: 31
    }
  ],
  recent_activity: [
    {
      id: '1',
      type: 'conversion',
      prospect_name: 'Sarah Johnson',
      message: 'Converted to enrollment',
      timestamp: '2024-01-15T14:30:00Z'
    },
    {
      id: '2',
      type: 'response_received',
      prospect_name: 'Michael Chen',
      message: 'Responded to follow-up email',
      timestamp: '2024-01-15T13:45:00Z'
    },
    {
      id: '3',
      type: 'message_sent',
      prospect_name: 'Emily Rodriguez',
      message: 'AI call completed',
      timestamp: '2024-01-15T12:20:00Z'
    },
    {
      id: '4',
      type: 'prospect_added',
      prospect_name: 'David Thompson',
      message: 'Added to campaign',
      timestamp: '2024-01-15T11:15:00Z'
    }
  ],
  prospects: [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1-555-0123',
      status: 'completed',
      current_step: 3,
      last_contact: '2024-01-15T14:30:00Z',
      responses: 3,
      converted: true
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      phone: '+1-555-0124',
      status: 'active',
      current_step: 2,
      last_contact: '2024-01-15T13:45:00Z',
      responses: 2,
      converted: false
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@email.com',
      phone: '+1-555-0125',
      status: 'active',
      current_step: 3,
      last_contact: '2024-01-15T12:20:00Z',
      responses: 1,
      converted: false
    },
    {
      id: '4',
      name: 'David Thompson',
      email: 'david.thompson@email.com',
      phone: '+1-555-0126',
      status: 'active',
      current_step: 1,
      last_contact: '2024-01-15T11:15:00Z',
      responses: 0,
      converted: false
    }
  ]
}

export default function CampaignDetailsPage() {
  const { campaignId } = useParams()
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState<CampaignDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading campaign details
    const loadCampaign = async () => {
      setLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setCampaign(mockCampaignDetails)
      setLoading(false)
    }

    loadCampaign()
  }, [campaignId])

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'sms': return <MessageSquare className="h-4 w-4" />
      case 'email': return <Mail className="h-4 w-4" />
      case 'voice': return <Phone className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'prospect_added': return <Users className="h-4 w-4 text-blue-500" />
      case 'message_sent': return <MessageSquare className="h-4 w-4 text-green-500" />
      case 'response_received': return <Mail className="h-4 w-4 text-orange-500" />
      case 'conversion': return <TrendingUp className="h-4 w-4 text-purple-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getProspectStatusIcon = (status: string, converted: boolean) => {
    if (converted) return <CheckCircle className="h-4 w-4 text-green-500" />
    switch (status) {
      case 'active': return <Clock className="h-4 w-4 text-blue-500" />
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'opted_out': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n.charAt(0)).join('')
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Campaign Not Found</h2>
          <p className="mt-2 text-sm text-gray-600">The campaign you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/campaigns')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/campaigns')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-black">{campaign.name}</h1>
                <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                  {campaign.status}
                </Badge>
              </div>
              <p className="text-gray-600">{campaign.description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>Preview</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </Button>
            <Button className="flex items-center space-x-2">
              {campaign.status === 'active' ? (
                <>
                  <Pause className="h-4 w-4" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span>Activate</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prospects</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.metrics.total_prospects}</div>
            <p className="text-xs text-gray-600">
              {campaign.metrics.active_prospects} active, {campaign.metrics.completed_prospects} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
            <MessageSquare className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.metrics.total_sent}</div>
            <p className="text-xs text-gray-600">
              {campaign.metrics.responses} responses received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.metrics.response_rate}%</div>
            <Progress value={campaign.metrics.response_rate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.metrics.conversions}</div>
            <p className="text-xs text-gray-600">
              {campaign.metrics.conversion_rate}% conversion rate
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="prospects">Prospects</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Campaign Steps Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Step Performance</CardTitle>
                <CardDescription>How each campaign step is performing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {campaign.steps.map((step, index) => (
                  <div key={step.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getStepIcon(step.type)}
                        <span className="font-medium">Step {index + 1}: {step.name}</span>
                      </div>
                      <Badge variant="outline">{step.type.toUpperCase()}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Sent</p>
                        <p className="font-semibold">{step.sent}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Delivered</p>
                        <p className="font-semibold">{step.delivered}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Responded</p>
                        <p className="font-semibold">{step.responded}</p>
                      </div>
                    </div>
                    {step.opened && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Opened</p>
                          <p className="font-semibold">{step.opened}</p>
                        </div>
                        {step.clicked && (
                          <div>
                            <p className="text-gray-600">Clicked</p>
                            <p className="font-semibold">{step.clicked}</p>
                          </div>
                        )}
                      </div>
                    )}
                    <Progress 
                      value={(step.responded / step.sent) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest campaign interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaign.recent_activity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.prospect_name}</p>
                        <p className="text-sm text-gray-600">{activity.message}</p>
                        <p className="text-xs text-gray-500">{formatDate(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="prospects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Prospects</CardTitle>
              <CardDescription>All prospects in this campaign</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaign.prospects.map((prospect) => (
                  <div key={prospect.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>{getInitials(prospect.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{prospect.name}</p>
                        <p className="text-sm text-gray-600">{prospect.email}</p>
                        <p className="text-sm text-gray-600">{prospect.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-sm font-medium">Step {prospect.current_step}</p>
                        <p className="text-xs text-gray-600">Current</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">{prospect.responses}</p>
                        <p className="text-xs text-gray-600">Responses</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600">Last Contact</p>
                        <p className="text-sm">{formatDate(prospect.last_contact)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getProspectStatusIcon(prospect.status, prospect.converted)}
                        <Badge variant={prospect.converted ? 'default' : 'outline'}>
                          {prospect.converted ? 'Converted' : prospect.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>How prospects move through the campaign</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Total Prospects</span>
                    <span className="font-semibold">{campaign.metrics.total_prospects}</span>
                  </div>
                  <Progress value={100} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span>Responded</span>
                    <span className="font-semibold">{campaign.metrics.responses}</span>
                  </div>
                  <Progress value={campaign.metrics.response_rate} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span>Converted</span>
                    <span className="font-semibold">{campaign.metrics.conversions}</span>
                  </div>
                  <Progress value={campaign.metrics.conversion_rate} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Channel Performance</CardTitle>
                <CardDescription>Performance by communication channel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {campaign.steps.map((step) => (
                  <div key={step.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStepIcon(step.type)}
                      <span className="capitalize">{step.type}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {((step.responded / step.sent) * 100).toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-600">
                        {step.responded}/{step.sent} responded
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Activity Log</CardTitle>
              <CardDescription>Detailed activity timeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {campaign.recent_activity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 pb-4 border-b last:border-b-0">
                    <div className="p-2 bg-gray-100 rounded-full">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{activity.prospect_name}</p>
                        <p className="text-sm text-gray-500">{formatDate(activity.timestamp)}</p>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{activity.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}