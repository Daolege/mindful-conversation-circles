
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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_languages_code ON languages(code);
CREATE INDEX IF NOT EXISTS idx_languages_enabled ON languages(enabled);

-- Insert default languages
INSERT INTO languages (code, name, nativeName, enabled, rtl) 
VALUES ('en', 'English', 'English', TRUE, FALSE), 
       ('zh', 'Chinese (Simplified)', '简体中文', TRUE, FALSE)
ON CONFLICT (code) DO NOTHING;
