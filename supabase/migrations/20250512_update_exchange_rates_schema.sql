
-- Update exchange_rates table to support both old and new fields
DO $$
BEGIN
  -- Add 'rate' column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'exchange_rates' AND column_name = 'rate') THEN
    ALTER TABLE exchange_rates ADD COLUMN rate DECIMAL(10, 4);
  END IF;

  -- Add 'from_currency' column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'exchange_rates' AND column_name = 'from_currency') THEN
    ALTER TABLE exchange_rates ADD COLUMN from_currency TEXT DEFAULT 'CNY';
  END IF;

  -- Add 'to_currency' column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'exchange_rates' AND column_name = 'to_currency') THEN
    ALTER TABLE exchange_rates ADD COLUMN to_currency TEXT DEFAULT 'USD';
  END IF;

  -- Update existing records to populate new columns
  UPDATE exchange_rates 
  SET rate = cny_to_usd, 
      from_currency = 'CNY', 
      to_currency = 'USD' 
  WHERE rate IS NULL AND cny_to_usd IS NOT NULL;

  -- Create trigger to keep fields in sync
  DROP TRIGGER IF EXISTS sync_exchange_rate_fields ON exchange_rates;
  
  CREATE OR REPLACE FUNCTION sync_exchange_rate_fields()
  RETURNS TRIGGER AS $$
  BEGIN
    IF NEW.cny_to_usd IS NOT NULL AND (NEW.rate IS NULL OR NEW.rate != NEW.cny_to_usd) THEN
      NEW.rate := NEW.cny_to_usd;
      NEW.from_currency := 'CNY';
      NEW.to_currency := 'USD';
    END IF;
    
    IF NEW.rate IS NOT NULL AND (NEW.cny_to_usd IS NULL OR NEW.cny_to_usd != NEW.rate) 
       AND NEW.from_currency = 'CNY' AND NEW.to_currency = 'USD' THEN
      NEW.cny_to_usd := NEW.rate;
    END IF;
    
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER sync_exchange_rate_fields
  BEFORE INSERT OR UPDATE ON exchange_rates
  FOR EACH ROW
  EXECUTE FUNCTION sync_exchange_rate_fields();
END $$;
