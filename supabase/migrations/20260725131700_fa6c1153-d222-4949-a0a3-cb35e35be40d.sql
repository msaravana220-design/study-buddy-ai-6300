
CREATE TABLE public.summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES public.study_materials(id) ON DELETE CASCADE,
  overview TEXT NOT NULL DEFAULT '',
  key_concepts JSONB NOT NULL DEFAULT '[]'::jsonb,
  definitions JSONB NOT NULL DEFAULT '[]'::jsonb,
  revision_notes JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.summaries TO authenticated;
GRANT ALL ON public.summaries TO service_role;

ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own summaries" ON public.summaries
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own summaries" ON public.summaries
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own summaries" ON public.summaries
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own summaries" ON public.summaries
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX summaries_user_material_idx ON public.summaries(user_id, material_id);

CREATE TRIGGER update_summaries_updated_at
  BEFORE UPDATE ON public.summaries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
