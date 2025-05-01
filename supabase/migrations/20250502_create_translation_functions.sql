
-- Check if a translation exists
CREATE OR REPLACE FUNCTION check_translation_exists(
  p_language_code TEXT,
  p_namespace TEXT,
  p_key TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  translation_record RECORD;
BEGIN
  SELECT * INTO translation_record
  FROM translations
  WHERE language_code = p_language_code
  AND namespace = p_namespace
  AND key = p_key;
  
  IF FOUND THEN
    RETURN json_build_object('id', translation_record.id);
  ELSE
    RETURN NULL;
  END IF;
END;
$$;

-- Update an existing translation
CREATE OR REPLACE FUNCTION update_translation(
  p_id INTEGER,
  p_value TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE translations
  SET value = p_value,
      updated_at = NOW()
  WHERE id = p_id;
END;
$$;

-- Insert a new translation
CREATE OR REPLACE FUNCTION insert_translation(
  p_language_code TEXT,
  p_namespace TEXT,
  p_key TEXT,
  p_value TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO translations (language_code, namespace, key, value, created_at)
  VALUES (p_language_code, p_namespace, p_key, p_value, NOW());
END;
$$;

-- Get translations by language and namespace
CREATE OR REPLACE FUNCTION get_translations(
  p_language_code TEXT,
  p_namespace TEXT
)
RETURNS SETOF translations
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM translations
  WHERE language_code = p_language_code
  AND namespace = p_namespace;
END;
$$;
