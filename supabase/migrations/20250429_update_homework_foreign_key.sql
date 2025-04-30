
-- Create functions to manage the homework foreign key constraints

-- Function to create a temporary table for migrations
CREATE OR REPLACE FUNCTION public.create_migrations_temp_table()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS public._migrations (
    id serial primary key,
    name text,
    executed_at timestamptz default now()
  );
  
  RETURN 'Created temporary migrations table';
END;
$$;

-- Function to drop the existing foreign key on homework table if it exists
CREATE OR REPLACE FUNCTION public.drop_homework_foreign_key()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  constraint_name text;
BEGIN
  -- Find if there's an existing foreign key constraint on homework.course_id
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'public.homework'::regclass
  AND conname LIKE '%course_id%'
  AND contype = 'f'
  LIMIT 1;
  
  -- If constraint exists, drop it
  IF constraint_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.homework DROP CONSTRAINT ' || constraint_name;
    RETURN 'Dropped constraint: ' || constraint_name;
  END IF;
  
  RETURN 'No constraint found to drop';
END;
$$;

-- Function to add the correct foreign key to courses_new
CREATE OR REPLACE FUNCTION public.add_homework_foreign_key()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Add the foreign key constraint
  ALTER TABLE public.homework 
    ADD CONSTRAINT homework_course_id_fkey 
    FOREIGN KEY (course_id) 
    REFERENCES public.courses_new(id) 
    ON DELETE CASCADE;
    
  -- Create an index to improve query performance
  CREATE INDEX IF NOT EXISTS idx_homework_course_id 
    ON public.homework(course_id);
    
  RETURN 'Added foreign key constraint and index';
END;
$$;

-- Extra function to help debug foreign keys
CREATE OR REPLACE FUNCTION public.get_foreign_keys(table_name text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_agg(json_build_object(
    'constraint_name', conname,
    'table_name', relname,
    'column_name', a.attname,
    'foreign_table', confrelid::regclass::text,
    'foreign_column', af.attname
  )) INTO result
  FROM pg_constraint c
  JOIN pg_class r ON r.oid = c.conrelid
  JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
  JOIN pg_attribute af ON af.attnum = ANY(c.confkey) AND af.attrelid = c.confrelid
  WHERE contype = 'f'
  AND relname = table_name;
  
  RETURN result;
END;
$$;

-- Update any existing invalid references in homework table
DO $$
DECLARE
  orphaned_count integer;
BEGIN
  -- Check for orphaned records first
  SELECT COUNT(*) INTO orphaned_count
  FROM public.homework h
  LEFT JOIN public.courses_new c ON h.course_id = c.id
  WHERE c.id IS NULL;
  
  -- Log how many orphaned records we found
  RAISE NOTICE 'Found % orphaned homework records', orphaned_count;
  
  -- You could delete orphaned records here if needed
  -- But better to do it through the edge function for better control
END $$;

-- Direct execution of the migration
SELECT drop_homework_foreign_key();
SELECT add_homework_foreign_key();

-- Record this migration
INSERT INTO public._migrations (name, success) 
VALUES ('homework_foreign_key_migration_' || now()::text, true);
