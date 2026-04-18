-- Wishlist items table
CREATE TABLE public.wishlist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  link TEXT,
  image_url TEXT,
  claimed BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view wishlist items"
ON public.wishlist_items FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert wishlist items"
ON public.wishlist_items FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update wishlist items"
ON public.wishlist_items FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete wishlist items"
ON public.wishlist_items FOR DELETE
TO authenticated
USING (true);

-- Reuse or create timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_wishlist_items_updated_at
BEFORE UPDATE ON public.wishlist_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for wishlist images
INSERT INTO storage.buckets (id, name, public)
VALUES ('wishlist-images', 'wishlist-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Wishlist images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'wishlist-images');

CREATE POLICY "Authenticated users can upload wishlist images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'wishlist-images');

CREATE POLICY "Authenticated users can update wishlist images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'wishlist-images');

CREATE POLICY "Authenticated users can delete wishlist images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'wishlist-images');