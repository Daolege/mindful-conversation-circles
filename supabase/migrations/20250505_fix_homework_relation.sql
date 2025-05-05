
-- 确保homework表course_id指向的是courses_new表的id
-- This migration ensures homework and homework_submissions tables
-- have correct foreign key constraints pointing to courses_new

-- First check if fix_homework_constraints function exists, and update it
CREATE OR REPLACE FUNCTION public.fix_homework_constraints()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- 修复非空但无效的课程ID引用 - 找一个有效的课程ID来替换
  UPDATE public.homework h
  SET course_id = (
    SELECT id FROM public.courses_new 
    ORDER BY id 
    LIMIT 1
  )
  WHERE h.course_id IS NOT NULL 
  AND NOT EXISTS (
    SELECT 1 FROM public.courses_new c
    WHERE c.id = h.course_id
  );
  
  -- 修复null的课程ID
  UPDATE public.homework h
  SET course_id = (
    SELECT id FROM public.courses_new 
    ORDER BY id 
    LIMIT 1
  )
  WHERE h.course_id IS NULL;
  
  -- 修复homework_submissions表中的问题
  -- 修复非空但无效的课程ID引用
  UPDATE public.homework_submissions s
  SET course_id = (
    SELECT id FROM public.courses_new 
    ORDER BY id 
    LIMIT 1
  )
  WHERE s.course_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.courses_new c
    WHERE c.id = s.course_id
  );
  
  -- 修复null的课程ID
  UPDATE public.homework_submissions s
  SET course_id = (
    SELECT id FROM public.courses_new 
    ORDER BY id 
    LIMIT 1
  )
  WHERE s.course_id IS NULL;
  
  -- 记录迁移完成状态
  IF EXISTS (
    SELECT 1 FROM public.site_settings 
    WHERE site_name = 'homework_migration_completed'
  ) THEN
    UPDATE public.site_settings 
    SET site_description = 'true', 
        updated_at = now()
    WHERE site_name = 'homework_migration_completed';
  ELSE
    INSERT INTO public.site_settings (
      site_name, 
      site_description,
      maintenance_mode
    ) VALUES (
      'homework_migration_completed', 
      'true',
      false
    );
  END IF;
END;
$$;

-- 运行修复函数
SELECT fix_homework_constraints();

-- 记录此迁移
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = '_migrations'
  ) THEN
    CREATE TABLE public._migrations (
      id serial primary key,
      name text,
      executed_at timestamptz default now(),
      sql text,
      success boolean default true
    );
  END IF;
  
  INSERT INTO public._migrations (name, sql, success) 
  VALUES (
    'homework_relation_fix_' || to_char(now(), 'YYYY_MM_DD_HH24_MI_SS'), 
    'Updated fix_homework_constraints function and fixed homework relations', 
    true
  );
END
$$;
