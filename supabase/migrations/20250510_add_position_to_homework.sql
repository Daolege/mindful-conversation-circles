
-- 添加position字段到homework表
ALTER TABLE IF EXISTS public.homework 
ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- 为现有数据初始化position字段
UPDATE public.homework SET position = id::integer WHERE position IS NULL OR position = 0;

-- 创建修复作业排序的函数
CREATE OR REPLACE FUNCTION fix_homework_order()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- 对每个讲座的作业重新排序
  WITH lecture_homeworks AS (
    SELECT id, lecture_id, ROW_NUMBER() OVER (PARTITION BY lecture_id ORDER BY id) as new_position
    FROM public.homework
  )
  UPDATE public.homework h
  SET position = lh.new_position
  FROM lecture_homeworks lh
  WHERE h.id = lh.id;
END;
$$;

-- 执行一次函数来修复现有数据
SELECT fix_homework_order();
