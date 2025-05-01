
-- Create a function to check if a translation exists
CREATE OR REPLACE FUNCTION check_translation_exists(
  p_language_code TEXT,
  p_namespace TEXT,
  p_key TEXT
) RETURNS JSON AS $$
DECLARE
  translation_record RECORD;
BEGIN
  SELECT id INTO translation_record
  FROM translations
  WHERE language_code = p_language_code
  AND namespace = p_namespace
  AND key = p_key;
  
  IF FOUND THEN
    RETURN json_build_object('id', translation_record.id);
  ELSE
    RETURN json_build_object();
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create a function to update an existing translation
CREATE OR REPLACE FUNCTION update_translation(
  p_id INTEGER,
  p_value TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE translations
  SET value = p_value, updated_at = NOW()
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

-- Create a function to insert a new translation
CREATE OR REPLACE FUNCTION insert_translation(
  p_language_code TEXT,
  p_namespace TEXT,
  p_key TEXT,
  p_value TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO translations (language_code, namespace, key, value)
  VALUES (p_language_code, p_namespace, p_key, p_value);
END;
$$ LANGUAGE plpgsql;

-- Create a function to get translations by namespace
CREATE OR REPLACE FUNCTION get_namespace_translations(
  p_language_code TEXT,
  p_namespace TEXT
)
RETURNS TABLE(key TEXT, value TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT translations.key, translations.value
  FROM translations
  WHERE language_code = p_language_code
  AND namespace = p_namespace;
END;
$$ LANGUAGE plpgsql;
