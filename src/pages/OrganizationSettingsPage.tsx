import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { 
  Save, 
  Users, 
  CreditCard, 
  Settings, 
  Building, 
  Mail,
  Plus,
  Trash2,
  Crown,
  Shield,
  User,
  Copy,
  Eye,
  EyeOff,
  RotateCcw,
  CheckCircle,
  XCircle,
  TestTube,
  Loader2,
  ExternalLink
} from 'lucide-react'
import { Tables } from '@/lib/database.types'

type Organization = Tables<'organizations'>
type OrganizationSubscription = Tables<'organization_subscriptions'>
type UserProfile = Tables<'users'>

interface IntegrationConfig {
  type: 'canvas' | 'hubspot' | 'ghl'
  name: string
  description: string
  icon: React.ElementType
  status: 'connected' | 'disconnected'
  webhookUrl?: string
  apiKey?: string
  lastSync?: string
  fields: Array<{
    key: string
    label: string
    type: 'text' | 'password' | 'url' | 'textarea'
    placeholder: string
    required: boolean
  }>
  setupInstructions: string[]
}

const integrationConfigs: IntegrationConfig[] = [
  {
    type: 'canvas',
    name: 'Canvas LMS',
    description: 'Real-time lead ingestion from Canvas course inquiries and applications',
    icon: CanvasIcon,
    status: 'disconnected',
    fields: [
      { key: 'canvas_url', label: 'Canvas Instance URL', type: 'url', placeholder: 'https://yourschool.instructure.com', required: true },
      { key: 'api_token', label: 'Canvas API Token', type: 'password', placeholder: 'Your Canvas API access token', required: true },
      { key: 'webhook_events', label: 'Webhook Events', type: 'textarea', placeholder: 'enrollment_created, user_created, course_progress', required: false }
    ],
    setupInstructions: [
      'Go to Canvas Admin → Developer Keys → Create New Key',
      'Copy the generated API token',
      'In Canvas, go to Settings → Webhooks',
      'Add webhook URL with events: enrollment_created, user_created',
      'Test the connection to verify lead ingestion'
    ]
  },
  {
    type: 'hubspot',
    name: 'HubSpot CRM',
    description: 'Sync contacts and deals from HubSpot workflows in real-time',
    icon: HubSpotIcon,
    status: 'connected',
    webhookUrl: 'https://api.coraai.com/webhooks/lead-intake/hubspot',
    apiKey: 'sk-hs-abc123...xyz789',
    lastSync: '2024-01-15T14:30:00Z',
    fields: [
      { key: 'private_app_token', label: 'Private App Token', type: 'password', placeholder: 'Your HubSpot Private App token', required: true },
      { key: 'portal_id', label: 'Portal ID', type: 'text', placeholder: 'Your HubSpot Portal ID', required: true }
    ],
    setupInstructions: [
      'In HubSpot, go to Settings → Integrations → Private Apps',
      'Create new private app with contacts and deals scopes',
      'Copy the access token',
      'In Workflows, add webhook action with our endpoint',
      'Configure contact properties to send: email, phone, firstname, lastname'
    ]
  },
  {
    type: 'ghl',
    name: 'GoHighLevel (GHL)',
    description: 'Capture leads from GHL funnels, forms, and automation workflows',
    icon: GHLIcon,
    status: 'disconnected',
    fields: [
      { key: 'location_id', label: 'Location ID', type: 'text', placeholder: 'Your GHL Location ID', required: true },
      { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'Your GHL API key', required: true },
      { key: 'webhook_secret', label: 'Webhook Secret', type: 'password', placeholder: 'Optional webhook verification secret', required: false }
    ],
    setupInstructions: [
      'In GHL, go to Settings → Integrations → Webhooks',
      'Create new webhook for "Contact Created" events',
      'Use the webhook URL provided below',
      'Set payload to include: firstName, lastName, email, phone, source',
      'Test webhook to ensure leads flow correctly'
    ]
  }
]

