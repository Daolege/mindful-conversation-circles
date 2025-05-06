
-- 给fix_homework_order函数添加SECURITY DEFINER选项，确保它可以以足够权限执行
CREATE OR REPLACE FUNCTION public.fix_homework_order()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- 添加安全定义器选项
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

-- 给fix_homework_constraints函数添加SECURITY DEFINER选项
CREATE OR REPLACE FUNCTION public.fix_homework_constraints()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- 添加安全定义器选项
AS $$
BEGIN
  -- 保持原有的实现不变
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
  
  -- 记录迁移完成状态
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

-- 立即执行函数修复作业位置
SELECT fix_homework_order();
SELECT fix_homework_constraints();

-- 特别处理问题讲座的作业，确保彻底修复
UPDATE public.homework
SET position = (ROW_NUMBER() OVER (ORDER BY created_at))
WHERE lecture_id = 'e4e40b6a-99aa-494e-8da1-e86c1141b851';

