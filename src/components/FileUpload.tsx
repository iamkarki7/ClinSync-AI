import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onUploadComplete?: (fileId: string) => void;
}

export const FileUpload = ({ onUploadComplete }: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upload files.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Upload file to Supabase Storage
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('clinical-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;
      setUploadProgress(100);

      // Save file metadata to database
      const { data: fileRecord, error: dbError } = await supabase
        .from('uploaded_files')
        .insert({
          user_id: user.id,
          filename: file.name,
          file_size: file.size,
          file_type: file.type,
          file_path: uploadData.path,
          processing_status: 'pending'
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Read file content for processing
      const fileText = await file.text();
      
      // Process file with edge function
      const { error: processError } = await supabase.functions.invoke('process-upload', {
        body: { 
          fileId: fileRecord.id, 
          fileName: file.name, 
          fileContent: fileText 
        }
      });

      if (processError) throw processError;

      setUploadedFiles(prev => [...prev, fileRecord]);
      onUploadComplete?.(fileRecord.id);
      
      toast({
        title: "Upload Successful",
        description: `${file.name} has been uploaded and is being processed.`,
      });

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card className="bg-card border-border shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Clinical Trial Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
          <Input
            type="file"
            accept=".csv,.xlsx,.xls,.json,.xml,.txt"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="cursor-pointer"
          />
          <p className="text-sm text-muted-foreground mt-2">
            Supported formats: CSV, Excel, JSON, XML, TXT
          </p>
        </div>

        {isUploading && (
          <div className="space-y-2">
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">
              Uploading and processing... {Math.round(uploadProgress)}%
            </p>
          </div>
        )}

        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold">Uploaded Files</h4>
            {uploadedFiles.map((file) => (
              <div key={file.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                <FileText className="h-4 w-4" />
                <span className="flex-1">{file.filename}</span>
                {file.processing_status === 'completed' ? (
                  <CheckCircle className="h-4 w-4 text-success" />
                ) : file.processing_status === 'error' ? (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                ) : (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};