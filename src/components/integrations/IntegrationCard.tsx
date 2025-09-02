'use client'

import { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Highlighter as HigherGear, CheckCircle, XCircle, Settings, TestTube, Loader2 } from 'lucide-react'
import { Tables } from '@/lib/supabase'

type IntegrationConnection = Tables<'integration_connections'>

interface IntegrationInfo {
  type: IntegrationConnection['integration_type']
  name: string
  description: string
  icon: React.ElementType
  fields: Array<{
    key: string
    label: string
    type: 'text' | 'password' | 'url' | 'textarea'
    placeholder: string
    required: boolean
  }>
}

const integrationConfigs: Record<string, IntegrationInfo> = {
  canvas: {
    type: 'canvas',
    name: 'Canvas LMS',
    description: 'Auto-sync new students and course data from Canvas LMS',
    icon: CustomCanvasIcon,
    fields: [
      { key: 'url', label: 'Canvas URL', type: 'url', placeholder: 'https://yourschool.instructure.com', required: true },
      { key: 'token', label: 'API Token', type: 'password', placeholder: 'Your Canvas API token', required: true }
    ]
  },
  hubspot: {
    type: 'hubspot',
    name: 'HubSpot CRM',
    description: 'Sync contacts, deals, and activities from HubSpot',
    icon: CustomHubSpotIcon,
    fields: [
      { key: 'token', label: 'Private App Token', type: 'password', placeholder: 'Your HubSpot Private App token', required: true }
    ]
  },
  hgl: {
    type: 'hgl',
    name: 'Higher Gear',
    description: 'Integrate with Higher Gear for lead management',
    icon: CustomHigherGearIcon,
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'Your Higher Gear API key', required: true },
      { key: 'location_id', label: 'Location ID', type: 'text', placeholder: 'Your location ID', required: true }
    ]
  },
  webhook: {
    type: 'webhook',
    name: 'Custom Webhook',
    description: 'Receive leads via custom webhook endpoints',
    icon: CustomWebhookIcon,
    fields: [
      { key: 'endpoint_name', label: 'Endpoint Name', type: 'text', placeholder: 'e.g., "Website Form"', required: true },
      { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe what this webhook is for...', required: false }
    ]
  }
}

interface IntegrationCardProps {
  connection?: IntegrationConnection
  integrationType: IntegrationConnection['integration_type']
  onUpdate?: () => void
}

export function IntegrationCard({ connection, integrationType, onUpdate }: IntegrationCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const config = useMemo(() => integrationConfigs[integrationType], [integrationType])
  const Icon = config.icon

  const { isConnected, lastSync } = useMemo(() => ({
    isConnected: connection?.status === 'connected',
    lastSync: connection?.connected_at 
      ? new Date(connection.connected_at).toLocaleDateString()
      : null
  }), [connection])

  const handleTestConnection = useCallback(async (formData: FormData) => {
    setIsTesting(true)
    try {
      // Simulate API test call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: "Connection Test Successful",
        description: `Successfully connected to ${config.name}`,
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
  }, [config.name, toast])

  const handleSave = useCallback(async (formData: FormData) => {
    setIsSaving(true)
    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast({
        title: "Integration Updated",
        description: `${config.name} integration has been updated successfully.`,
      })
      
      setIsDialogOpen(false)
      onUpdate?.()
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to update integration. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }, [config.name, onUpdate, toast])

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{config.name}</CardTitle>
              <CardDescription className="mt-1">{config.description}</CardDescription>
            </div>
          </div>
          <Badge variant={isConnected ? "default" : "secondary"} className="flex items-center space-x-1">
            {isConnected ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <XCircle className="h-3 w-3" />
            )}
            <span>{isConnected ? 'Connected' : 'Not Connected'}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {isConnected && lastSync && (
              <span>Last sync: {lastSync}</span>
            )}
            {!isConnected && (
              <span>Click Connect to set up this integration</span>
            )}
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant={isConnected ? "outline" : "default"} size="sm">
                {isConnected ? (
                  <>
                    <Settings className="h-4 w-4 mr-1" />
                    Manage
                  </>
                ) : (
                  'Connect'
                )}
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Icon className="h-5 w-5" />
                  <span>{config.name} Integration</span>
                </DialogTitle>
              </DialogHeader>

              <form action={handleSave} className="space-y-4">
                {config.fields.map((field) => (
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
                      handleTestConnection(formData)
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
                    Save Integration
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}

// Custom icons for integrations
function CustomCanvasIcon({ className }: { className?: string }) {
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

function CustomHubSpotIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M8 8h8v8H8z"/>
      <path d="m9 9 6 6"/>
      <path d="m15 9-6 6"/>
    </svg>
  )
}

function CustomHigherGearIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v6m0 6v6"/>
      <path d="m21 12-6-6-6 6-6-6"/>
      <path d="M8.5 8.5 12 12l3.5-3.5L19 12l-3.5 3.5L12 12l-3.5 3.5L5 12z"/>
    </svg>
  )
}

function CustomWebhookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2"/>
      <path d="m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06"/>
      <path d="m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8"/>
    </svg>
  )
}