// Application constants
export const APP_NAME = 'Cora AI'
export const APP_DESCRIPTION = 'Intelligent Admissions Assistant'

// API endpoints
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// Pagination
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

// Campaign settings
export const DEFAULT_CAMPAIGN_SETTINGS = {
  start_delay: 0,
  business_hours_only: true,
  timezone: 'America/New_York',
  max_attempts: 3,
  retry_delay: 24
}

// Lead statuses
export const LEAD_STATUSES = {
  NEW: 'new',
  ACTIVE: 'active', 
  IN_PROGRESS: 'in_progress',
  INTERESTED: 'interested',
  NOT_INTERESTED: 'not_interested',
  CALLBACK_REQUESTED: 'callback_requested',
  DEMO_SCHEDULED: 'demo_scheduled',
  QUALIFIED: 'qualified',
  UNRESPONSIVE: 'unresponsive',
  OPTED_OUT: 'opted_out',
  ENROLLED: 'enrolled',
  LOST: 'lost',
  INVALID: 'invalid',
  ARCHIVED: 'archived'
} as const

// Interaction channels
export const INTERACTION_CHANNELS = {
  VOICE: 'voice',
  SMS: 'sms',
  EMAIL: 'email',
  WEB: 'web',
  MANUAL: 'manual'
} as const

// Campaign step types
export const CAMPAIGN_STEP_TYPES = {
  SMS: 'sms',
  EMAIL: 'email',
  VOICE: 'voice',
  WAIT: 'wait'
} as const