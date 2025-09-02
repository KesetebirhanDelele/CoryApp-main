/*
  # Multi-tenant setup for Cora AI platform

  1. New Tables
    - `organizations` - Company/institution information
    - `users` - User profiles linked to organizations
    - `organization_settings` - Company-specific configurations
    - `user_roles` - Role-based permissions within organizations
    - `organization_subscriptions` - Billing and plan information
    - `organization_integrations` - Company-specific integration settings

  2. Security
    - Enable RLS on all tables
    - Add policies for organization-based data isolation
    - Ensure users can only access their organization's data

  3. Features
    - Support for multiple organizations
    - Role-based access control within organizations
    - Organization-specific settings and branding
    - Subscription and billing tracking
    - Integration management per organization
*/

-- Organizations table (companies/institutions)
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  type text DEFAULT 'university',
  domain text,
  logo_url text,
  website text,
  phone text,
  address jsonb DEFAULT '{}',
  timezone text DEFAULT 'America/New_York',
  business_hours jsonb DEFAULT '{"start": "09:00", "end": "17:00", "days": [1,2,3,4,5]}',
  branding jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Users table with organization relationship
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  avatar_url text,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  role text DEFAULT 'user' CHECK (role IN ('owner', 'admin', 'manager', 'user')),
  permissions jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  last_login_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Organization settings for customization
CREATE TABLE IF NOT EXISTS organization_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  setting_key text NOT NULL,
  setting_value jsonb NOT NULL,
  setting_type text DEFAULT 'general' CHECK (setting_type IN ('general', 'branding', 'notifications', 'integrations', 'billing')),
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, setting_key)
);

-- Organization subscriptions for billing
CREATE TABLE IF NOT EXISTS organization_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  plan_name text NOT NULL DEFAULT 'free',
  plan_type text DEFAULT 'monthly' CHECK (plan_type IN ('monthly', 'annual', 'lifetime')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
  seats_included integer DEFAULT 5,
  seats_used integer DEFAULT 0,
  monthly_leads_limit integer DEFAULT 100,
  monthly_leads_used integer DEFAULT 0,
  features jsonb DEFAULT '[]',
  price_cents integer DEFAULT 0,
  currency text DEFAULT 'USD',
  billing_cycle_start timestamptz,
  billing_cycle_end timestamptz,
  trial_ends_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Organization integrations
CREATE TABLE IF NOT EXISTS organization_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  integration_type text NOT NULL CHECK (integration_type IN ('canvas', 'hubspot', 'salesforce', 'mailchimp', 'zapier', 'webhook')),
  integration_name text NOT NULL,
  config jsonb DEFAULT '{}',
  credentials jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  last_sync_at timestamptz,
  sync_status text DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'success', 'error')),
  error_message text,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, integration_type, integration_name)
);

-- Organization invitations for team management
CREATE TABLE IF NOT EXISTS organization_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
  invited_by uuid REFERENCES users(id),
  token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Users can read their own organization"
  ON organizations FOR SELECT
  TO authenticated
  USING (id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Organization owners and admins can update their organization"
  ON organizations FOR UPDATE
  TO authenticated
  USING (id IN (
    SELECT organization_id FROM users 
    WHERE id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- Users policies
CREATE POLICY "Users can read users in their organization"
  ON users FOR SELECT
  TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Organization admins can manage users in their organization"
  ON users FOR ALL
  TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM users 
    WHERE id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- Organization settings policies
CREATE POLICY "Users can read their organization settings"
  ON organization_settings FOR SELECT
  TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Organization admins can manage settings"
  ON organization_settings FOR ALL
  TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM users 
    WHERE id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- Organization subscriptions policies
CREATE POLICY "Users can read their organization subscription"
  ON organization_subscriptions FOR SELECT
  TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Organization owners can manage subscriptions"
  ON organization_subscriptions FOR ALL
  TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM users 
    WHERE id = auth.uid() AND role = 'owner'
  ));

-- Organization integrations policies
CREATE POLICY "Users can read their organization integrations"
  ON organization_integrations FOR SELECT
  TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Organization admins can manage integrations"
  ON organization_integrations FOR ALL
  TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM users 
    WHERE id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- Organization invitations policies
CREATE POLICY "Organization admins can manage invitations"
  ON organization_invitations FOR ALL
  TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM users 
    WHERE id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- Update existing tables to include organization_id
DO $$
BEGIN
  -- Add organization_id to campaigns if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE campaigns ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_campaigns_organization_id ON campaigns(organization_id);
  END IF;

  -- Add organization_id to leads if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE leads ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_leads_organization_id ON leads(organization_id);
  END IF;
END $$;

-- Update RLS policies for existing tables
DROP POLICY IF EXISTS "Users can read own campaigns" ON campaigns;
CREATE POLICY "Users can read campaigns in their organization"
  ON campaigns FOR SELECT
  TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert own campaigns" ON campaigns;
CREATE POLICY "Users can create campaigns in their organization"
  ON campaigns FOR INSERT
  TO authenticated
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update own campaigns" ON campaigns;
CREATE POLICY "Users can update campaigns in their organization"
  ON campaigns FOR UPDATE
  TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organization_settings_org_key ON organization_settings(organization_id, setting_key);
CREATE INDEX IF NOT EXISTS idx_organization_subscriptions_org_id ON organization_subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_integrations_org_type ON organization_integrations(organization_id, integration_type);

-- Create function to generate organization slug
CREATE OR REPLACE FUNCTION generate_organization_slug(org_name text)
RETURNS text AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  -- Create base slug from organization name
  base_slug := lower(regexp_replace(org_name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  
  -- Ensure slug is not empty
  IF base_slug = '' THEN
    base_slug := 'organization';
  END IF;
  
  final_slug := base_slug;
  
  -- Check for uniqueness and append counter if needed
  WHILE EXISTS (SELECT 1 FROM organizations WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  org_id uuid;
  user_metadata jsonb;
BEGIN
  user_metadata := NEW.raw_user_meta_data;
  
  -- Create organization if it doesn't exist
  IF user_metadata->>'organization_name' IS NOT NULL THEN
    INSERT INTO organizations (name, slug, type)
    VALUES (
      user_metadata->>'organization_name',
      generate_organization_slug(user_metadata->>'organization_name'),
      COALESCE(user_metadata->>'organization_type', 'university')
    )
    RETURNING id INTO org_id;
    
    -- Create user profile
    INSERT INTO users (
      id,
      email,
      first_name,
      last_name,
      organization_id,
      role
    ) VALUES (
      NEW.id,
      NEW.email,
      user_metadata->>'first_name',
      user_metadata->>'last_name',
      org_id,
      'owner'  -- First user becomes owner
    );
    
    -- Create default subscription
    INSERT INTO organization_subscriptions (
      organization_id,
      plan_name,
      status,
      seats_included,
      monthly_leads_limit
    ) VALUES (
      org_id,
      'trial',
      'trial',
      5,
      500
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();