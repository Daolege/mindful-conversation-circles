
-- Create a storage bucket for course videos if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'course-videos', 'course-videos', true
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'course-videos'
);

-- Create a very permissive policy for the bucket
CREATE POLICY "Allow public access to course-videos" 
ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'course-videos');

CREATE POLICY "Allow authenticated users to upload to course-videos" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'course-videos');

CREATE POLICY "Allow authenticated users to update course-videos" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'course-videos');
