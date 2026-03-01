# Supabase Setup Instructions

## Database Setup

Run these SQL scripts in Supabase SQL Editor in order:

1. **001_create_extensions.sql** - Enable PostgreSQL extensions
2. **002_create_agents_table.sql** - Create 13-agent hierarchy
3. **003_create_leads_table.sql** - Create leads table (includes Alora Hess sample)
4. **004_create_events_table.sql** - Create events/heartbeat table
5. **005_create_tasks_table.sql** - Create tasks table
6. **006_create_api_costs_table.sql** - Create API usage tracking
7. **007_enable_rls_policies.sql** - Enable security policies
8. **008_create_vault_tables.sql** - Credential vault metadata, secrets, and audit log

## How to Run

1. Go to: https://supabase.com/dashboard/project/wnqtfhcuhncikcfxpeol/sql
2. Copy and paste each script
3. Click "Run" after each one
4. Check for ✅ success message

## Tables Created

- `mc_agents` - 13 AI agents (Atlas, Vera, Iris, etc.)
- `mc_leads` - Customer leads with Alora Hess sample
- `mc_events` - Activity feed for heartbeat section
- `mc_tasks` - Task assignments
- `mc_api_costs` - API usage tracking
- `vault_metadata` - PIN + salt management for the credential vault
- `vault_credentials` - AES-encrypted credential storage
- `vault_audit_log` - Immutable access history

## Sample Data Included

- 13 agents with proper hierarchy
- Alora Hess lead ($18K, follow-up Feb 20)
- Sample events and tasks

## After Setup

The Mission Control dashboard will show live data from these tables!
