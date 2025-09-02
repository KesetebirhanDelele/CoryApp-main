# Cora AI Admissions Assistant - Complete System Documentation

## 🎯 PROJECT OVERVIEW

Cora AI is an intelligent admissions assistant platform that automates multi-channel outreach campaigns for educational institutions. The system combines a React frontend dashboard with AI-powered backend processes to manage leads, execute campaigns, and track conversions through voice, SMS, and email channels.

## 📊 COMPLETE DATABASE SCHEMA

### Database Structure (Supabase PostgreSQL)

```json
{
  "name": "public",
  "types": [
    {
      "name": "message_type_enum",
      "type_kind": "enum",
      "enum_variants": ["prompt_sent", "user_reply", "system_generated", "classification_result"]
    },
    {
      "name": "lead_status_enum",
      "type_kind": "enum",
      "enum_variants": ["new", "active", "in_progress", "interested", "not_interested", "callback_requested", "demo_scheduled", "qualified", "unresponsive", "opted_out", "enrolled", "lost", "invalid", "archived"]
    },
    {
      "name": "interaction_channel_enum",
      "type_kind": "enum",
      "enum_variants": ["voice", "sms", "email", "web", "manual"]
    },
    {
      "name": "interaction_direction_enum",
      "type_kind": "enum",
      "enum_variants": ["inbound", "outbound"]
    },
    {
      "name": "interaction_status_enum",
      "type_kind": "enum",
      "enum_variants": ["pending", "sent", "delivered", "failed", "completed"]
    },
    {
      "name": "outcome_enum",
      "type_kind": "enum",
      "enum_variants": ["no_response", "converted", "callback_requested", "interested", "not_interested", "opt_out", "already_signed_up", "needs_info", "scheduled_demo", "qualified"]
    },
    {
      "name": "classification_label_enum",
      "type_kind": "enum",
      "enum_variants": ["opt_out", "interested", "not_interested", "already_signed_up", "needs_more_info", "price_objection", "timing_objection", "ready_to_enroll", "callback_requested", "demo_requested", "qualified", "unresponsive"]
    },
    {
      "name": "next_action_enum",
      "type_kind": "enum",
      "enum_variants": ["step_2", "step_3", "step_4", "escalate", "close", "opt_out", "schedule_demo", "send_info", "callback", "nurture", "qualify"]
    }
  ],
  "tables": [
    {
      "name": "organizations",
      "columns": [
        {"name": "id", "type": "uuid", "default": "gen_random_uuid()", "is_nullable": false},
        {"name": "name", "type": "text", "is_nullable": false},
        {"name": "slug", "type": "text", "is_nullable": false},
        {"name": "type", "type": "text", "default": "'university'::text", "is_nullable": true},
        {"name": "domain", "type": "text", "is_nullable": true},
        {"name": "logo_url", "type": "text", "is_nullable": true},
        {"name": "website", "type": "text", "is_nullable": true},
        {"name": "phone", "type": "text", "is_nullable": true},
        {"name": "address", "type": "jsonb", "default": "'{}'::jsonb", "is_nullable": true},
        {"name": "timezone", "type": "text", "default": "'America/New_York'::text", "is_nullable": true},
        {"name": "business_hours", "type": "jsonb", "default": "{\"end\": \"17:00\", \"days\": [1, 2, 3, 4, 5], \"start\": \"09:00\"}", "is_nullable": true},
        {"name": "branding", "type": "jsonb", "default": "'{}'::jsonb", "is_nullable": true},
        {"name": "is_active", "type": "boolean", "default": "true", "is_nullable": true},
        {"name": "created_at", "type": "timestamp with time zone", "default": "now()", "is_nullable": true},
        {"name": "updated_at", "type": "timestamp with time zone", "default": "now()", "is_nullable": true}
      ],
      "constraints": [
        {"name": "organizations_pkey", "type": "p", "definition": "PRIMARY KEY (id)"},
        {"name": "organizations_slug_key", "type": "u", "definition": "UNIQUE (slug)"}
      ],
      "foreign_keys": [],
      "is_rls_enabled": true,
      "policies": [
        {"cmd": "INSERT", "name": "Users can insert organizations", "roles": ["authenticated"]},
        {"cmd": "SELECT", "name": "Users can read organizations", "roles": ["authenticated"]},
        {"cmd": "UPDATE", "name": "Users can update organizations", "roles": ["authenticated"]}
      ]
    },
    {
      "name": "users",
      "columns": [
        {"name": "id", "type": "uuid", "is_nullable": false},
        {"name": "email", "type": "text", "is_nullable": false},
        {"name": "first_name", "type": "text", "is_nullable": true},
        {"name": "last_name", "type": "text", "is_nullable": true},
        {"name": "avatar_url", "type": "text", "is_nullable": true},
        {"name": "organization_id", "type": "uuid", "is_nullable": true},
        {"name": "role", "type": "text", "default": "'user'::text", "is_nullable": true},
        {"name": "permissions", "type": "jsonb", "default": "'[]'::jsonb", "is_nullable": true},
        {"name": "is_active", "type": "boolean", "default": "true", "is_nullable": true},
        {"name": "last_login_at", "type": "timestamp with time zone", "is_nullable": true},
        {"name": "created_at", "type": "timestamp with time zone", "default": "now()", "is_nullable": true},
        {"name": "updated_at", "type": "timestamp with time zone", "default": "now()", "is_nullable": true}
      ],
      "constraints": [
        {"name": "users_pkey", "type": "p", "definition": "PRIMARY KEY (id)"},
        {"name": "users_email_key", "type": "u", "definition": "UNIQUE (email)"},
        {"name": "users_role_check", "type": "c", "definition": "CHECK ((role = ANY (ARRAY['owner'::text, 'admin'::text, 'manager'::text, 'user'::text])))"}
      ],
      "foreign_keys": [
        {"name": "users_id_fkey", "definition": "FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE"},
        {"name": "users_organization_id_fkey", "definition": "FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE"}
      ],
      "is_rls_enabled": true,
      "policies": [
        {"cmd": "INSERT", "name": "Users can insert their own profile", "roles": ["authenticated"], "with_check": "(uid() = id)"},
        {"cmd": "SELECT", "name": "Users can read their own profile", "roles": ["authenticated"], "qual": "(uid() = id)"},
        {"cmd": "UPDATE", "name": "Users can update their own profile", "roles": ["authenticated"], "qual": "(uid() = id)", "with_check": "(uid() = id)"}
      ]
    },
    {
      "name": "campaigns",
      "columns": [
        {"name": "id", "type": "uuid", "default": "gen_random_uuid()", "is_nullable": false},
        {"name": "name", "type": "text", "is_nullable": false},
        {"name": "description", "type": "text", "is_nullable": true},
        {"name": "is_active", "type": "boolean", "default": "true", "is_nullable": true},
        {"name": "steps", "type": "jsonb", "default": "'[]'::jsonb", "is_nullable": false},
        {"name": "prompts", "type": "jsonb", "default": "'{}'::jsonb", "is_nullable": false},
        {"name": "settings", "type": "jsonb", "default": "'{}'::jsonb", "is_nullable": true},
        {"name": "created_by", "type": "uuid", "is_nullable": true},
        {"name": "created_at", "type": "timestamp with time zone", "default": "now()", "is_nullable": true},
        {"name": "updated_at", "type": "timestamp with time zone", "default": "now()", "is_nullable": true},
        {"name": "organization_id", "type": "uuid", "is_nullable": true}
      ],
      "constraints": [
        {"name": "campaigns_pkey", "type": "p", "definition": "PRIMARY KEY (id)"}
      ],
      "foreign_keys": [
        {"name": "campaigns_created_by_fkey", "definition": "FOREIGN KEY (created_by) REFERENCES auth.users(id)"},
        {"name": "campaigns_organization_id_fkey", "definition": "FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE"}
      ],
      "is_rls_enabled": true,
      "policies": [
        {"cmd": "ALL", "name": "Authenticated users can manage campaigns", "roles": ["authenticated"], "qual": "true", "with_check": "true"}
      ]
    },
    {
      "name": "leads",
      "columns": [
        {"name": "id", "type": "uuid", "default": "gen_random_uuid()", "is_nullable": false},
        {"name": "name", "type": "text", "is_nullable": true},
        {"name": "email", "type": "text", "is_nullable": true},
        {"name": "phone", "type": "text", "is_nullable": true},
        {"name": "source", "type": "text", "is_nullable": true},
        {"name": "campaign_id", "type": "uuid", "is_nullable": true},
        {"name": "current_step", "type": "integer", "default": "0", "is_nullable": true},
        {"name": "status", "type": "lead_status_enum", "default": "'new'::lead_status_enum", "is_nullable": true},
        {"name": "last_contacted_at", "type": "timestamp with time zone", "is_nullable": true},
        {"name": "next_contact_at", "type": "timestamp with time zone", "is_nullable": true},
        {"name": "opt_out_channels", "type": "text[]", "default": "'{}'::text[]", "is_nullable": true},
        {"name": "metadata", "type": "jsonb", "default": "'{}'::jsonb", "is_nullable": true},
        {"name": "created_at", "type": "timestamp with time zone", "default": "now()", "is_nullable": true},
        {"name": "updated_at", "type": "timestamp with time zone", "default": "now()", "is_nullable": true},
        {"name": "organization_id", "type": "uuid", "is_nullable": true}
      ],
      "constraints": [
        {"name": "leads_pkey", "type": "p", "definition": "PRIMARY KEY (id)"}
      ],
      "foreign_keys": [
        {"name": "leads_campaign_id_fkey", "definition": "FOREIGN KEY (campaign_id) REFERENCES campaigns(id)"},
        {"name": "leads_organization_id_fkey", "definition": "FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE"}
      ],
      "is_rls_enabled": true,
      "policies": [
        {"cmd": "ALL", "name": "Authenticated users can manage leads", "roles": ["authenticated"], "qual": "true", "with_check": "true"}
      ]
    },
    {
      "name": "interactions",
      "columns": [
        {"name": "id", "type": "uuid", "default": "gen_random_uuid()", "is_nullable": false},
        {"name": "lead_id", "type": "uuid", "is_nullable": true},
        {"name": "campaign_id", "type": "uuid", "is_nullable": true},
        {"name": "channel", "type": "interaction_channel_enum", "is_nullable": false},
        {"name": "direction", "type": "interaction_direction_enum", "is_nullable": false},
        {"name": "status", "type": "interaction_status_enum", "default": "'pending'::interaction_status_enum", "is_nullable": true},
        {"name": "content", "type": "text", "is_nullable": true},
        {"name": "subject", "type": "text", "is_nullable": true},
        {"name": "external_id", "type": "text", "is_nullable": true},
        {"name": "external_url", "type": "text", "is_nullable": true},
        {"name": "classification", "type": "jsonb", "default": "'{}'::jsonb", "is_nullable": true},
        {"name": "ai_confidence_score", "type": "numeric(3,2)", "is_nullable": true},
        {"name": "error_message", "type": "text", "is_nullable": true},
        {"name": "scheduled_at", "type": "timestamp with time zone", "is_nullable": true},
        {"name": "sent_at", "type": "timestamp with time zone", "is_nullable": true},
        {"name": "completed_at", "type": "timestamp with time zone", "is_nullable": true},
        {"name": "created_at", "type": "timestamp with time zone", "default": "now()", "is_nullable": true},
        {"name": "message_type", "type": "message_type_enum", "default": "'user_reply'::message_type_enum", "is_nullable": true},
        {"name": "response_time", "type": "integer", "is_nullable": true},
        {"name": "step_id", "type": "text", "is_nullable": true},
        {"name": "prompt_template_id", "type": "uuid", "is_nullable": true},
        {"name": "status_code", "type": "text", "is_nullable": true},
        {"name": "outcome", "type": "outcome_enum", "is_nullable": true},
        {"name": "classification_label", "type": "classification_label_enum", "is_nullable": true},
        {"name": "confidence", "type": "numeric(4,3)", "is_nullable": true},
        {"name": "next_action", "type": "next_action_enum", "is_nullable": true},
        {"name": "escalation_required", "type": "boolean", "default": "false", "is_nullable": true},
        {"name": "opt_out_detected", "type": "boolean", "default": "false", "is_nullable": true},
        {"name": "goal_achieved", "type": "boolean", "default": "false", "is_nullable": true},
        {"name": "trigger_source", "type": "text", "is_nullable": true},
        {"name": "agent_notes", "type": "text", "is_nullable": true},
        {"name": "call_duration_seconds", "type": "integer", "is_nullable": true},
        {"name": "transcript", "type": "text", "is_nullable": true},
        {"name": "voice_to_text_confidence", "type": "numeric(4,3)", "is_nullable": true},
        {"name": "audio_url", "type": "text", "is_nullable": true},
        {"name": "call_status", "type": "text", "is_nullable": true},
        {"name": "message_sid", "type": "text", "is_nullable": true},
        {"name": "carrier_delivery_status", "type": "text", "is_nullable": true},
        {"name": "sms_type", "type": "text", "is_nullable": true},
        {"name": "received_keywords", "type": "text[]", "is_nullable": true},
        {"name": "email_id", "type": "text", "is_nullable": true},
        {"name": "delivery_status", "type": "text", "is_nullable": true},
        {"name": "email_tags", "type": "text[]", "is_nullable": true},
        {"name": "reply_to_address", "type": "text", "is_nullable": true},
        {"name": "opened_at", "type": "timestamp with time zone", "is_nullable": true},
        {"name": "clicked_at", "type": "timestamp with time zone", "is_nullable": true}
      ],
      "constraints": [
        {"name": "interactions_pkey", "type": "p", "definition": "PRIMARY KEY (id)"}
      ],
      "foreign_keys": [
        {"name": "interactions_campaign_id_fkey", "definition": "FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL"},
        {"name": "interactions_lead_id_fkey", "definition": "FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE"},
        {"name": "interactions_prompt_template_id_fkey", "definition": "FOREIGN KEY (prompt_template_id) REFERENCES prompt_templates(id)"}
      ],
      "is_rls_enabled": true,
      "policies": [
        {"cmd": "ALL", "name": "Authenticated users can manage interactions", "roles": ["authenticated"], "qual": "true", "with_check": "true"}
      ]
    },
    {
      "name": "classifications",
      "columns": [
        {"name": "id", "type": "uuid", "default": "gen_random_uuid()", "is_nullable": false},
        {"name": "interaction_id", "type": "uuid", "is_nullable": true},
        {"name": "lead_id", "type": "uuid", "is_nullable": true},
        {"name": "classification_type", "type": "text", "is_nullable": false},
        {"name": "label", "type": "classification_label_enum", "is_nullable": true},
        {"name": "confidence", "type": "numeric(4,3)", "is_nullable": true},
        {"name": "reasoning", "type": "text", "is_nullable": true},
        {"name": "extracted_entities", "type": "jsonb", "default": "'{}'::jsonb", "is_nullable": true},
        {"name": "sentiment_score", "type": "numeric(3,2)", "is_nullable": true},
        {"name": "intent_analysis", "type": "jsonb", "default": "'{}'::jsonb", "is_nullable": true},
        {"name": "next_best_action", "type": "next_action_enum", "is_nullable": true},
        {"name": "escalation_reason", "type": "text", "is_nullable": true},
        {"name": "created_at", "type": "timestamp with time zone", "default": "now()", "is_nullable": true}
      ],
      "constraints": [
        {"name": "classifications_pkey", "type": "p", "definition": "PRIMARY KEY (id)"}
      ],
      "foreign_keys": [
        {"name": "classifications_interaction_id_fkey", "definition": "FOREIGN KEY (interaction_id) REFERENCES interactions(id) ON DELETE CASCADE"},
        {"name": "classifications_lead_id_fkey", "definition": "FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE"}
      ],
      "is_rls_enabled": true,
      "policies": [
        {"cmd": "ALL", "name": "Authenticated users can manage classifications", "roles": ["authenticated"], "qual": "true", "with_check": "true"}
      ]
    },
    {
      "name": "prompt_templates",
      "columns": [
        {"name": "id", "type": "uuid", "default": "gen_random_uuid()", "is_nullable": false},
        {"name": "name", "type": "text", "is_nullable": false},
        {"name": "channel", "type": "interaction_channel_enum", "is_nullable": false},
        {"name": "template", "type": "text", "is_nullable": false},
        {"name": "variables", "type": "text[]", "is_nullable": true},
        {"name": "created_at", "type": "timestamp with time zone", "default": "now()", "is_nullable": true}
      ],
      "constraints": [
        {"name": "prompt_templates_pkey", "type": "p", "definition": "PRIMARY KEY (id)"}
      ],
      "foreign_keys": [],
      "is_rls_enabled": true,
      "policies": [
        {"cmd": "INSERT", "name": "Authenticated users can insert prompt templates", "roles": ["authenticated"]},
        {"cmd": "SELECT", "name": "Authenticated users can read prompt templates", "roles": ["authenticated"]},
        {"cmd": "UPDATE", "name": "Authenticated users can update prompt templates", "roles": ["authenticated"]}
      ]
    },
    {
      "name": "campaign_metrics",
      "columns": [
        {"name": "id", "type": "uuid", "default": "gen_random_uuid()", "is_nullable": false},
        {"name": "campaign_id", "type": "uuid", "is_nullable": true},
        {"name": "date", "type": "date", "default": "CURRENT_DATE", "is_nullable": true},
        {"name": "leads_processed", "type": "integer", "default": "0", "is_nullable": true},
        {"name": "calls_made", "type": "integer", "default": "0", "is_nullable": true},
        {"name": "sms_sent", "type": "integer", "default": "0", "is_nullable": true},
        {"name": "emails_sent", "type": "integer", "default": "0", "is_nullable": true},
        {"name": "responses_received", "type": "integer", "default": "0", "is_nullable": true},
        {"name": "appointments_scheduled", "type": "integer", "default": "0", "is_nullable": true},
        {"name": "conversions", "type": "integer", "default": "0", "is_nullable": true},
        {"name": "opt_outs", "type": "integer", "default": "0", "is_nullable": true},
        {"name": "conversion_rate", "type": "numeric(5,4)", "is_nullable": true},
        {"name": "created_at", "type": "timestamp with time zone", "default": "now()", "is_nullable": true}
      ],
      "constraints": [
        {"name": "campaign_metrics_pkey", "type": "p", "definition": "PRIMARY KEY (id)"}
      ],
      "foreign_keys": [
        {"name": "campaign_metrics_campaign_id_fkey", "definition": "FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE"}
      ],
      "is_rls_enabled": true,
      "policies": [
        {"cmd": "ALL", "name": "Authenticated users can manage campaign metrics", "roles": ["authenticated"], "qual": "true", "with_check": "true"}
      ]
    },
    {
      "name": "organization_integrations",
      "columns": [
        {"name": "id", "type": "uuid", "default": "gen_random_uuid()", "is_nullable": false},
        {"name": "organization_id", "type": "uuid", "is_nullable": true},
        {"name": "integration_type", "type": "text", "is_nullable": false},
        {"name": "integration_name", "type": "text", "is_nullable": false},
        {"name": "config", "type": "jsonb", "default": "'{}'::jsonb", "is_nullable": true},
        {"name": "credentials", "type": "jsonb", "default": "'{}'::jsonb", "is_nullable": true},
        {"name": "is_active", "type": "boolean", "default": "true", "is_nullable": true},
        {"name": "last_sync_at", "type": "timestamp with time zone", "is_nullable": true},
        {"name": "sync_status", "type": "text", "default": "'pending'::text", "is_nullable": true},
        {"name": "error_message", "type": "text", "is_nullable": true},
        {"name": "created_by", "type": "uuid", "is_nullable": true},
        {"name": "created_at", "type": "timestamp with time zone", "default": "now()", "is_nullable": true},
        {"name": "updated_at", "type": "timestamp with time zone", "default": "now()", "is_nullable": true}
      ],
      "constraints": [
        {"name": "organization_integrations_pkey", "type": "p", "definition": "PRIMARY KEY (id)"},
        {"name": "organization_integrations_organization_id_integration_type__key", "type": "u", "definition": "UNIQUE (organization_id, integration_type, integration_name)"},
        {"name": "organization_integrations_integration_type_check", "type": "c", "definition": "CHECK ((integration_type = ANY (ARRAY['canvas'::text, 'hubspot'::text, 'salesforce'::text, 'mailchimp'::text, 'zapier'::text, 'webhook'::text])))"},
        {"name": "organization_integrations_sync_status_check", "type": "c", "definition": "CHECK ((sync_status = ANY (ARRAY['pending'::text, 'syncing'::text, 'success'::text, 'error'::text])))"}
      ],
      "foreign_keys": [
        {"name": "organization_integrations_created_by_fkey", "definition": "FOREIGN KEY (created_by) REFERENCES users(id)"},
        {"name": "organization_integrations_organization_id_fkey", "definition": "FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE"}
      ],
      "is_rls_enabled": true,
      "policies": [
        {"cmd": "ALL", "name": "Authenticated users can manage integrations", "roles": ["authenticated"], "qual": "true", "with_check": "true"}
      ]
    },
    {
      "name": "organization_subscriptions",
      "columns": [
        {"name": "id", "type": "uuid", "default": "gen_random_uuid()", "is_nullable": false},
        {"name": "organization_id", "type": "uuid", "is_nullable": true},
        {"name": "plan_name", "type": "text", "default": "'free'::text", "is_nullable": false},
        {"name": "plan_type", "type": "text", "default": "'monthly'::text", "is_nullable": true},
        {"name": "status", "type": "text", "default": "'active'::text", "is_nullable": true},
        {"name": "seats_included", "type": "integer", "default": "5", "is_nullable": true},
        {"name": "seats_used", "type": "integer", "default": "0", "is_nullable": true},
        {"name": "monthly_leads_limit", "type": "integer", "default": "100", "is_nullable": true},
        {"name": "monthly_leads_used", "type": "integer", "default": "0", "is_nullable": true},
        {"name": "features", "type": "jsonb", "default": "'[]'::jsonb", "is_nullable": true},
        {"name": "price_cents", "type": "integer", "default": "0", "is_nullable": true},
        {"name": "currency", "type": "text", "default": "'USD'::text", "is_nullable": true},
        {"name": "billing_cycle_start", "type": "timestamp with time zone", "is_nullable": true},
        {"name": "billing_cycle_end", "type": "timestamp with time zone", "is_nullable": true},
        {"name": "trial_ends_at", "type": "timestamp with time zone", "is_nullable": true},
        {"name": "cancelled_at", "type": "timestamp with time zone", "is_nullable": true},
        {"name": "created_at", "type": "timestamp with time zone", "default": "now()", "is_nullable": true},
        {"name": "updated_at", "type": "timestamp with time zone", "default": "now()", "is_nullable": true}
      ],
      "constraints": [
        {"name": "organization_subscriptions_pkey", "type": "p", "definition": "PRIMARY KEY (id)"},
        {"name": "organization_subscriptions_plan_type_check", "type": "c", "definition": "CHECK ((plan_type = ANY (ARRAY['monthly'::text, 'annual'::text, 'lifetime'::text])))"},
        {"name": "organization_subscriptions_status_check", "type": "c", "definition": "CHECK ((status = ANY (ARRAY['active'::text, 'cancelled'::text, 'expired'::text, 'trial'::text])))"}
      ],
      "foreign_keys": [
        {"name": "organization_subscriptions_organization_id_fkey", "definition": "FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE"}
      ],
      "is_rls_enabled": true,
      "policies": [
        {"cmd": "ALL", "name": "Authenticated users can manage subscriptions", "roles": ["authenticated"], "qual": "true", "with_check": "true"}
      ]
    }
  ]
}
```

