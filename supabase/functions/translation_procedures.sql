
-- Create a function to update translations
CREATE OR REPLACE FUNCTION update_translation(
  p_id INT,
  p_value TEXT,
  p_updated_at TIMESTAMPTZ
)
RETURNS VOID AS $$
BEGIN
  UPDATE translations
  SET value = p_value, updated_at = p_updated_at
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

-- Create a function to insert new translations
CREATE OR REPLACE FUNCTION insert_translation(
  p_language_code TEXT,
  p_namespace TEXT,
  p_key TEXT,
  p_value TEXT,
  p_created_at TIMESTAMPTZ
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO translations (language_code, namespace, key, value, created_at)
  VALUES (p_language_code, p_namespace, p_key, p_value, p_created_at);
END;
$$ LANGUAGE plpgsql;

-- Create a function to get translations by language and namespace
CREATE OR REPLACE FUNCTION get_translations(
  p_language_code TEXT,
  p_namespace TEXT
)
RETURNS SETOF translations AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM translations
  WHERE language_code = p_language_code AND namespace = p_namespace;
END;
$$ LANGUAGE plpgsql;
