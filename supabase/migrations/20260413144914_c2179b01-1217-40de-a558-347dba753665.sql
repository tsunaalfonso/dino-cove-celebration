
CREATE TABLE public.event_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.event_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read event settings"
ON public.event_settings
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Authenticated users can update event settings"
ON public.event_settings
FOR UPDATE
TO authenticated
USING (true);

-- Seed default values
INSERT INTO public.event_settings (key, value) VALUES
  ('event_date', '2026-05-09'),
  ('event_time', '10:00 AM'),
  ('ceremony_venue', 'St. Joseph Parish Church'),
  ('ceremony_address', '123 Main Street, Your City'),
  ('ceremony_time', '10:00 AM - 11:00 AM'),
  ('reception_venue', 'The Garden Hall'),
  ('reception_address', '456 Garden Avenue, Your City'),
  ('reception_time', '12:00 PM - 3:00 PM'),
  ('map_embed_url', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.802548198063!2d121.04395231535066!3d14.55371898982657!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTTCsDMzJzEzLjQiTiAxMjHCsDAyJzQ1LjgiRQ!5e0!3m2!1sen!2sph!4v1234567890'),
  ('map_direct_link', 'https://maps.google.com/?q=14.5537,121.0462'),
  ('dress_code', 'Smart Casual / Pastel Colors'),
  ('special_note', 'We kindly ask that you arrive 15 minutes before the ceremony begins. Children are welcome! 🦕');