### Key JSONB Field Structures

#### campaigns.steps (Array of Campaign Steps)
```json
[
  {
    "id": "step-uuid",
    "type": "sms|email|voice|wait",
    "name": "Step Name",
    "content": "Message content with {{variables}}",
    "subject": "Email subject (email only)",
    "delay": 5,
    "delay_unit": "minutes|hours|days",
    "conditions": {
      "on_response": "continue|stop|jump_to",
      "on_no_response": "continue|stop|jump_to",
      "jump_to_step": "step-uuid"
    }
  }
]
```

#### campaigns.settings (Campaign Configuration)
```json
{
  "start_delay": 0,
  "business_hours_only": true,
  "timezone": "America/New_York",
  "max_attempts": 3,
  "retry_delay": 24,
  "ai_enabled": true,
  "voice_settings": {
    "voice_id": "sarah",
    "speed": 1.0,
    "pitch": 0.0
  },
  "sms_settings": {
    "from_number": "+1234567890"
  },
  "email_settings": {
    "from_name": "Sarah Johnson",
    "from_email": "sarah@university.edu"
  }
}
```

#### leads.metadata (Lead Information)
```json
{
  "utm_source": "google",
  "utm_campaign": "nursing-program",
  "referrer": "https://university.edu/programs",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "form_data": {
    "interest_level": "high",
    "preferred_contact": "phone",
    "best_time": "evening"
  },
  "ai_enabled": true,
  "appointment_kpis": {
    "appointments_scheduled": 2,
    "appointments_completed": 1,
    "no_shows": 1,
    "conversion_rate": 0.5
  }
}
```

