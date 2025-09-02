'use client'

import { useState, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { mockProspects } from '@/lib/mock-data'
import { Phone, Mail, Calendar, ExternalLink, MessageSquare, User } from 'lucide-react'
import { Tables } from '@/lib/supabase'

type Prospect = Tables<'prospects'>

const statusConfig = {
  new_inquiry: { label: 'New Inquiry', color: 'bg-blue-500', count: 0 },
  contacted: { label: 'Contacted', color: 'bg-yellow-500', count: 0 },
  appointment_set: { label: 'Appointment Set', color: 'bg-orange-500', count: 0 },
  applied: { label: 'Applied', color: 'bg-purple-500', count: 0 },
  enrolled: { label: 'Enrolled', color: 'bg-green-500', count: 0 },
  ghosted: { label: 'Ghosted', color: 'bg-gray-500', count: 0 },
}

export function AdmissionsWorkflow() {
  const [selectedProspect, setSelectedProspect] = useState<typeof mockProspects[0] | null>(null)
  const prospects = mockProspects

  // Group prospects by status
  const prospectsByStatus = useMemo(() => prospects.reduce((acc, prospect) => {
    if (!acc[prospect.status]) {
      acc[prospect.status] = []
    }
    acc[prospect.status].push(prospect)
    return acc
  }, {} as Record<string, typeof prospects>), [prospects])

  // Update counts with useMemo
  const statusConfigWithCounts = useMemo(() => {
    const config = { ...statusConfig }
    Object.keys(config).forEach(status => {
      config[status as keyof typeof config].count = 
        prospectsByStatus[status]?.length || 0
    })
    return config
  }, [prospectsByStatus])

  const getProspectInitials = useCallback((prospect: typeof mockProspects[0]) => {
    return `${prospect.first_name.charAt(0)}${prospect.last_name.charAt(0)}`
  }, [])

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }, [])

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Admissions Pipeline</h1>
        <p className="text-muted-foreground">Manage your prospect pipeline with drag-and-drop simplicity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Object.entries(statusConfigWithCounts).map(([status, config]) => (
          <div key={status} className="bg-gray-50 rounded-lg p-4 border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-black">{config.label}</h3>
              <Badge variant="secondary" className="text-xs">
                {config.count}
              </Badge>
            </div>
            
            <div className="space-y-3">
              {prospectsByStatus[status]?.map((prospect) => (
                <Card 
                  key={prospect.id}
                  className="cursor-pointer hover:shadow-sm transition-shadow"
                  onClick={() => setSelectedProspect(prospect)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getProspectInitials(prospect)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {prospect.first_name} {prospect.last_name}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {prospect.email}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline" className="text-xs">
                            {prospect.source}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDate(prospect.updated_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {!prospectsByStatus[status]?.length && (
                <div className="text-center text-gray-500 text-sm py-8">
                  No prospects in this stage
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Prospect Detail Modal */}
      <Dialog open={!!selectedProspect} onOpenChange={() => setSelectedProspect(null)}>
        <DialogContent className="max-w-2xl">
          {selectedProspect && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {getProspectInitials(selectedProspect)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {selectedProspect.first_name} {selectedProspect.last_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedProspect.email}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Contact Information */}
                <div>
                  <h4 className="font-semibold mb-3">Contact Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedProspect.email}</span>
                    </div>
                    {selectedProspect.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{selectedProspect.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Source: {selectedProspect.source}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {statusConfigWithCounts[selectedProspect.status].label}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Campaign Information */}
                {selectedProspect.campaign_id && (
                  <>
                    <div>
                      <h4 className="font-semibold mb-3">Campaign Information</h4>
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-sm">
                          <span className="font-medium">Current Stage:</span> {selectedProspect.current_campaign_stage}
                        </p>
                        {selectedProspect.last_campaign_interaction_at && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Last interaction: {formatDate(selectedProspect.last_campaign_interaction_at)}
                          </p>
                        )}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Activity Timeline */}
                <div>
                  <h4 className="font-semibold mb-3">Recent Activity</h4>
                  <ScrollArea className="h-48">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium">Initial inquiry received</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(selectedProspect.created_at)} • System
                          </p>
                        </div>
                      </div>
                      {selectedProspect.status !== 'new_inquiry' && (
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-medium">First contact made</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(selectedProspect.updated_at)} • Auto Campaign
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="flex items-center space-x-1">
                    <Phone className="h-4 w-4" />
                    <span>AI Call</span>
                  </Button>
                  <Button size="sm" variant="outline" className="flex items-center space-x-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>Send SMS</span>
                  </Button>
                  <Button size="sm" variant="outline" className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Book Appointment</span>
                  </Button>
                  <Button size="sm" variant="outline" className="flex items-center space-x-1">
                    <ExternalLink className="h-4 w-4" />
                    <span>Canvas Enrollment</span>
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}