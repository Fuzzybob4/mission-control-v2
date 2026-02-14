-- 003_create_leads_table.sql
-- Step 3: Create leads table for Lone Star Lighting

CREATE TABLE IF NOT EXISTS mc_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  address TEXT,
  property_type TEXT CHECK (property_type IN ('residential', 'commercial', 'hoa', 'municipal')),
  estimated_value DECIMAL(10,2),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'accepted', 'scheduled', 'completed', 'lost', 'spam')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  source TEXT,
  notes TEXT,
  follow_up_date DATE,
  business_unit TEXT DEFAULT 'lone_star' CHECK (business_unit IN ('lone_star', 'redfox', 'heroes', 'shared')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime
ALTER TABLE mc_leads REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE mc_leads;

-- Add sample lead (Alora Hess)
INSERT INTO mc_leads (name, email, company, estimated_value, status, priority, notes, follow_up_date, business_unit) VALUES 
  ('Alora Hess', 'alora.hess@cbre.com', 'CBRE - Bee Cave Galleria', 18000, 'quoted', 'high', 'Commercial property quote $17-19K. Follow up Feb 20.', '2026-02-20', 'lone_star')
ON CONFLICT DO NOTHING;

SELECT '✅ Leads table created with sample data' as status;
