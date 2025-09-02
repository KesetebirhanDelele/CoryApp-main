import { memo, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { ModeToggle } from '@/components/ui/mode-toggle'
import { Bell, LogOut, Settings, User } from 'lucide-react'
import { useAuth } from '@/lib/auth'

export const Header = memo(function Header() {
  const { user, profile, organization, subscription, signOut } = useAuth()

  const initials = useMemo(() => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`
    }
    if (profile?.email) {
      return profile.email.charAt(0).toUpperCase()
    }
    return 'U'
  }, [profile])

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="font-semibold text-lg">Cora AI</h1>
            {organization && (
              <p className="text-xs text-muted-foreground">{organization.name}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {subscription && (
            <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
              {subscription.plan_name}
            </Badge>
          )}
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
              3
            </span>
          </Button>

          <ModeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  {profile?.email && (
                    <p className="font-medium text-sm">{profile.email}</p>
                  )}
                  {profile?.role && (
                  <p className="w-[200px] truncate text-xs text-muted-foreground">
                      {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                  </p>
                  )}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
)