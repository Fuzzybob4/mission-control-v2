# Supabase Setup Instructions

Run these SQL scripts in Supabase SQL Editor in order:

1. **000_reset_database.sql** - ⚠️ Optional: Only for fresh start (drops all tables)
2. **001_create_extensions.sql** - Enable PostgreSQL extensions
3. **002_create_core_tables.sql** - Create all core tables (agents, leads, events, tasks, api_costs) with seed data
4. **003_enable_rls_policies.sql** - Enable Row Level Security
5. **004_create_vault_tables.sql** - Create secure credential vault

## Tables Created

| Table | Purpose |
|-------|---------|
| `mc_agents` | 13 AI agents (Atlas, Vera, Iris, etc.) |
| `mc_leads` | Customer leads (Alora Hess sample included) |
| `mc_events` | Activity feed / heartbeat |
| `mc_tasks` | Task assignments |
| `mc_api_costs` | API usage tracking |
| `vault_metadata` | PIN + salt for credential vault |
| `vault_credentials` | AES-encrypted credentials |
| `vault_audit_log` | Immutable access history |

## How to Run

1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql
2. Copy and paste each script in order
3. Click "Run" after each one
4. Check for ✅ success message

## After Setup

The Mission Control dashboard will show live data from these tables!
