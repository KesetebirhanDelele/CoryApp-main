import { useState, useMemo, useCallback, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/lib/auth'
import { campaignApi } from '@/lib/api'
import { loadTestCampaignData } from '@/lib/test-data'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { campaignSchema, type Campaign as ValidatedCampaign } from '@/lib/validation'
import { 
  Plus, 
  Save, 
  Play, 
  ArrowLeft,
  MessageSquare, 
  Mail, 
  Phone, 
  Clock,
  Eye,
  Sparkles,
  ChevronRight,
  Settings
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
    max_attempts?: number
    retry_delay?: number
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

// Safe template rendering helper
function renderTemplate(str: string, data: Record<string, string> = {}): string {
  if (!str) return ''
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] ?? `{{${key}}}`)
}

export default function CampaignBuilderPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { toast } = useToast()
  const { user, loading: authLoading, profile, organization } = useAuth()
  
  // Safe parameter extraction
  const editCampaignId = searchParams.get('edit') ?? null
  
  // Top-level loading and error states
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Campaign state with safe defaults
  const [campaign, setCampaign] = useState<Campaign>({
    id: '',
    name: '',
    description: '',
    type: 'custom',
    is_active: false,
    steps: [],
    triggers: ['inquiry_received'],
    settings: {
      start_delay: 0,
      business_hours_only: true,
      timezone: 'America/New_York',
      max_attempts: 3,
      retry_delay: 24
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })

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

  // Sample data for template rendering
  const sampleData = {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@email.com',
    phone: '+1-555-0123',
    program_name: 'Nursing Program'
  }

  // Load campaign data on mount
  useEffect(() => {
    let cancelled = false
    
    const loadCampaignData = async () => {
      try {
        setPageLoading(true)
        setError(null)
        
        console.log("DBG loading campaign, editCampaignId:", editCampaignId)
        
        if (editCampaignId) {
          // Simulate loading existing campaign
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          if (!cancelled) {
            // Load test data for demo
            const testData = loadTestCampaignData()
            const loadedCampaign: Campaign = {
              id: editCampaignId,
              name: testData.questions.name,
              description: `${testData.questions.goal} - ${testData.questions.target_audience}`,
              type: 'custom',
              is_active: false,
              steps: testData.prompts.map((prompt, index) => ({
                id: prompt.id,
                type: prompt.type,
                name: prompt.name,
                content: prompt.content,
                subject: prompt.type === 'email' ? (prompt as any).subject : undefined,
                delay: prompt.delay,
                delay_unit: prompt.delay_unit
              })),
              triggers: ['inquiry_received'],
              settings: testData.settings.settings,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
            
            console.log("DBG loaded campaign:", loadedCampaign)
            setCampaign(loadedCampaign)
            setCampaignQuestions(testData.questions)
            setCurrentStep(2) // Go to step editor
          }
        } else {
          // New campaign - use defaults
          console.log("DBG new campaign, using defaults")
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("Failed to load campaign:", err)
          setError(err?.message ?? 'Failed to load campaign')
        }
      } finally {
        if (!cancelled) {
          setPageLoading(false)
        }
      }
    }

    loadCampaignData()
    
    return () => {
      cancelled = true
    }
  }, [editCampaignId])

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
    if (!campaignQuestions.name || !campaignQuestions.goal) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least the campaign name and goal.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      // Simulate AI prompt generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const generated: CampaignStep[] = [
        {
          id: 'gen-sms-1',
          type: 'sms',
          name: 'Initial Contact SMS',
          content: `Hi {{first_name}}! I'm Sarah from ${campaignQuestions.program_details || 'our program'}. I saw your interest in our program. ${campaignQuestions.key_benefits || 'We have great benefits'}. Can we chat for 10 minutes about your goals?`,
          delay: 5,
          delay_unit: 'minutes'
        },
        {
          id: 'gen-email-1',
          type: 'email',
          name: 'Follow-up Email',
          subject: `Your ${campaignQuestions.program_details || 'Program'} Journey Starts Here, {{first_name}}`,
          content: `Hi {{first_name}},\n\nI hope this email finds you well. I wanted to personally reach out regarding your interest in ${campaignQuestions.program_details || 'our program'}.\n\n${campaignQuestions.key_benefits || 'Our program offers many benefits'}\n\nI understand you might have concerns about ${campaignQuestions.objections || 'various aspects'}, and I'd love to address those directly.\n\n${campaignQuestions.desired_action || 'Please let us know if you\'d like to learn more'}\n\nBest regards,\nSarah Johnson\nAdmissions Team`,
          delay: 2,
          delay_unit: 'hours'
        },
        {
          id: 'gen-voice-1',
          type: 'voice',
          name: 'AI Follow-up Call',
          content: `Hi {{first_name}}, this is Sarah from the admissions team at ${campaignQuestions.program_details || 'our institution'}. I wanted to personally follow up on your inquiry. ${campaignQuestions.key_benefits || 'We have excellent programs'}. I have just a few minutes to discuss how this program can help you achieve ${campaignQuestions.goal || 'your goals'}. Are you available for a quick chat?`,
          delay: 1,
          delay_unit: 'days'
        }
      ]
      
      console.log("DBG generated steps:", generated)
      setCampaign(prev => ({ ...prev, steps: generated }))
      setCurrentStep(2)
      
      toast({
        title: "Prompts Generated!",
        description: "AI has created personalized campaign content based on your inputs.",
      })
    } catch (error) {
      console.error("Generate prompts error:", error)
      toast({
        title: "Generation Failed",
        description: "Failed to generate prompts. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }, [campaignQuestions, toast])

  const updateStep = useCallback((stepId: string, field: string, value: string) => {
    console.log("DBG updating step:", stepId, field, value)
    setCampaign(prev => ({
      ...prev,
      steps: (prev.steps ?? []).map(step => 
        step.id === stepId ? { ...step, [field]: value } : step
      )
    }))
  }, [])

  const addStep = useCallback(() => {
    const newStep: CampaignStep = {
      id: `step-${Date.now()}`,
      type: 'sms',
      name: 'New Step',
      content: 'Hi {{first_name}}, this is a new message...',
      delay: 1,
      delay_unit: 'hours'
    }
    
    console.log("DBG adding step:", newStep)
    setCampaign(prev => ({
      ...prev,
      steps: [...(prev.steps ?? []), newStep]
    }))
  }, [])

  const removeStep = useCallback((stepId: string) => {
    console.log("DBG removing step:", stepId)
    setCampaign(prev => ({
      ...prev,
      steps: (prev.steps ?? []).filter(step => step.id !== stepId)
    }))
  }, [])

  const saveCampaign = useCallback(async () => {
    if (!campaignQuestions.name) {
      toast({
        title: "Missing Campaign Name",
        description: "Please enter a campaign name before saving.",
        variant: "destructive",
      })
      return
    }

    if (!organization) {
      toast({
        title: "No Organization",
        description: "You must be part of an organization to create campaigns.",
        variant: "destructive",
      })
      return
    }

    // Validate campaign data
    try {
      campaignSchema.parse({
        name: campaignQuestions.name,
        description: campaign.description,
        steps: campaign.steps,
        settings: campaign.settings
      })
    } catch (validationError: any) {
      toast({
        title: "Validation Error",
        description: validationError.errors?.[0]?.message || "Please check your campaign data.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      await campaignApi.create({
        name: campaignQuestions.name,
        description: campaign.description,
        organization_id: organization.id,
        created_by: user?.id,
        is_active: false,
        steps: campaign.steps,
        prompts: {},
        settings: campaign.settings
      })
      
      toast({
        title: "Campaign Saved!",
        description: "Your campaign has been saved successfully.",
      })
      
      // Navigate back to campaigns list
      navigate('/campaigns')
    } catch (error) {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save campaign. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }, [campaignQuestions.name, organization, user?.id, campaign, toast, navigate])

  // Early returns for loading and error states
  if (pageLoading || authLoading) {
    return (
      <div className="p-6 bg-white min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Error Loading Campaign</h2>
          <p className="mt-2 text-sm text-gray-600">{error}</p>
          <Button 
            onClick={() => navigate('/campaigns')} 
            className="mt-4"
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Please Sign In</h2>
          <p className="mt-2 text-sm text-gray-600">You need to be signed in to create campaigns.</p>
        </div>
      </div>
    )
  }

  console.log("DBG campaign at render:", campaign)

  return (
    <div className="p-6 bg-white min-h-screen">
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
              <h1 className="text-2xl font-bold text-black">
                {editCampaignId ? 'Edit Campaign' : 'Create New Campaign'}
              </h1>
              <p className="text-gray-600">Build multi-channel outreach campaigns with AI assistance</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              onClick={saveCampaign}
              disabled={isSaving}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
            </Button>
            <Button 
              onClick={saveCampaign}
              disabled={isSaving}
              className="flex items-center space-x-2"
            >
              <Play className="h-4 w-4" />
              <span>Save & Activate</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
            currentStep === 1 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
          }`}>
            <span className="w-6 h-6 rounded-full bg-current text-white text-xs flex items-center justify-center">1</span>
            <span>Campaign Setup</span>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
            currentStep === 2 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
          }`}>
            <span className="w-6 h-6 rounded-full bg-current text-white text-xs flex items-center justify-center">2</span>
            <span>Message Builder</span>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
            currentStep === 3 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
          }`}>
            <span className="w-6 h-6 rounded-full bg-current text-white text-xs flex items-center justify-center">3</span>
            <span>Settings & Launch</span>
          </div>
        </div>
      </div>

      <Tabs value={currentStep.toString()} onValueChange={(value) => setCurrentStep(parseInt(value))}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="1">Campaign Setup</TabsTrigger>
          <TabsTrigger value="2">Message Builder</TabsTrigger>
          <TabsTrigger value="3">Settings & Launch</TabsTrigger>
        </TabsList>

        {/* Step 1: Campaign Setup */}
        <TabsContent value="1" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                <span>AI Campaign Generator</span>
              </CardTitle>
              <CardDescription>
                Answer a few questions and let AI create personalized campaign messages for you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="campaign-name">Campaign Name *</Label>
                  <Input
                    id="campaign-name"
                    value={campaignQuestions.name}
                    onChange={(e) => setCampaignQuestions(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Nursing Program Enrollment"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="program-details">Program/Service Details *</Label>
                  <Input
                    id="program-details"
                    value={campaignQuestions.program_details}
                    onChange={(e) => setCampaignQuestions(prev => ({ ...prev, program_details: e.target.value }))}
                    placeholder="e.g., Accelerated BSN Program at Metro Health University"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal">Campaign Goal *</Label>
                <Textarea
                  id="goal"
                  value={campaignQuestions.goal}
                  onChange={(e) => setCampaignQuestions(prev => ({ ...prev, goal: e.target.value }))}
                  placeholder="What do you want to achieve? e.g., Enroll qualified candidates in our accelerated nursing program"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-audience">Target Audience</Label>
                <Input
                  id="target-audience"
                  value={campaignQuestions.target_audience}
                  onChange={(e) => setCampaignQuestions(prev => ({ ...prev, target_audience: e.target.value }))}
                  placeholder="e.g., Healthcare professionals looking to advance their careers"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="key-benefits">Key Benefits & Value Proposition</Label>
                <Textarea
                  id="key-benefits"
                  value={campaignQuestions.key_benefits}
                  onChange={(e) => setCampaignQuestions(prev => ({ ...prev, key_benefits: e.target.value }))}
                  placeholder="e.g., Complete your BSN in 12 months, flexible evening classes, 95% NCLEX pass rate"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="objections">Common Objections</Label>
                  <Input
                    id="objections"
                    value={campaignQuestions.objections}
                    onChange={(e) => setCampaignQuestions(prev => ({ ...prev, objections: e.target.value }))}
                    placeholder="e.g., Time commitment, cost concerns"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tone">Communication Tone</Label>
                  <Select 
                    value={campaignQuestions.tone} 
                    onValueChange={(value: any) => setCampaignQuestions(prev => ({ ...prev, tone: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="desired-action">Desired Action/Call-to-Action</Label>
                <Input
                  id="desired-action"
                  value={campaignQuestions.desired_action}
                  onChange={(e) => setCampaignQuestions(prev => ({ ...prev, desired_action: e.target.value }))}
                  placeholder="e.g., Schedule a 15-minute information session with our admissions counselor"
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={generatePrompts}
                  disabled={isGenerating || !campaignQuestions.name || !campaignQuestions.goal}
                  className="flex items-center space-x-2"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{isGenerating ? 'Generating...' : 'Generate Campaign Messages'}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 2: Message Builder */}
        <TabsContent value="2" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-black">Campaign Messages</h2>
            <Button onClick={addStep} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Step</span>
            </Button>
          </div>

          <div className="space-y-4">
            {(campaign.steps ?? []).map((step, index) => (
              <Card key={step.id} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded border ${getStepColor(step.type)}`}>
                        {getStepIcon(step.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">Step {index + 1}: {step.name}</CardTitle>
                        <CardDescription>
                          {step.type.toUpperCase()} • Delay: {step.delay} {step.delay_unit}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => removeStep(step.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Message Type</Label>
                      <Select 
                        value={step.type} 
                        onValueChange={(value: any) => updateStep(step.id, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sms">SMS Text</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="voice">AI Voice Call</SelectItem>
                          <SelectItem value="wait">Wait/Delay</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Delay</Label>
                      <Input
                        type="number"
                        value={step.delay}
                        onChange={(e) => updateStep(step.id, 'delay', e.target.value)}
                        min="0"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Delay Unit</Label>
                      <Select 
                        value={step.delay_unit} 
                        onValueChange={(value: any) => updateStep(step.id, 'delay_unit', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minutes">Minutes</SelectItem>
                          <SelectItem value="hours">Hours</SelectItem>
                          <SelectItem value="days">Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Step Name</Label>
                    <Input
                      value={step.name}
                      onChange={(e) => updateStep(step.id, 'name', e.target.value)}
                      placeholder="e.g., Welcome SMS"
                    />
                  </div>

                  {step.type === 'email' && (
                    <div className="space-y-2">
                      <Label>Email Subject</Label>
                      <Input
                        value={step.subject ?? ''}
                        onChange={(e) => updateStep(step.id, 'subject', e.target.value)}
                        placeholder="e.g., Welcome to {{program_name}}, {{first_name}}!"
                      />
                      {step.subject && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          <strong>Preview:</strong> {renderTemplate(step.subject, sampleData)}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Message Content</Label>
                    <Textarea
                      value={step.content}
                      onChange={(e) => updateStep(step.id, 'content', e.target.value)}
                      placeholder="Hi {{first_name}}, thanks for your interest in {{program_name}}..."
                      rows={4}
                    />
                    {step.content && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <strong>Preview:</strong> {renderTemplate(step.content, sampleData)}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {(campaign.steps ?? []).length === 0 && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Messages Yet</h3>
                  <p className="text-gray-500 text-center mb-4">
                    Add your first campaign message or go back to generate AI messages
                  </p>
                  <div className="flex space-x-2">
                    <Button onClick={() => setCurrentStep(1)} variant="outline">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Setup
                    </Button>
                    <Button onClick={addStep}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Step 3: Settings & Launch */}
        <TabsContent value="3" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Campaign Settings</span>
              </CardTitle>
              <CardDescription>Configure timing, triggers, and launch options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="campaign-description">Description</Label>
                <Textarea
                  id="campaign-description"
                  value={campaign.description}
                  onChange={(e) => setCampaign(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this campaign"
                  rows={2}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Timing & Triggers</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Delay (minutes)</Label>
                    <Input
                      type="number"
                      value={campaign.settings.start_delay ?? 0}
                      onChange={(e) => setCampaign(prev => ({
                        ...prev,
                        settings: { ...prev.settings, start_delay: parseInt(e.target.value) || 0 }
                      }))}
                      min="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select 
                      value={campaign.settings.timezone ?? 'America/New_York'} 
                      onValueChange={(value) => setCampaign(prev => ({
                        ...prev,
                        settings: { ...prev.settings, timezone: value }
                      }))}
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

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={campaign.settings.business_hours_only ?? true}
                    onCheckedChange={(checked) => setCampaign(prev => ({
                      ...prev,
                      settings: { ...prev.settings, business_hours_only: checked }
                    }))}
                  />
                  <Label>Only send during business hours (9 AM - 6 PM)</Label>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center pt-4">
                <Button variant="outline" onClick={() => navigate('/campaigns')}>
                  Cancel
                </Button>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={saveCampaign}
                    disabled={isSaving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button 
                    onClick={saveCampaign}
                    disabled={isSaving}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Save & Activate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}