#### interactions.classification (AI Classification Results)
```json
{
  "intent": "schedule_appointment",
  "sentiment": "positive",
  "entities": {
    "program_interest": "nursing",
    "timeline": "fall_2024",
    "concerns": ["cost", "time_commitment"]
  },
  "confidence_scores": {
    "intent": 0.95,
    "sentiment": 0.87,
    "next_action": 0.92
  },
  "ai_reasoning": "Lead expressed strong interest and asked about scheduling. High confidence for appointment booking."
}
```

## 🌐 COMPLETE FRONTEND WEBSITE STRUCTURE

### Project Architecture
```
src/
├── components/
│   ├── ui/                     # Shadcn/UI components
│   │   ├── card.tsx
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── tabs.tsx
│   │   ├── badge.tsx
│   │   ├── avatar.tsx
│   │   ├── progress.tsx
│   │   ├── select.tsx
│   │   ├── switch.tsx
│   │   ├── textarea.tsx
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   ├── scroll-area.tsx
│   │   ├── separator.tsx
│   │   ├── dropdown-menu.tsx
│   │   └── mode-toggle.tsx
│   ├── layout/
│   │   ├── Header.tsx          # Top navigation with user menu
│   │   ├── Sidebar.tsx         # Left navigation menu
│   │   └── DashboardLayout.tsx # Main layout wrapper
│   ├── integrations/
│   │   └── IntegrationCard.tsx # Integration management UI
│   ├── workflows/
│   │   └── admissions/
│   │       └── AdmissionsWorkflow.tsx # Kanban board for prospects
│   ├── ErrorBoundary.tsx      # Error handling
│   ├── ProtectedRoute.tsx     # Auth route protection
│   ├── DatabaseUserChecker.tsx # Debug component
│   └── theme-provider.tsx     # Theme management
├── pages/
│   ├── LoginPage.tsx          # Authentication login
│   ├── SignupPage.tsx         # User registration
│   ├── DashboardPage.tsx      # Main dashboard with metrics
│   ├── AdmissionsPage.tsx     # Prospect management
│   ├── CampaignsListPage.tsx  # Campaign overview
│   ├── CampaignBuilderPage.tsx # Campaign creation/editing
│   ├── CampaignDetailsPage.tsx # Individual campaign analytics
│   ├── SettingsPage.tsx       # Organization settings
│   └── OrganizationSettingsPage.tsx # Detailed org management
├── lib/
│   ├── auth.tsx               # Authentication context
│   ├── supabase.ts           # Supabase client configuration
│   ├── database.types.ts     # TypeScript database types
│   ├── utils.ts              # Utility functions
│   ├── mock-data.ts          # Development test data
│   └── test-data.ts          # Campaign test data
├── hooks/
│   └── use-toast.ts          # Toast notification hook
├── App.tsx                   # Main app router
├── main.tsx                  # React entry point
└── index.css                 # Global styles with Tailwind
```

