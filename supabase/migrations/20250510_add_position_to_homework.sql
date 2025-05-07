
-- 添加position字段到homework表
ALTER TABLE IF EXISTS public.homework 
ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- 创建修复作业排序的函数
CREATE OR REPLACE FUNCTION fix_homework_order()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- 对每个讲座的作业重新排序
  WITH lecture_homeworks AS (
    SELECT id, lecture_id, ROW_NUMBER() OVER (PARTITION BY lecture_id ORDER BY created_at) as new_position
    FROM public.homework
  )
  UPDATE public.homework h
  SET position = lh.new_position
  FROM lecture_homeworks lh
  WHERE h.id = lh.id;
END;
$$;

-- 扩展fix_homework_constraints函数，包含position字段的修复
CREATE OR REPLACE FUNCTION fix_homework_constraints()
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
  
  -- 修复homework_submissions表中null的课程ID
  UPDATE public.homework_submissions s
  SET course_id = (
    SELECT id FROM public.courses_new 
    ORDER BY id 
    LIMIT 1
  )
  WHERE s.course_id IS NULL;
  
  -- 修复作业缺少position值的问题
  UPDATE public.homework h
  SET position = (
    SELECT ROW_NUMBER() OVER (PARTITION BY lecture_id ORDER BY created_at)
    FROM public.homework h2
    WHERE h2.id = h.id
  )
  WHERE h.position IS NULL OR h.position = 0;
  
  -- 记录迁移完成状态 - 替换为简单的INSERT或UPDATE
  -- 检查是否存在记录
  IF EXISTS (
    SELECT 1 FROM public.site_settings 
    WHERE site_name = 'homework_migration_completed'
  ) THEN
    -- 更新现有记录
    UPDATE public.site_settings 
    SET site_description = 'true', 
        updated_at = now()
    WHERE site_name = 'homework_migration_completed';
  ELSE
    -- 插入新记录
    INSERT INTO public.site_settings (
      site_name, 
      site_description, 
      maintenance_mode, 
      created_at, 
      updated_at
    ) VALUES (
      'homework_migration_completed', 
      'true', 
      false, 
      now(), 
      now()
    );
  END IF;
END;
$$;

-- 执行一次函数来修复现有数据
SELECT fix_homework_constraints();
SELECT fix_homework_order();
