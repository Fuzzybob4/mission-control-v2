-- 006_create_api_costs_table.sql
-- Step 6: Create API usage tracking table

CREATE TABLE IF NOT EXISTS mc_api_costs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL CHECK (provider IN ('kimi', 'openai', 'brave', 'supabase')),
  tokens_in INTEGER DEFAULT 0,
  tokens_out INTEGER DEFAULT 0,
  cost_usd DECIMAL(10,6) DEFAULT 0,
  business_unit TEXT CHECK (business_unit IN ('lone_star', 'redfox', 'heroes', 'shared')),
  agent_id TEXT REFERENCES mc_agents(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime
ALTER TABLE mc_api_costs REPLICA IDENTITY FULL;

SELECT '✅ API costs table created' as status;