### Key Frontend Components and Their Backend Requirements

#### 1. Dashboard Page (`src/pages/DashboardPage.tsx`)
**Real-time Metrics Display:**
- Total prospects count from `leads` table
- New inquiries (status = 'new')
- Enrollment rate calculation
- Active campaigns count
- Recent activity feed from `interactions` table

**Backend Requirements:**
- Real-time Supabase subscriptions for live updates
- Aggregation queries for metrics calculation
- Activity log processing for timeline display

#### 2. Campaign Builder (`src/pages/CampaignBuilderPage.tsx`)
**AI-Powered Campaign Creation:**
- Multi-step wizard for campaign setup
- AI prompt generation based on user inputs
- Message template editor with variable substitution
- Campaign settings and timing configuration

**Backend Requirements:**
- AI service integration for prompt generation
- Template variable parsing and validation
- Campaign step validation and sequencing
- Integration with prompt_templates table

#### 3. Admissions Workflow (`src/components/workflows/admissions/AdmissionsWorkflow.tsx`)
**Kanban Board Interface:**
- Drag-and-drop prospect management
- Status-based columns (new_inquiry → enrolled)
- Prospect detail modals with interaction history
- Quick action buttons for AI calls, SMS, appointments

**Backend Requirements:**
- Real-time prospect status updates
- Interaction history aggregation
- Status change event processing
- Integration with external calendar systems

