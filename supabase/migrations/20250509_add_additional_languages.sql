
-- Add all required languages to the languages table
INSERT INTO languages (code, name, nativeName, enabled, rtl)
VALUES 
  ('fr', 'French', 'Français', TRUE, FALSE),
  ('de', 'German', 'Deutsch', TRUE, FALSE),
  ('ru', 'Russian', 'Русский', TRUE, FALSE),
  ('ar', 'Arabic', 'العربية', TRUE, TRUE),
  ('es', 'Spanish', 'Español', TRUE, FALSE),
  ('vi', 'Vietnamese', 'Tiếng Việt', TRUE, FALSE),
  ('th', 'Thai', 'ไทย', TRUE, FALSE),
  ('pt', 'Portuguese', 'Português', TRUE, FALSE),
  ('ja', 'Japanese', '日本語', TRUE, FALSE),
  ('ko', 'Korean', '한국어', TRUE, FALSE)
ON CONFLICT (code) DO NOTHING;
