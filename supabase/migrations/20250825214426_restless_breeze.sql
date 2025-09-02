/*
  # Create user profile trigger

  1. New Functions
    - `handle_new_user()` - Automatically creates user profile and organization on signup
  
  2. New Triggers
    - Trigger on auth.users insert to create user profile
  
  3. Security
    - Function runs with security definer privileges
    - Handles organization creation and user profile setup
*/

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  org_id uuid;
  org_slug text;
BEGIN
  -- Generate organization slug from name
  org_slug := lower(regexp_replace(
    coalesce(NEW.raw_user_meta_data->>'organization_name', 'My Organization'),
    '[^a-zA-Z0-9]+', '-', 'g'
  )) || '-' || substr(NEW.id::text, 1, 8);

  -- Create organization first
  INSERT INTO public.organizations (
    name,
    slug,
    type,
    created_at,
    updated_at
  ) VALUES (
    coalesce(NEW.raw_user_meta_data->>'organization_name', 'My Organization'),
    org_slug,
    coalesce(NEW.raw_user_meta_data->>'organization_type', 'university'),
    now(),
    now()
  ) RETURNING id INTO org_id;

  -- Create organization subscription
  INSERT INTO public.organization_subscriptions (
    organization_id,
    plan_name,
    plan_type,
    status,
    seats_included,
    seats_used,
    monthly_leads_limit,
    monthly_leads_used,
    features,
    price_cents,
    currency,
    created_at,
    updated_at
  ) VALUES (
    org_id,
    'free',
    'monthly',
    'trial',
    5,
    1,
    100,
    0,
    '["basic_campaigns", "email_support"]'::jsonb,
    0,
    'USD',
    now(),
    now()
  );

  -- Create user profile
  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    organization_id,
    role,
    permissions,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    org_id,
    'owner',
    '["all"]'::jsonb,
    true,
    now(),
    now()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();