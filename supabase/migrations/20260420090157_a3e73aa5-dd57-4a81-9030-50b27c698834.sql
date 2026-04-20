
CREATE TABLE public.godparents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('ninong', 'ninang')),
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.godparents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view godparents"
ON public.godparents FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert godparents"
ON public.godparents FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update godparents"
ON public.godparents FOR UPDATE TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete godparents"
ON public.godparents FOR DELETE TO authenticated
USING (true);

CREATE TRIGGER update_godparents_updated_at
BEFORE UPDATE ON public.godparents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
