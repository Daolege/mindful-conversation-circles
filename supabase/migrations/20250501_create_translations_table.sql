
-- Create translations table if it doesn't exist
CREATE TABLE IF NOT EXISTS translations (
  id SERIAL PRIMARY KEY,
  language_code TEXT NOT NULL,
  namespace TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  UNIQUE(language_code, namespace, key)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_translations_language_code ON translations(language_code);
CREATE INDEX IF NOT EXISTS idx_translations_namespace ON translations(namespace);
CREATE INDEX IF NOT EXISTS idx_translations_composite ON translations(language_code, namespace);
