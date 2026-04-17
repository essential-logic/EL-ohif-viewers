-- SQL to be run in Supabase SQL Editor
-- Create dicom_files table
create table if not exists public.dicom_files (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  orthanc_instance_id text not null,
  orthanc_study_id text not null,
  orthanc_series_id text not null,
  study_instance_uid text not null,
  patient_name text,
  study_description text,
  modality text,
  study_date text,
  study_time text,
  study_name text,
  category text,
  tags text[],
  uploaded_at timestamptz default now()
);

-- Enable RLS
alter table public.dicom_files enable row level security;

-- Create policy: Users can only see their own DICOM files
create policy "Users can only see their own DICOM files"
  on public.dicom_files
  for select
  using (auth.uid() = user_id);

-- Create policy: Users can only insert their own DICOM files
create policy "Users can only insert their own DICOM files"
  on public.dicom_files
  for insert
  with check (auth.uid() = user_id);

-- Create policy: Users can only delete their own DICOM files
create policy "Users can only delete their own DICOM files"
  on public.dicom_files
  for delete
  using (auth.uid() = user_id);

-- Index for performance
create index if not exists dicom_files_user_id_idx on public.dicom_files (user_id);
create index if not exists dicom_files_study_instance_uid_idx on public.dicom_files (study_instance_uid);
