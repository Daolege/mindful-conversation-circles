
-- Create payment_icons table
CREATE TABLE IF NOT EXISTS "payment_icons" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" TEXT NOT NULL,
  "icon_url" TEXT NOT NULL,
  "is_active" BOOLEAN DEFAULT TRUE,
  "display_order" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create social_media_links table
CREATE TABLE IF NOT EXISTS "social_media_links" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" TEXT NOT NULL,
  "icon_url" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "is_active" BOOLEAN DEFAULT TRUE,
  "display_order" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contact_methods table
CREATE TABLE IF NOT EXISTS "contact_methods" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "type" TEXT NOT NULL,
  "label" TEXT,
  "value" TEXT NOT NULL,
  "is_active" BOOLEAN DEFAULT TRUE,
  "display_order" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create legal_documents table
CREATE TABLE IF NOT EXISTS "legal_documents" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "slug" TEXT UNIQUE NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exchange_rates table with history support
CREATE TABLE IF NOT EXISTS "exchange_rates" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "cny_to_usd" DECIMAL(10, 4) NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add new columns to site_settings table if they don't exist
DO $$
BEGIN
  -- Create site_settings table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'site_settings') THEN
    CREATE TABLE "site_settings" (
      "id" TEXT PRIMARY KEY DEFAULT 'default',
      "site_name" TEXT,
      "site_description" TEXT,
      "logo_url" TEXT,
      "contact_email" TEXT,
      "support_phone" TEXT,
      "company_name" TEXT,
      "company_full_name" TEXT,
      "company_registration_number" TEXT,
      "company_address" TEXT,
      "copyright_text" TEXT,
      "enable_registration" BOOLEAN DEFAULT TRUE,
      "maintenance_mode" BOOLEAN DEFAULT FALSE,
      "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  ELSE
    -- Company name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'site_settings' AND column_name = 'company_name') THEN
      ALTER TABLE site_settings ADD COLUMN company_name TEXT;
    END IF;

    -- Company full name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'site_settings' AND column_name = 'company_full_name') THEN
      ALTER TABLE site_settings ADD COLUMN company_full_name TEXT;
    END IF;

    -- Company address
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'site_settings' AND column_name = 'company_address') THEN
      ALTER TABLE site_settings ADD COLUMN company_address TEXT;
    END IF;

    -- Company registration number
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'site_settings' AND column_name = 'company_registration_number') THEN
      ALTER TABLE site_settings ADD COLUMN company_registration_number TEXT;
    END IF;

    -- Copyright text
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'site_settings' AND column_name = 'copyright_text') THEN
      ALTER TABLE site_settings ADD COLUMN copyright_text TEXT;
    END IF;

    -- Logo URL
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'site_settings' AND column_name = 'logo_url') THEN
      ALTER TABLE site_settings ADD COLUMN logo_url TEXT;
    END IF;
  END IF;
END $$;

-- Insert some default values into legal_documents if it's empty
INSERT INTO legal_documents (slug, title, content)
SELECT 'privacy-policy', '隐私政策', '这里是默认的隐私政策内容，请在后台管理系统中修改。'
WHERE NOT EXISTS (SELECT 1 FROM legal_documents WHERE slug = 'privacy-policy');

INSERT INTO legal_documents (slug, title, content)
SELECT 'terms-of-use', '使用条款', '这里是默认的使用条款内容，请在后台管理系统中修改。'
WHERE NOT EXISTS (SELECT 1 FROM legal_documents WHERE slug = 'terms-of-use');

INSERT INTO legal_documents (slug, title, content)
SELECT 'cookie-policy', 'Cookie政策', '这里是默认的Cookie政策内容，请在后台管理系统中修改。'
WHERE NOT EXISTS (SELECT 1 FROM legal_documents WHERE slug = 'cookie-policy');

INSERT INTO legal_documents (slug, title, content)
SELECT 'registration-agreement', '注册协议', '这里是默认的注册协议内容，请在后台管理系统中修改。'
WHERE NOT EXISTS (SELECT 1 FROM legal_documents WHERE slug = 'registration-agreement');

INSERT INTO legal_documents (slug, title, content)
SELECT 'data-transfer-terms', '跨境数据传输条款', '这里是默认的跨境数据传输条款内容，请在后台管理系统中修改。'
WHERE NOT EXISTS (SELECT 1 FROM legal_documents WHERE slug = 'data-transfer-terms');

-- Insert default exchange rate if table is empty
INSERT INTO exchange_rates (cny_to_usd)
SELECT 7.23
WHERE NOT EXISTS (SELECT 1 FROM exchange_rates);

-- Insert default site settings if table is empty
INSERT INTO site_settings (id, site_name, site_description, company_name, company_full_name)
SELECT 'default', 'SecondRise', '跨境电商学习平台', 'SecondRise', 'Mandarin (Hong Kong) International Limited'
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE id = 'default');
