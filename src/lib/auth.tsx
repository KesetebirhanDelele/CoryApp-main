'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { Tables } from './database.types'

type UserProfile = Tables<'users'>
type Organization = Tables<'organizations'>
type OrganizationSubscription = Tables<'organization_subscriptions'>

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  organization: Organization | null
  subscription: OrganizationSubscription | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  organization: null,
  subscription: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [subscription, setSubscription] = useState<OrganizationSubscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserProfile(session.user.id)
      } else {
        clearUserData()
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const clearUserData = () => {
    setProfile(null)
    setOrganization(null)
    setSubscription(null)
  }

  const loadUserProfile = async (userId: string) => {
    try {
      // Load user profile - this is the source of truth
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userError) {
        if (userError.code !== 'PGRST116') { // Not found error is expected for new users
          console.error('Error loading user profile:', userError)
        }
        clearUserData()
        setLoading(false)
        return
      }

      setProfile(userProfile)

      // Load organization
      if (userProfile.organization_id) {
        const { data: org } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', userProfile.organization_id)
          .single()

        if (org) {
          setOrganization(org)

          // Load subscription
          const { data: sub } = await supabase
            .from('organization_subscriptions')
            .select('*')
            .eq('organization_id', org.id)
            .single()

          if (sub) setSubscription(sub)
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      clearUserData()
    } finally {
      setLoading(false)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    clearUserData()
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      organization, 
      subscription, 
      loading, 
      signOut, 
      refreshProfile 
    }}>
      {children}
    </AuthContext.Provider>
  )
}