#### 4. Campaign Execution System
**Multi-Channel Automation:**
- SMS sending via Twilio/similar
- Email campaigns with tracking
- AI voice calls with conversation handling
- Response processing and classification

**Backend Requirements:**
- Message queue system for campaign execution
- AI conversation management
- Response classification and routing
- Delivery status tracking and retries

### Frontend API Expectations

#### Authentication Flow
```typescript
// Login process expects these database operations:
1. supabase.auth.signInWithPassword()
2. Query users table for profile data
3. Load organization and subscription data
4. Set up real-time subscriptions for dashboard
```

#### Campaign Management
```typescript
// Campaign creation flow:
1. POST /api/campaigns with campaign data
2. AI prompt generation via edge function
3. Campaign validation and step sequencing
4. Real-time updates to campaigns list
```

#### Lead Processing
```typescript
// Lead ingestion expects:
1. Webhook endpoints for external integrations
2. Lead classification and routing
3. Campaign assignment and step progression
4. Real-time dashboard updates
```

## 🤖 AI AGENT SYSTEM REQUIREMENTS

### Core AI Capabilities Needed

#### 1. Conversation Management
- **Voice Call Handling:** Manage inbound/outbound calls with natural conversation flow
- **SMS Response Processing:** Parse and classify text message responses
- **Email Reply Analysis:** Extract intent and sentiment from email responses
- **Multi-Turn Conversations:** Maintain context across multiple interactions

