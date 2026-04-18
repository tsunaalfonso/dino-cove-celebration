-- Remove existing duplicates (keep oldest) before adding constraint
DELETE FROM public.rsvp_submissions a
USING public.rsvp_submissions b
WHERE a.ctid > b.ctid
  AND lower(trim(a.full_name)) = lower(trim(b.full_name));

-- Create a case-insensitive unique index on trimmed full_name
CREATE UNIQUE INDEX IF NOT EXISTS rsvp_submissions_full_name_unique_ci
ON public.rsvp_submissions (lower(trim(full_name)));