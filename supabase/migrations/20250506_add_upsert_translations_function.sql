
-- Function to upsert translations in batches
CREATE OR REPLACE FUNCTION upsert_translations_batch(translations_json JSONB)
RETURNS VOID AS $$
DECLARE
  translation_item JSONB;
BEGIN
  FOR translation_item IN SELECT * FROM jsonb_array_elements(translations_json)
  LOOP
    -- Check if translation exists
    IF EXISTS (
      SELECT 1 FROM translations 
      WHERE language_code = translation_item->>'language_code'
      AND namespace = translation_item->>'namespace' 
      AND key = translation_item->>'key'
    ) THEN
      -- Update existing translation
      UPDATE translations
      SET value = translation_item->>'value', 
          updated_at = NOW()
      WHERE language_code = translation_item->>'language_code'
      AND namespace = translation_item->>'namespace' 
      AND key = translation_item->>'key';
    ELSE
      -- Insert new translation
      INSERT INTO translations (language_code, namespace, key, value)
      VALUES (
        translation_item->>'language_code', 
        translation_item->>'namespace', 
        translation_item->>'key', 
        translation_item->>'value'
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