#### 2. Lead Classification Engine
- **Intent Recognition:** Identify prospect intentions (interested, not_interested, callback_requested, etc.)
- **Sentiment Analysis:** Gauge emotional tone and engagement level
- **Objection Handling:** Recognize and categorize common objections
- **Next Action Determination:** Decide optimal next steps based on conversation

#### 3. Campaign Orchestration
- **Step Progression Logic:** Move leads through campaign steps based on responses
- **Timing Optimization:** Respect business hours and optimal contact times
- **Channel Selection:** Choose best communication channel based on lead preferences
- **Escalation Triggers:** Identify when human intervention is needed

### Backend Process Architecture

#### 1. Webhook Ingestion System
```typescript
// Lead ingestion from external sources
POST /webhooks/lead-intake/{source}
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@email.com",
  "phone": "+1234567890",
  "source": "canvas|hubspot|ghl|website",
  "metadata": {
    "utm_source": "google",
    "course_interest": "nursing"
  }
}
```

#### 2. Campaign Execution Engine
```typescript
// Campaign step processor
interface CampaignProcessor {
  processStep(leadId: string, stepId: string): Promise<void>
  scheduleNextStep(leadId: string, delay: number, unit: string): Promise<void>
  handleResponse(interactionId: string, response: string): Promise<void>
  classifyResponse(content: string, context: object): Promise<Classification>
}
```

