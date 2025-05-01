
-- Create languages table if it doesn't exist
CREATE TABLE IF NOT EXISTS languages (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  nativeName TEXT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  rtl BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Insert default languages if they don't exist
INSERT INTO languages (code, name, nativeName, enabled)
VALUES 
  ('en', 'English', 'English', TRUE),
  ('zh', 'Chinese (Simplified)', '简体中文', TRUE)
ON CONFLICT (code) DO NOTHING;
