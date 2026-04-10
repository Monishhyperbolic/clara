-- Run this in your Supabase project: SQL Editor → New query → Run

-- Refill requests table
CREATE TABLE IF NOT EXISTS refill_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name text,
  user_email text,
  medication text NOT NULL,
  reason text,
  draft_note text,
  urgency text DEFAULT 'routine',
  interactions text[],
  warnings text[],
  status text DEFAULT 'pending',
  admin_note text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE refill_requests ENABLE ROW LEVEL SECURITY;

-- Users can only see their own requests
CREATE POLICY "Users see own refills" ON refill_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own requests
CREATE POLICY "Users insert own refills" ON refill_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role (admin API) can see and update all
-- (handled via service_role key bypass, or create a specific admin policy)

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON refill_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
