# Supabase Setup Instructions

## Database Setup

Run these SQL scripts in the Supabase SQL Editor in order (skip 000 unless you need a full reset):

1. **001_create_extensions.sql** – Enable required PostgreSQL extensions.
2. **002_create_core_tables.sql** – Create all Mission Control tables (agents, leads, events, tasks, API costs) and seed sample data with realtime publications.
3. **003_enable_rls_policies.sql** – Turn on RLS and apply anon/auth policies for the core tables.
4. **004_create_vault_tables.sql** – Create the credential-vault schema and grant service-role access.

## How to Run

1. Go to: https://supabase.com/dashboard/project/wnqtfhcuhncikcfxpeol/sql
2. Copy and paste each script above, one at a time.
3. Click **Run** after each script and confirm the ✅ status message.

## Tables Created

- `mc_agents` – 13-agent hierarchy (Atlas, Vera, Iris, etc.)
- `mc_leads` – Customer leads with the Alora Hess sample
- `mc_events` – Activity feed for heartbeat logging
- `mc_tasks` – Task assignments with priorities and due dates
- `mc_api_costs` – API usage + spend tracking
- `vault_metadata`, `vault_credentials`, `vault_audit_log` – Credential vault storage + audit trail

## Sample Data Included

- 13 agents with tiers & descriptions
- Alora Hess commercial lead ($18K, follow-up Feb 20)
- Mission deployment + lead capture events
- Follow-up + devops sample tasks

## After Setup

Once these scripts run, the Mission Control dashboard will show live seeded data straight from Supabase.
