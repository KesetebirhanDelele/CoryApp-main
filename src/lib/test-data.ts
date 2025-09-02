// Test data for development and demo purposes
export const TEST_USER_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
export const TEST_INSTITUTION_ID = 'b2c3d4e5-f6g7-8901-bcde-f12345678901'

export const testUser = {
  id: TEST_USER_ID,
  email: 'test@coraai.com',
  institution_id: TEST_INSTITUTION_ID,
  role: 'admin' as const,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

export const testInstitution = {
  id: TEST_INSTITUTION_ID,
  name: 'Test University',
  type: 'university',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

// SQL statements for creating test records
export const createTestRecordsSQL = `
-- Insert test organization
INSERT INTO organizations (id, name, type, created_at, updated_at)
VALUES ('${TEST_INSTITUTION_ID}', '${testInstitution.name}', '${testInstitution.type}', '${testInstitution.created_at}', '${testInstitution.updated_at}')
ON CONFLICT (id) DO NOTHING;

-- Insert test user
INSERT INTO users (id, email, institution_id, role, created_at, updated_at)
VALUES ('${TEST_USER_ID}', '${testUser.email}', '${TEST_INSTITUTION_ID}', '${testUser.role}', '${testUser.created_at}', '${testUser.updated_at}')
ON CONFLICT (id) DO NOTHING;
`

// Test campaign data for development
export const loadTestCampaignData = () => {
  return {
    questions: {
      name: 'Nursing Program Enrollment Campaign',
      goal: 'Enroll qualified candidates in our accelerated nursing program',
      target_audience: 'Healthcare professionals looking to advance their careers',
      program_details: 'Accelerated BSN Program at Metro Health University',
      key_benefits: 'Complete your BSN in 12 months, flexible evening classes, 95% NCLEX pass rate',
      objections: 'Time commitment, cost concerns, balancing work and school',
      tone: 'professional' as const,
      desired_action: 'Schedule a 15-minute information session with our admissions counselor'
    },
    prompts: [
      {
        id: 'test-sms-1',
        type: 'sms' as const,
        name: 'Initial Contact SMS',
        content: 'Hi {{first_name}}! I\'m Sarah from Metro Health University. I saw your interest in our Accelerated BSN Program. With our 95% NCLEX pass rate and flexible evening classes, you can complete your BSN in just 12 months. Can we chat for 10 minutes about your nursing career goals?',
        delay: 5,
        delay_unit: 'minutes' as const
      },
      {
        id: 'test-email-1',
        type: 'email' as const,
        name: 'Follow-up Email',
        subject: 'Your Nursing Career Advancement Starts Here, {{first_name}}',
        content: 'Hi {{first_name}},\n\nI hope this email finds you well. I wanted to personally reach out regarding your interest in our Accelerated BSN Program at Metro Health University.\n\nOur program offers:\n• Complete your BSN in just 12 months\n• Flexible evening classes for working professionals\n• 95% NCLEX pass rate\n• Clinical partnerships with top hospitals\n\nI understand you might have concerns about time commitment and balancing work with school. Our program is specifically designed for healthcare professionals like you who want to advance their careers without putting their life on hold.\n\nWould you like to schedule a 15-minute information session to discuss how this program can help you achieve your nursing career goals?\n\nBest regards,\nSarah Johnson\nAdmissions Counselor\nMetro Health University',
        delay: 2,
        delay_unit: 'hours' as const
      },
      {
        id: 'test-voice-1',
        type: 'voice' as const,
        name: 'AI Follow-up Call',
        content: 'Hi {{first_name}}, this is Sarah from the admissions team at Metro Health University. I wanted to personally follow up on your inquiry about our Accelerated BSN Program. With our 95% NCLEX pass rate and flexible evening schedule, you can advance your nursing career in just 12 months. I have just a few minutes to discuss how this program can help you achieve your career goals. Are you available for a quick chat?',
        delay: 1,
        delay_unit: 'days' as const
      }
    ],
    settings: {
      prompts: {
        welcome_message: 'Welcome to our nursing program!',
        follow_up_message: 'Thanks for your interest in advancing your nursing career.'
      },
      settings: {
        start_delay: 0,
        business_hours_only: true,
        timezone: 'America/New_York',
        max_attempts: 3,
        retry_delay: 24
      }
    }
  }
}