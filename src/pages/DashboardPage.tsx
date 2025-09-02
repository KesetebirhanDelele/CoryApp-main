import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, TrendingUp, Calendar, MessageSquare, Phone, Mail } from 'lucide-react'
import { mockProspects } from '@/lib/mock-data'

export default function DashboardPage() {
  const metrics = useMemo(() => {
    const totalProspects = mockProspects.length
    const newInquiries = mockProspects.filter(p => p.status === 'new_inquiry').length
    const enrolled = mockProspects.filter(p => p.status === 'enrolled').length
    const conversionRate = totalProspects > 0 ? Math.round((enrolled / totalProspects) * 100) : 0
    
    return { totalProspects, newInquiries, enrolled, conversionRate }
  }, [])

  const recentActivity = useMemo(() => [
    { type: 'inquiry', message: 'New inquiry from Sarah Johnson', time: '5 minutes ago' },
    { type: 'call', message: 'AI call completed for Michael Chen', time: '1 hour ago' },
    { type: 'appointment', message: 'Appointment scheduled with Emily Rodriguez', time: '2 hours ago' },
    { type: 'enrollment', message: 'Jessica Williams completed enrollment', time: '3 hours ago' },
  ], [])

  const getActivityIcon = useMemo(() => (type: string) => {
    switch (type) {
      case 'inquiry': return <Users className="h-4 w-4 text-blue-500" />
      case 'call': return <Phone className="h-4 w-4 text-green-500" />
      case 'appointment': return <Calendar className="h-4 w-4 text-orange-500" />
      case 'enrollment': return <TrendingUp className="h-4 w-4 text-purple-500" />
      default: return <MessageSquare className="h-4 w-4 text-gray-500" />
    }
  }, [])

  const pipelineStatus = useMemo(() => [
    { status: 'New Inquiry', count: metrics.newInquiries, color: 'bg-blue-500' },
    { status: 'Contacted', count: mockProspects.filter(p => p.status === 'contacted').length, color: 'bg-yellow-500' },
    { status: 'Appointment Set', count: mockProspects.filter(p => p.status === 'appointment_set').length, color: 'bg-orange-500' },
    { status: 'Applied', count: mockProspects.filter(p => p.status === 'applied').length, color: 'bg-purple-500' },
    { status: 'Enrolled', count: metrics.enrolled, color: 'bg-green-500' },
  ], [metrics])

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome to your admissions overview</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prospects</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalProspects}</div>
            <p className="text-xs text-gray-500">
              Active in pipeline
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Inquiries</CardTitle>
            <Mail className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.newInquiries}</div>
            <p className="text-xs text-gray-500">
              Awaiting contact
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrollment Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.conversionRate}%</div>
            <p className="text-xs text-gray-500">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <MessageSquare className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-gray-500">
              Running workflows
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription className="text-gray-600">Latest updates from your admissions pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline Status</CardTitle>
            <CardDescription className="text-gray-600">Current prospect distribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pipelineStatus.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm">{item.status}</span>
                </div>
                <Badge variant="secondary">{item.count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}