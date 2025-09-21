-- Create table for uploaded clinical trial files
CREATE TABLE public.uploaded_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  filename TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processing_status TEXT NOT NULL DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'error')),
  file_path TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for generated reports
CREATE TABLE public.generated_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  report_type TEXT NOT NULL DEFAULT 'clinical_summary' CHECK (report_type IN ('clinical_summary', 'compliance_report', 'data_validation', 'audit_trail')),
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  file_references UUID[] DEFAULT '{}',
  generated_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'generated' CHECK (status IN ('generating', 'generated', 'error')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for uploaded_files
CREATE POLICY "Users can view their own uploaded files" 
ON public.uploaded_files 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own uploaded files" 
ON public.uploaded_files 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own uploaded files" 
ON public.uploaded_files 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own uploaded files" 
ON public.uploaded_files 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for generated_reports
CREATE POLICY "Users can view their own generated reports" 
ON public.generated_reports 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own generated reports" 
ON public.generated_reports 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generated reports" 
ON public.generated_reports 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generated reports" 
ON public.generated_reports 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_uploaded_files_updated_at
  BEFORE UPDATE ON public.uploaded_files
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_generated_reports_updated_at
  BEFORE UPDATE ON public.generated_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for clinical trial files
INSERT INTO storage.buckets (id, name, public) VALUES ('clinical-files', 'clinical-files', false);

-- Create policies for clinical-files storage
CREATE POLICY "Users can view their own clinical files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'clinical-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own clinical files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'clinical-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own clinical files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'clinical-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own clinical files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'clinical-files' AND auth.uid()::text = (storage.foldername(name))[1]);