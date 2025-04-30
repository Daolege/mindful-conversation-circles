
CREATE OR REPLACE FUNCTION public.get_orphaned_homework()
RETURNS TABLE (id text, course_id integer, lecture_id text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT h.id::text, h.course_id, h.lecture_id::text
  FROM homework h
  LEFT JOIN courses_new c ON h.course_id = c.id
  WHERE c.id IS NULL;
END;
$$;
