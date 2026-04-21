-- Migration: Create study_annotations and study_segmentations tables
-- Run this in the Supabase SQL Editor or via `supabase db push`

-- ─── ANNOTATIONS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.study_annotations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  study_instance_uid TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, study_instance_uid)
);

ALTER TABLE public.study_annotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own annotations"
  ON public.study_annotations
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── SEGMENTATIONS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.study_segmentations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  study_instance_uid TEXT NOT NULL,
  segmentation_id TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, study_instance_uid, segmentation_id)
);

ALTER TABLE public.study_segmentations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own segmentations"
  ON public.study_segmentations
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── INDEXES ──────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_study_annotations_user_study
  ON public.study_annotations(user_id, study_instance_uid);

CREATE INDEX IF NOT EXISTS idx_study_segmentations_user_study
  ON public.study_segmentations(user_id, study_instance_uid);
