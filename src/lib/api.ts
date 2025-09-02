import { supabase } from './supabase'
import { Campaign, Lead, Organization } from './validation'
import { Tables } from './database.types'

// Campaign API functions
export const campaignApi = {
  async getAll(organizationId: string) {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(campaign: Partial<Tables<'campaigns'>>) {
    const { data, error } = await supabase
      .from('campaigns')
      .insert([campaign])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Tables<'campaigns'>>) {
    const { data, error } = await supabase
      .from('campaigns')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Lead API functions
export const leadApi = {
  async getAll(organizationId: string) {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async create(lead: Partial<Tables<'leads'>>) {
    const { data, error } = await supabase
      .from('leads')
      .insert([lead])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Tables<'leads'>>) {
    const { data, error } = await supabase
      .from('leads')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Organization API functions
export const organizationApi = {
  async update(id: string, updates: Partial<Tables<'organizations'>>) {
    const { data, error } = await supabase
      .from('organizations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getTeamMembers(organizationId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data
  }
}

// Integration API functions
export const integrationApi = {
  async getAll(organizationId: string) {
    const { data, error } = await supabase
      .from('organization_integrations')
      .select('*')
      .eq('organization_id', organizationId)
    
    if (error) throw error
    return data
  },

  async create(integration: Partial<Tables<'organization_integrations'>>) {
    const { data, error } = await supabase
      .from('organization_integrations')
      .insert([integration])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Tables<'organization_integrations'>>) {
    const { data, error } = await supabase
      .from('organization_integrations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}