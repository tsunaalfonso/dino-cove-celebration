INSERT INTO public.event_settings (key, value) VALUES
  ('reception_map_embed_url', ''),
  ('reception_map_direct_link', '')
ON CONFLICT (key) DO NOTHING;