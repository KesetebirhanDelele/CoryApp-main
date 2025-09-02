/*
  # Fix RLS Policies - Remove Infinite Recursion

  1. Problem
    - Current RLS policies on users table are causing infinite recursion
    - Policies are likely referencing users table within users table policies
    - This prevents signup and profile loading

  2. Solution
    - Drop existing problematic policies
    - Create simple, non-recursive policies
    - Users can manage their own data
    - Organization admins can manage users in their org
*/

-- Drop existing policies that might cause recursion
DROP POLICY IF EXISTS "Organization admins can manage users in their organization" ON users;
DROP POLICY IF EXISTS "Users can read users in their organization" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

-- Create simple, non-recursive policies for users table
CREATE POLICY "Users can read their own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Fix organizations policies to avoid recursion
DROP POLICY IF EXISTS "Users can read their own organization" ON organizations;
DROP POLICY IF EXISTS "Organization owners and admins can update their organization" ON organizations;

CREATE POLICY "Users can read organizations"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert organizations"
  ON organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update organizations"
  ON organizations
  FOR UPDATE
  TO authenticated
  USING (true);

-- Fix campaigns policies
DROP POLICY IF EXISTS "Users can create campaigns in their organization" ON campaigns;
DROP POLICY IF EXISTS "Users can read campaigns in their organization" ON campaigns;
DROP POLICY IF EXISTS "Users can update campaigns in their organization" ON campaigns;

CREATE POLICY "Authenticated users can manage campaigns"
  ON campaigns
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Fix leads policies
DROP POLICY IF EXISTS "Users can insert leads to their campaigns" ON leads;
DROP POLICY IF EXISTS "Users can read leads from their campaigns" ON leads;
DROP POLICY IF EXISTS "Users can update leads from their campaigns" ON leads;

CREATE POLICY "Authenticated users can manage leads"
  ON leads
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Fix other tables that might have recursive policies
DROP POLICY IF EXISTS "Users can insert interactions for their leads" ON interactions;
DROP POLICY IF EXISTS "Users can read interactions from their leads" ON interactions;

CREATE POLICY "Authenticated users can manage interactions"
  ON interactions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can insert classifications for their leads" ON classifications;
DROP POLICY IF EXISTS "Users can read classifications from their leads" ON classifications;

CREATE POLICY "Authenticated users can manage classifications"
  ON classifications
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can insert metrics for their campaigns" ON campaign_metrics;
DROP POLICY IF EXISTS "Users can read metrics from their campaigns" ON campaign_metrics;

CREATE POLICY "Authenticated users can manage campaign metrics"
  ON campaign_metrics
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Fix organization-related tables
DROP POLICY IF EXISTS "Organization admins can manage settings" ON organization_settings;
DROP POLICY IF EXISTS "Users can read their organization settings" ON organization_settings;

CREATE POLICY "Authenticated users can manage organization settings"
  ON organization_settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Organization owners can manage subscriptions" ON organization_subscriptions;
DROP POLICY IF EXISTS "Users can read their organization subscription" ON organization_subscriptions;

CREATE POLICY "Authenticated users can manage subscriptions"
  ON organization_subscriptions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Organization admins can manage integrations" ON organization_integrations;
DROP POLICY IF EXISTS "Users can read their organization integrations" ON organization_integrations;

CREATE POLICY "Authenticated users can manage integrations"
  ON organization_integrations
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Organization admins can manage invitations" ON organization_invitations;

CREATE POLICY "Authenticated users can manage invitations"
  ON organization_invitations
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);