
-- Create storage bucket for baby photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('baby-photos', 'baby-photos', true);

-- Allow anyone to view baby photos
CREATE POLICY "Anyone can view baby photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'baby-photos');

-- Allow authenticated users to upload baby photos
CREATE POLICY "Authenticated users can upload baby photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'baby-photos' AND auth.role() = 'authenticated');

-- Allow authenticated users to update baby photos
CREATE POLICY "Authenticated users can update baby photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'baby-photos' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete baby photos
CREATE POLICY "Authenticated users can delete baby photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'baby-photos' AND auth.role() = 'authenticated');
