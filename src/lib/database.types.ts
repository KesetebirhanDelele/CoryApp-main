export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          type: string
          domain: string | null
          logo_url: string | null
          website: string | null
          phone: string | null
          address: any
          timezone: string
          business_hours: any
          branding: any
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          type?: string
          domain?: string | null
          logo_url?: string | null
          website?: string | null
          phone?: string | null
          address?: any
          timezone?: string
          business_hours?: any
          branding?: any
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          type?: string
          domain?: string | null
          logo_url?: string | null
          website?: string | null
          phone?: string | null
          address?: any
          timezone?: string
          business_hours?: any
          branding?: any
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          organization_id: string
          role: 'owner' | 'admin' | 'manager' | 'user'
          permissions: any
          is_active: boolean
          last_login_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          organization_id: string
          role?: 'owner' | 'admin' | 'manager' | 'user'
          permissions?: any
          is_active?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          organization_id?: string
          role?: 'owner' | 'admin' | 'manager' | 'user'
          permissions?: any
          is_active?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      organization_settings: {
        Row: {
          id: string
          organization_id: string
          setting_key: string
          setting_value: any
          setting_type: 'general' | 'branding' | 'notifications' | 'integrations' | 'billing'
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          setting_key: string
          setting_value: any
          setting_type?: 'general' | 'branding' | 'notifications' | 'integrations' | 'billing'
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          setting_key?: string
          setting_value?: any
          setting_type?: 'general' | 'branding' | 'notifications' | 'integrations' | 'billing'
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      organization_subscriptions: {
        Row: {
          id: string
          organization_id: string
          plan_name: string
          plan_type: 'monthly' | 'annual' | 'lifetime'
          status: 'active' | 'cancelled' | 'expired' | 'trial'
          seats_included: number
          seats_used: number
          monthly_leads_limit: number
          monthly_leads_used: number
          features: any
          price_cents: number
          currency: string
          billing_cycle_start: string | null
          billing_cycle_end: string | null
          trial_ends_at: string | null
          cancelled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          plan_name?: string
          plan_type?: 'monthly' | 'annual' | 'lifetime'
          status?: 'active' | 'cancelled' | 'expired' | 'trial'
          seats_included?: number
          seats_used?: number
          monthly_leads_limit?: number
          monthly_leads_used?: number
          features?: any
          price_cents?: number
          currency?: string
          billing_cycle_start?: string | null
          billing_cycle_end?: string | null
          trial_ends_at?: string | null
          cancelled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          plan_name?: string
          plan_type?: 'monthly' | 'annual' | 'lifetime'
          status?: 'active' | 'cancelled' | 'expired' | 'trial'
          seats_included?: number
          seats_used?: number
          monthly_leads_limit?: number
          monthly_leads_used?: number
          features?: any
          price_cents?: number
          currency?: string
          billing_cycle_start?: string | null
          billing_cycle_end?: string | null
          trial_ends_at?: string | null
          cancelled_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      organization_integrations: {
        Row: {
          id: string
          organization_id: string
          integration_type: 'canvas' | 'hubspot' | 'salesforce' | 'mailchimp' | 'zapier' | 'webhook' | 'ghl'
          integration_name: string
          config: any
          credentials: any
          is_active: boolean
          last_sync_at: string | null
          sync_status: 'pending' | 'syncing' | 'success' | 'error'
          error_message: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          integration_type: 'canvas' | 'hubspot' | 'salesforce' | 'mailchimp' | 'zapier' | 'webhook' | 'ghl'
          integration_name: string
          config?: any
          credentials?: any
          is_active?: boolean
          last_sync_at?: string | null
          sync_status?: 'pending' | 'syncing' | 'success' | 'error'
          error_message?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          integration_type?: 'canvas' | 'hubspot' | 'salesforce' | 'mailchimp' | 'zapier' | 'webhook' | 'ghl'
          integration_name?: string
          config?: any
          credentials?: any
          is_active?: boolean
          last_sync_at?: string | null
          sync_status?: 'pending' | 'syncing' | 'success' | 'error'
          error_message?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      organization_invitations: {
        Row: {
          id: string
          organization_id: string
          email: string
          role: 'admin' | 'manager' | 'user'
          invited_by: string | null
          token: string
          expires_at: string
          accepted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          email: string
          role?: 'admin' | 'manager' | 'user'
          invited_by?: string | null
          token?: string
          expires_at?: string
          accepted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          email?: string
          role?: 'admin' | 'manager' | 'user'
          invited_by?: string | null
          token?: string
          expires_at?: string
          accepted_at?: string | null
          created_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          name: string
          description: string | null
          is_active: boolean
          steps: any
          prompts: any
          settings: any | null
          created_by: string | null
          organization_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          is_active?: boolean
          steps?: any
          prompts?: any
          settings?: any | null
          created_by?: string | null
          organization_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          is_active?: boolean
          steps?: any
          prompts?: any
          settings?: any | null
          created_by?: string | null
          organization_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      leads: {
        Row: {
          id: string
          name: string | null
          email: string | null
          phone: string | null
          source: string | null
          campaign_id: string | null
          organization_id: string | null
          current_step: number | null
          status: any | null
          last_contacted_at: string | null
          next_contact_at: string | null
          opt_out_channels: string[] | null
          metadata: any | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name?: string | null
          email?: string | null
          phone?: string | null
          source?: string | null
          campaign_id?: string | null
          organization_id?: string | null
          current_step?: number | null
          status?: any | null
          last_contacted_at?: string | null
          next_contact_at?: string | null
          opt_out_channels?: string[] | null
          metadata?: any | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          phone?: string | null
          source?: string | null
          campaign_id?: string | null
          organization_id?: string | null
          current_step?: number | null
          status?: any | null
          last_contacted_at?: string | null
          next_contact_at?: string | null
          opt_out_channels?: string[] | null
          metadata?: any | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Enums: {
      lead_status_enum: 'new' | 'active' | 'in_progress' | 'interested' | 'not_interested' | 'callback_requested' | 'demo_scheduled' | 'qualified' | 'unresponsive' | 'opted_out' | 'enrolled' | 'lost' | 'invalid' | 'archived'
      interaction_channel_enum: 'voice' | 'sms' | 'email' | 'web' | 'manual'
      interaction_direction_enum: 'inbound' | 'outbound'
      interaction_status_enum: 'pending' | 'sent' | 'delivered' | 'failed' | 'completed'
      outcome_enum: 'no_response' | 'converted' | 'callback_requested' | 'interested' | 'not_interested' | 'opt_out' | 'already_signed_up' | 'needs_info' | 'scheduled_demo' | 'qualified'
      classification_label_enum: 'opt_out' | 'interested' | 'not_interested' | 'already_signed_up' | 'needs_more_info' | 'price_objection' | 'timing_objection' | 'ready_to_enroll' | 'callback_requested' | 'demo_requested' | 'qualified' | 'unresponsive'
      next_action_enum: 'step_2' | 'step_3' | 'step_4' | 'escalate' | 'close' | 'opt_out' | 'schedule_demo' | 'send_info' | 'callback' | 'nurture' | 'qualify'
    }
  }
}