#### 3. AI Service Integration
```typescript
// AI conversation handler
interface AIConversationService {
  initiateCall(leadId: string, prompt: string): Promise<CallResult>
  processInboundCall(callSid: string, transcript: string): Promise<void>
  classifyResponse(content: string, context: object): Promise<Classification>
  generateFollowUp(leadHistory: Interaction[]): Promise<string>
}
```

### Required Supabase Edge Functions

#### 1. Lead Ingestion (`/functions/v1/lead-intake`)
- Process webhook payloads from Canvas, HubSpot, GHL
- Validate and normalize lead data
- Insert into leads table with proper organization_id
- Trigger initial campaign assignment
- Return success/error response

#### 2. Campaign Processor (`/functions/v1/campaign-processor`)
- Execute scheduled campaign steps
- Handle message sending via external APIs
- Process delivery confirmations
- Update interaction records
- Schedule next steps based on campaign logic

#### 3. Response Handler (`/functions/v1/response-handler`)
- Process inbound SMS, email, voice responses
- Classify responses using AI
- Update lead status and campaign progression
- Trigger appropriate next actions
- Log all interactions with metadata

#### 4. AI Conversation Manager (`/functions/v1/ai-conversation`)
- Handle voice call initiation and management
- Process conversation transcripts
- Generate contextual responses
- Manage conversation state and history
- Escalate to human when needed

