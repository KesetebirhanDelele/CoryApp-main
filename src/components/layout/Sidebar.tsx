'use client'

import { useState, memo } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Megaphone,
  GraduationCap,
  BookOpen,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Building
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Admissions', href: '/admissions', icon: Users },
  { name: 'Campaigns', href: '/campaigns', icon: Megaphone },
  { name: 'Settings', href: '/organization', icon: Settings },
]

const comingSoon = [
  { name: 'Onboarding', href: '/onboarding', icon: UserCheck, disabled: true },
  { name: 'Student Success', href: '/student-success', icon: GraduationCap, disabled: true },
  { name: 'Grading', href: '/grading', icon: BookOpen, disabled: true },
]

interface SidebarProps {
  className?: string
}

const Sidebar = memo(function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const pathname = location.pathname

  return (
    <div className={cn(
      'flex flex-col border-r bg-background transition-all duration-300',
      collapsed ? 'w-16' : 'w-64',
      className
    )}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className={cn(
            'flex items-center space-x-3 transition-opacity duration-300',
            collapsed && 'opacity-0'
          )}>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <div>
              <h1 className="font-bold text-lg">Cora AI</h1>
              <p className="text-xs text-muted-foreground">Admissions Assistant</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                  isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                )}
              >
                <item.icon className={cn(
                  'h-4 w-4 shrink-0',
                  collapsed ? 'mr-0' : 'mr-3'
                )} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </div>

        {!collapsed && (
          <div className="mt-8">
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Coming Soon
            </h3>
            <div className="mt-2 space-y-1">
              {comingSoon.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground/50 cursor-not-allowed"
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  )
})

export { Sidebar }