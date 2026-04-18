CREATE POLICY "Authenticated users can delete RSVPs"
ON public.rsvp_submissions
FOR DELETE
TO authenticated
USING (true);