
-- Create translation history table
CREATE TABLE IF NOT EXISTS translation_history (
  id SERIAL PRIMARY KEY,
  translation_id INTEGER NOT NULL REFERENCES translations(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  namespace TEXT NOT NULL,
  key TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT NOT NULL,
  changed_by TEXT,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  version INTEGER NOT NULL
);

-- Create index for faster queries
CREATE INDEX idx_translation_history_translation_id ON translation_history(translation_id);
CREATE INDEX idx_translation_history_language_namespace ON translation_history(language_code, namespace);

-- Create a function to get the next version number for a translation
CREATE OR REPLACE FUNCTION get_next_version(p_translation_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
  next_version INTEGER;
BEGIN
  SELECT COALESCE(MAX(version), 0) + 1 INTO next_version
  FROM translation_history
  WHERE translation_id = p_translation_id;
  
  RETURN next_version;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to record translation changes
CREATE OR REPLACE FUNCTION record_translation_history()
RETURNS TRIGGER AS $$
DECLARE
  next_version INTEGER;
BEGIN
  -- Get next version number
  next_version := get_next_version(NEW.id);
  
  -- Insert history record
  INSERT INTO translation_history (
    translation_id, 
    language_code, 
    namespace, 
    key, 
    old_value, 
    new_value, 
    version
  ) VALUES (
    NEW.id,
    NEW.language_code,
    NEW.namespace,
    NEW.key,
    OLD.value,
    NEW.value,
    next_version
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on translations table
DROP TRIGGER IF EXISTS translation_history_trigger ON translations;
CREATE TRIGGER translation_history_trigger
AFTER UPDATE OF value ON translations
FOR EACH ROW
WHEN (OLD.value IS DISTINCT FROM NEW.value)
EXECUTE FUNCTION record_translation_history();
