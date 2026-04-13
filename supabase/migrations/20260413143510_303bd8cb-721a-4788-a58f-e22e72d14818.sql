
CREATE TABLE public.rsvp_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  mobile_number TEXT,
  attendance_status TEXT NOT NULL CHECK (attendance_status IN ('yes', 'no')),
  guest_count INTEGER DEFAULT 0,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.rsvp_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public RSVP form)
CREATE POLICY "Anyone can submit RSVP"
  ON public.rsvp_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated users can view submissions (admin)
CREATE POLICY "Authenticated users can view RSVPs"
  ON public.rsvp_submissions
  FOR SELECT
  TO authenticated
  USING (true);
