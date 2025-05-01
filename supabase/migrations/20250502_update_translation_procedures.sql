
-- Drop existing procedures if they exist to avoid conflicts
DROP FUNCTION IF EXISTS update_translation;
DROP FUNCTION IF EXISTS insert_translation;
DROP FUNCTION IF EXISTS get_translations;

-- Create a trigger function to automatically set updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on translations table
DROP TRIGGER IF EXISTS set_translation_updated_at ON translations;
CREATE TRIGGER set_translation_updated_at
BEFORE UPDATE ON translations
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Create the same trigger for languages table
DROP TRIGGER IF EXISTS set_language_updated_at ON languages;
CREATE TRIGGER set_language_updated_at
BEFORE UPDATE ON languages
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