### Integration Requirements

#### External Service Integrations
1. **Twilio** - Voice calls and SMS messaging
2. **SendGrid/Mailgun** - Email delivery and tracking
3. **OpenAI/Anthropic** - AI conversation and classification
4. **Canvas LMS API** - Student data synchronization
5. **HubSpot API** - CRM contact management
6. **GoHighLevel API** - Lead management platform

#### Real-time Updates
- Supabase Realtime subscriptions for dashboard updates
- WebSocket connections for live campaign monitoring
- Event-driven architecture for status changes
- Push notifications for important events

## 🔄 CRITICAL DATA FLOWS

### 1. Lead Ingestion Flow
```
External Source → Webhook → Lead Validation → Database Insert → Campaign Assignment → First Step Scheduling
```

### 2. Campaign Execution Flow
```
Scheduled Step → Message Generation → External API Call → Delivery Tracking → Response Monitoring → Classification → Next Step Decision
```

### 3. Response Processing Flow
```
Inbound Response → AI Classification → Intent Recognition → Lead Status Update → Campaign Progression → Dashboard Update
```

### 4. Appointment Scheduling Flow
```
AI Conversation → Calendar Integration → Appointment Creation → Confirmation Messages → KPI Tracking → Follow-up Scheduling
```

## 📋 IMPLEMENTATION PRIORITIES

### Phase 1: Core Infrastructure
1. **Supabase Edge Functions Setup**
   - Lead ingestion webhook endpoints
   - Basic campaign processor
   - Response handler foundation

2. **External API Integrations**
   - Twilio for SMS/Voice
   - Email service provider
   - AI service connection

3. **Database Triggers and Functions**
   - Auto-campaign assignment
   - Metric calculation triggers
   - Real-time update functions

### Phase 2: AI Intelligence
1. **Response Classification System**
   - Intent recognition models
   - Sentiment analysis
   - Objection categorization

2. **Conversation Management**
   - Voice call orchestration
   - Multi-turn conversation handling
   - Context maintenance

3. **Smart Campaign Logic**
   - Dynamic step progression
   - Timing optimization
   - Channel selection algorithms

### Phase 3: Advanced Features
1. **Appointment Scheduling**
   - Calendar integration
   - Automated booking
   - Reminder systems

2. **Performance Optimization**
   - Predictive analytics
   - A/B testing framework
   - Conversion optimization

3. **Enterprise Features**
   - Multi-tenant architecture
   - Advanced reporting
   - Custom integrations

## 🎯 SUCCESS METRICS

### Technical Performance
- **Response Time:** <3 seconds for webhook processing
- **Uptime:** 99.9% availability for critical functions
- **Scalability:** Handle 10,000+ leads per organization
- **Real-time Updates:** <1 second latency for dashboard updates

### Business Metrics
- **Conversion Rate:** Track lead → enrollment conversion
- **Response Rate:** Monitor engagement across channels
- **Time to Contact:** Measure speed of initial outreach
- **Appointment Show Rate:** Track scheduled vs. completed appointments

## 🔧 DEVELOPMENT GUIDELINES

### Code Organization
- Use TypeScript for all backend code
- Implement proper error handling and logging
- Follow Supabase Edge Function patterns
- Maintain type safety with database schema

### Security Requirements
- Validate all webhook payloads
- Implement rate limiting
- Secure API key management
- Audit trail for all data changes

### Testing Strategy
- Unit tests for AI classification
- Integration tests for webhook flows
- End-to-end tests for campaign execution
- Performance tests for high-volume scenarios

## 🚀 DEPLOYMENT ARCHITECTURE

### Supabase Infrastructure
- **Database:** PostgreSQL with RLS policies
- **Edge Functions:** Serverless backend processing
- **Realtime:** Live dashboard updates
- **Storage:** File attachments and recordings
- **Auth:** User authentication and authorization

### External Services
- **AI Provider:** OpenAI/Anthropic for conversation
- **Communication:** Twilio for voice/SMS, SendGrid for email
- **Monitoring:** Logging and error tracking
- **Analytics:** Performance and business metrics

This comprehensive documentation provides everything needed to build the complete backend AI system that powers Cora AI, ensuring perfect integration with the existing frontend dashboard and database structure.