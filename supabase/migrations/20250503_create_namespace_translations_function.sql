
-- Create a function to get all translations by language and namespace for i18n
CREATE OR REPLACE FUNCTION get_namespace_translations(
  p_language_code TEXT,
  p_namespace TEXT
)
RETURNS TABLE (key TEXT, value TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT translations.key, translations.value
  FROM translations
  WHERE language_code = p_language_code
  AND namespace = p_namespace;
END;
$$;
