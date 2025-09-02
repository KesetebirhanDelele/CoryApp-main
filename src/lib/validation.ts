import { z } from 'zod'

// Campaign validation schemas
export const campaignStepSchema = z.object({
  id: z.string(),
  type: z.enum(['sms', 'email', 'voice', 'wait']),
  name: z.string().min(1, 'Step name is required'),
  content: z.string().min(1, 'Content is required'),
  subject: z.string().optional(),
  delay: z.number().min(0),
  delay_unit: z.enum(['minutes', 'hours', 'days'])
})

export const campaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  description: z.string().optional(),
  steps: z.array(campaignStepSchema).min(1, 'At least one step is required'),
  settings: z.object({
    start_delay: z.number().min(0).default(0),
    business_hours_only: z.boolean().default(true),
    timezone: z.string().default('America/New_York'),
    max_attempts: z.number().min(1).max(10).default(3),
    retry_delay: z.number().min(1).default(24)
  }).optional()
})

// Lead validation schemas
export const leadSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  source: z.string().optional(),
  metadata: z.record(z.any()).optional()
}).refine(data => data.email || data.phone, {
  message: "Either email or phone is required"
})

// Organization validation schemas
export const organizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  type: z.enum(['university', 'college', 'bootcamp', 'corporate']),
  domain: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  phone: z.string().optional(),
  timezone: z.string().default('America/New_York')
})

// User validation schemas
export const userProfileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['owner', 'admin', 'manager', 'user']).default('user')
})

export type CampaignStep = z.infer<typeof campaignStepSchema>
export type Campaign = z.infer<typeof campaignSchema>
export type Lead = z.infer<typeof leadSchema>
export type Organization = z.infer<typeof organizationSchema>
export type UserProfile = z.infer<typeof userProfileSchema>