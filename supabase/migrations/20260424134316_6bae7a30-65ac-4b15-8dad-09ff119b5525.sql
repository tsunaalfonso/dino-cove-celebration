CREATE POLICY "Authenticated users can insert event settings"
ON public.event_settings
FOR INSERT
TO authenticated
WITH CHECK (true);

INSERT INTO public.event_settings (key, value) VALUES
  ('pb_title', 'CAEL AVERY M. ALFONSO'),
  ('pb_subtitle', '🦕 Our Little Dino • Christening 🦕'),
  ('pb_top_left_emoji', '🦕'),
  ('pb_top_right_emoji', '🥚'),
  ('pb_border_color_1', '#A8DADC'),
  ('pb_border_color_2', '#F6E27F'),
  ('pb_border_color_3', '#F4A261'),
  ('pb_name_color', '#3A6E4B'),
  ('pb_subtitle_color', '#7A5A2E'),
  ('pb_button_label', 'Photobooth')
ON CONFLICT (key) DO NOTHING;