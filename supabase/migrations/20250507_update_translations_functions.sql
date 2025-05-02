
-- Update the existing functions to make them work better with our TypeScript types

-- Update the check_translation_exists function
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the get_namespace_translations function
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- More efficient batch upsert function
CREATE OR REPLACE FUNCTION upsert_translations_batch(translations_json JSONB)
RETURNS VOID AS $$
DECLARE
  translation_item JSONB;
BEGIN
  FOR translation_item IN SELECT * FROM jsonb_array_elements(translations_json)
  LOOP
    INSERT INTO translations (language_code, namespace, key, value)
    VALUES (
      translation_item->>'language_code',
      translation_item->>'namespace',
      translation_item->>'key',
      translation_item->>'value'
    )
    ON CONFLICT (language_code, namespace, key) 
    DO UPDATE SET 
      value = EXCLUDED.value,
      updated_at = NOW();
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
