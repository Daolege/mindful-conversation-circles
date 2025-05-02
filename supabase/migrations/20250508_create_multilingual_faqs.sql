
-- Create a table for multilingual FAQs
CREATE TABLE IF NOT EXISTS multilingual_faqs (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL DEFAULT 'general',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create a table for FAQ translations
CREATE TABLE IF NOT EXISTS faq_translations (
  id SERIAL PRIMARY KEY,
  faq_id INTEGER NOT NULL REFERENCES multilingual_faqs(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(faq_id, language_code)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_multilingual_faqs_category ON multilingual_faqs(category);
CREATE INDEX IF NOT EXISTS idx_multilingual_faqs_is_featured ON multilingual_faqs(is_featured);
CREATE INDEX IF NOT EXISTS idx_faq_translations_faq_id ON faq_translations(faq_id);
CREATE INDEX IF NOT EXISTS idx_faq_translations_language_code ON faq_translations(language_code);

-- Function to get FAQs with translations for a specific language
CREATE OR REPLACE FUNCTION get_faqs_by_language(lang_code TEXT)
RETURNS TABLE (
  id INTEGER,
  category TEXT,
  display_order INTEGER,
  is_featured BOOLEAN,
  is_active BOOLEAN,
  question TEXT,
  answer TEXT,
  language_code TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id,
    f.category,
    f.display_order,
    f.is_featured,
    f.is_active,
    ft.question,
    ft.answer,
    ft.language_code
  FROM 
    multilingual_faqs f
  JOIN 
    faq_translations ft ON f.id = ft.faq_id
  WHERE 
    f.is_active = true
    AND ft.language_code = lang_code
  ORDER BY 
    f.display_order, f.id;
END;
$$;

-- Function to get featured FAQs with translations for a specific language
CREATE OR REPLACE FUNCTION get_featured_faqs_by_language(lang_code TEXT, limit_count INTEGER DEFAULT 8)
RETURNS TABLE (
  id INTEGER,
  category TEXT,
  display_order INTEGER,
  is_featured BOOLEAN,
  is_active BOOLEAN,
  question TEXT,
  answer TEXT,
  language_code TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id,
    f.category,
    f.display_order,
    f.is_featured,
    f.is_active,
    ft.question,
    ft.answer,
    ft.language_code
  FROM 
    multilingual_faqs f
  JOIN 
    faq_translations ft ON f.id = ft.faq_id
  WHERE 
    f.is_active = true
    AND f.is_featured = true
    AND ft.language_code = lang_code
  ORDER BY 
    f.display_order, f.id
  LIMIT limit_count;
END;
$$;

-- Function to upsert FAQ translations
CREATE OR REPLACE FUNCTION upsert_faq_translation(
  p_faq_id INTEGER,
  p_language_code TEXT,
  p_question TEXT,
  p_answer TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO faq_translations (faq_id, language_code, question, answer)
  VALUES (p_faq_id, p_language_code, p_question, p_answer)
  ON CONFLICT (faq_id, language_code)
  DO UPDATE SET 
    question = EXCLUDED.question,
    answer = EXCLUDED.answer,
    updated_at = NOW();
END;
$$;

-- Migration to copy existing FAQs to the new multilingual system
DO $$
DECLARE
  old_faq RECORD;
  new_faq_id INTEGER;
BEGIN
  -- Only perform migration if the old faqs table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'faqs') THEN
    FOR old_faq IN SELECT * FROM faqs ORDER BY id LOOP
      -- Insert into multilingual_faqs
      INSERT INTO multilingual_faqs (category, display_order, is_featured, is_active, created_at)
      VALUES (
        COALESCE(old_faq.category, 'general'),
        COALESCE((SELECT COUNT(*) FROM multilingual_faqs), 0),
        false,
        true,
        COALESCE(old_faq.created_at, NOW())
      )
      RETURNING id INTO new_faq_id;
      
      -- Insert translations (assume default is 'en' for old faqs)
      INSERT INTO faq_translations (faq_id, language_code, question, answer, created_at)
      VALUES (
        new_faq_id,
        'en',
        old_faq.question,
        old_faq.answer,
        COALESCE(old_faq.created_at, NOW())
      );
      
      -- Also insert a Chinese translation (with automated machine translation notice)
      INSERT INTO faq_translations (faq_id, language_code, question, answer)
      VALUES (
        new_faq_id,
        'zh',
        '(需要翻译) ' || old_faq.question,
        '(需要翻译) ' || old_faq.answer
      );
    END LOOP;
  END IF;
END;
$$;
