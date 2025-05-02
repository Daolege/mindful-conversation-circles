
-- Create translations table if it doesn't exist
CREATE TABLE IF NOT EXISTS "translations" (
  "id" SERIAL PRIMARY KEY,
  "language_code" TEXT NOT NULL,
  "namespace" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE("language_code", "namespace", "key")
);

-- Create languages table if it doesn't exist
CREATE TABLE IF NOT EXISTS "languages" (
  "id" SERIAL PRIMARY KEY,
  "code" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "nativeName" TEXT NOT NULL,
  "enabled" BOOLEAN DEFAULT TRUE,
  "rtl" BOOLEAN DEFAULT FALSE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default languages if they don't exist
INSERT INTO languages (code, name, nativeName, enabled)
VALUES 
  ('en', 'English', 'English', TRUE),
  ('zh', '中文', '中文', TRUE)
ON CONFLICT (code) DO NOTHING;