export default function OrganizationSettingsPage() {
  const { user, profile, organization, subscription, refreshProfile } = useAuth()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [teamMembers, setTeamMembers] = useState<UserProfile[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'manager' | 'user'>('user')
  const [isInviting, setIsInviting] = useState(false)
  
  // Integration states
  const [integrations, setIntegrations] = useState(integrationConfigs)
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationConfig | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  
  const orgId = 'org-123' // This would come from auth context
  const baseWebhookUrl = `https://api.coraai.com/webhooks/lead-intake`
  
  const [orgData, setOrgData] = useState<Partial<Organization>>({
    name: '',
    type: 'university',
    domain: '',
    website: '',
    phone: '',
    timezone: 'America/New_York',
    business_hours: { start: '09:00', end: '17:00', days: [1,2,3,4,5] }
  })

  useEffect(() => {
    if (organization) {
      setOrgData(organization)
      fetchTeamMembers()
    }
  }, [organization])

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    })
  }

  const generateApiKey = () => {
    return `sk-${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
  }

  const handleTestConnection = async (integration: IntegrationConfig, formData: FormData) => {
    setIsTesting(true)
    try {
      // Simulate API test call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: "Connection Test Successful",
        description: `Successfully connected to ${integration.name}. Lead ingestion is ready.`,
      })
    } catch (error) {
      toast({
        title: "Connection Test Failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      })
    } finally {
      setIsTesting(false)
    }
  }

  const handleSave = async (integration: IntegrationConfig, formData: FormData) => {
    setIsSaving(true)
    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Update integration status
      const updatedIntegrations = integrations.map(int => 
        int.type === integration.type 
          ? { 
              ...int, 
              status: 'connected' as const,
              webhookUrl: `${baseWebhookUrl}/${integration.type}`,
              apiKey: generateApiKey(),
              lastSync: new Date().toISOString()
            }
          : int
      )
      setIntegrations(updatedIntegrations)
      
      toast({
        title: "Integration Connected",
        description: `${integration.name} is now connected and ready to receive leads.`,
      })
      
      setIsDialogOpen(false)
      setSelectedIntegration(null)
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect integration. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDisconnect = (integration: IntegrationConfig) => {
    const updatedIntegrations = integrations.map(int => 
      int.type === integration.type 
        ? { ...int, status: 'disconnected' as const, webhookUrl: undefined, apiKey: undefined, lastSync: undefined }
        : int
    )
    setIntegrations(updatedIntegrations)
    
    toast({
      title: "Integration Disconnected",
      description: `${integration.name} has been disconnected.`,
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const fetchTeamMembers = async () => {
    if (!organization) return

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      setTeamMembers(data || [])
    } catch (error) {
      console.error('Error fetching team members:', error)
    }
  }

  const handleSaveOrganization = async () => {
    if (!organization || !orgData.name) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: orgData.name,
          type: orgData.type,
          domain: orgData.domain,
          website: orgData.website,
          phone: orgData.phone,
          timezone: orgData.timezone,
          business_hours: orgData.business_hours,
          updated_at: new Date().toISOString()
        })
        .eq('id', organization.id)

      if (error) throw error

      toast({
        title: "Settings Saved",
        description: "Organization settings have been updated successfully.",
      })

      await refreshProfile()
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleInviteUser = async () => {
    if (!organization || !inviteEmail) return

    setIsInviting(true)
    try {
      const { error } = await supabase
        .from('organization_invitations')
        .insert([
          {
            organization_id: organization.id,
            email: inviteEmail,
            role: inviteRole,
            invited_by: user?.id
          }
        ])

      if (error) throw error

      toast({
        title: "Invitation Sent",
        description: `Invitation sent to ${inviteEmail}`,
      })

      setInviteEmail('')
      setInviteRole('user')
    } catch (error: any) {
      toast({
        title: "Invitation Failed",
        description: error.message || "Failed to send invitation.",
        variant: "destructive",
      })
    } finally {
      setIsInviting(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4 text-yellow-500" />
      case 'admin': return <Shield className="h-4 w-4 text-blue-500" />
      case 'manager': return <Users className="h-4 w-4 text-green-500" />
      default: return <User className="h-4 w-4 text-gray-500" />
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner': return 'default'
      case 'admin': return 'secondary'
      case 'manager': return 'outline'
      default: return 'outline'
    }
  }

  if (!organization || !profile) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading...</h2>
        </div>
      </div>
    )
  }

  const canManageOrganization = profile.role === 'owner' || profile.role === 'admin'
  const canInviteUsers = profile.role === 'owner' || profile.role === 'admin'

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Organization Settings</h1>
        <p className="text-muted-foreground">Manage your organization and team settings</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Organization Information</span>
              </CardTitle>
              <CardDescription>
                Basic information about your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Organization Name *</Label>
                  <Input
                    id="org-name"
                    value={orgData.name || ''}
                    onChange={(e) => setOrgData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Metro Health University"
                    disabled={!canManageOrganization}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="org-type">Organization Type</Label>
                  <Select 
                    value={orgData.type || 'university'} 
                    onValueChange={(value) => setOrgData(prev => ({ ...prev, type: value }))}
                    disabled={!canManageOrganization}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="university">University</SelectItem>
                      <SelectItem value="college">College</SelectItem>
                      <SelectItem value="bootcamp">Bootcamp</SelectItem>
                      <SelectItem value="corporate">Corporate Training</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="org-domain">Domain</Label>
                  <Input
                    id="org-domain"
                    value={orgData.domain || ''}
                    onChange={(e) => setOrgData(prev => ({ ...prev, domain: e.target.value }))}
                    placeholder="university.edu"
                    disabled={!canManageOrganization}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="org-website">Website</Label>
                  <Input
                    id="org-website"
                    value={orgData.website || ''}
                    onChange={(e) => setOrgData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://university.edu"
                    disabled={!canManageOrganization}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="org-phone">Phone</Label>
                  <Input
                    id="org-phone"
                    value={orgData.phone || ''}
                    onChange={(e) => setOrgData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1-555-0123"
                    disabled={!canManageOrganization}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="org-timezone">Timezone</Label>
                  <Select 
                    value={orgData.timezone || 'America/New_York'} 
                    onValueChange={(value) => setOrgData(prev => ({ ...prev, timezone: value }))}
                    disabled={!canManageOrganization}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {canManageOrganization && (
                <div className="flex justify-end pt-4">
                  <Button onClick={handleSaveOrganization} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Team Members</span>
              </CardTitle>
              <CardDescription>
                Manage your organization's team members and their roles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {canInviteUsers && (
                <div className="border rounded-lg p-4 space-y-4">
                  <h4 className="font-semibold">Invite New Member</h4>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Email address"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Select value={inviteRole} onValueChange={setInviteRole}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={handleInviteUser} 
                      disabled={!inviteEmail || isInviting}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {isInviting ? 'Inviting...' : 'Invite'}
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(member.role)}
                        <div>
                          <p className="font-medium">
                            {member.first_name} {member.last_name}
                            {member.id === user?.id && <span className="text-sm text-muted-foreground ml-2">(You)</span>}
                          </p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getRoleBadgeVariant(member.role)}>
                        {member.role}
                      </Badge>
                      {member.id !== user?.id && canInviteUsers && (
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Subscription & Billing</span>
              </CardTitle>
              <CardDescription>
                Manage your subscription plan and billing information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscription && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold capitalize">{subscription.plan_name} Plan</h4>
                      <p className="text-sm text-muted-foreground">
                        Status: <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                          {subscription.status}
                        </Badge>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        ${(subscription.price_cents / 100).toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">per {subscription.plan_type}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Team Seats</p>
                      <p className="text-muted-foreground">
                        {subscription.seats_used} / {subscription.seats_included} used
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Monthly Leads</p>
                      <p className="text-muted-foreground">
                        {subscription.monthly_leads_used} / {subscription.monthly_leads_limit} used
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-2">
                <Button variant="outline">Change Plan</Button>
                <Button variant="outline">Billing History</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Lead Ingestion Settings</h2>
            <p className="text-gray-600 mb-6">
              Connect your external systems for real-time lead capture and automated outreach
            </p>
          </div>

          <div className="space-y-6">
            {integrationConfigs.map((integration) => (
              <Card key={integration.type} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <integration.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <CardDescription className="mt-1">{integration.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={integration.status === 'connected' ? "default" : "secondary"} className="flex items-center space-x-1">
                      {integration.status === 'connected' ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      <span>{integration.status === 'connected' ? 'Connected' : 'Not Connected'}</span>
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {integration.status === 'connected' && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-sm space-y-1">
                        <p><strong>Webhook URL:</strong> <code className="text-xs">{integration.webhookUrl}</code></p>
                        <p><strong>Last Sync:</strong> {integration.lastSync && formatDate(integration.lastSync)}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {integration.status === 'connected' ? (
                        <span>✅ Ready to receive leads automatically</span>
                      ) : (
                        <span>Click Connect to set up real-time lead ingestion</span>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      {integration.status === 'connected' ? (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedIntegration(integration)
                              setIsDialogOpen(true)
                            }}
                          >
                            <Settings className="h-4 w-4 mr-1" />
                            Manage
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDisconnect(integration)}
                          >
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button 
                          size="sm"
                          onClick={() => {
                            setSelectedIntegration(integration)
                            setIsDialogOpen(true)
                          }}
                        >
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Webhook Configuration</CardTitle>
              <CardDescription>
                Technical details for setting up webhooks in your external systems.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">
                  POST {baseWebhookUrl}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(baseWebhookUrl, 'Webhook URL')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Expected Payload Format:</h4>
                <pre className="text-xs overflow-x-auto text-black">
{`{
  "first_name": "John",
  "last_name": "Doe", 
  "email": "john.doe@email.com",
  "phone": "+1-555-0123",
  "source": "canvas|hubspot|ghl",
  "campaign_id": "optional-campaign-uuid",
  "metadata": {
    "course_id": "optional",
    "utm_source": "optional"
  }
}`}
                </pre>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Authentication:</strong> Include API key in Authorization header: <code>Bearer YOUR_API_KEY</code></p>
                <p><strong>Content-Type:</strong> <code>application/json</code></p>
                <p><strong>Response Time:</strong> <3 seconds for lead processing and campaign trigger</p>
                <p><strong>Success Response:</strong> <code>{"{"}"status": "received", "lead_id": "uuid"{"}"}</code></p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Integration Setup Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          {selectedIntegration && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <selectedIntegration.icon className="h-5 w-5" />
                  <span>{selectedIntegration.name} Integration</span>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    handleSave(selectedIntegration, formData)
                  }} 
                  className="space-y-4"
                >
                  {selectedIntegration.fields.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label htmlFor={field.key}>
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      {field.type === 'textarea' ? (
                        <Textarea
                          id={field.key}
                          name={field.key}
                          placeholder={field.placeholder}
                          required={field.required}
                        />
                      ) : (
                        <Input
                          id={field.key}
                          name={field.key}
                          type={field.type}
                          placeholder={field.placeholder}
                          required={field.required}
                        />
                      )}
                    </div>
                  ))}

                  <div className="flex space-x-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={(e) => {
                        e.preventDefault()
                        const formData = new FormData(e.currentTarget.form!)
                        handleTestConnection(selectedIntegration, formData)
                      }}
                      disabled={isTesting}
                      className="flex-1"
                    >
                      {isTesting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <TestTube className="h-4 w-4 mr-2" />
                      )}
                      Test Connection
                    </Button>
                    
                    <Button type="submit" disabled={isSaving} className="flex-1">
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      Connect Integration
                    </Button>
                  </div>
                </form>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-sm mb-3">Setup Instructions:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    {selectedIntegration.setupInstructions.map((instruction, index) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Custom icons for integrations
function CanvasIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
      <path d="m7 7 3 3-3 3"/>
      <path d="M17 10h-5"/>
    </svg>
  )
}

function HubSpotIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M8 8h8v8H8z"/>
      <path d="m9 9 6 6"/>
      <path d="m15 9-6 6"/>
    </svg>
  )
}

function GHLIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
      <path d="m2 17 10 5 10-5"/>
      <path d="m2 12 10 5 10-5"/>
    </svg>
  )
}