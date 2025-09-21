import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileBarChart, Loader } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ReportGeneratorProps {
  onReportGenerated?: (reportId: string) => void;
}

export const ReportGenerator = ({ onReportGenerated }: ReportGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportType, setReportType] = useState("clinical_summary");
  const [generatedReports, setGeneratedReports] = useState<any[]>([]);
  const { toast } = useToast();

  const reportTypes = [
    { value: "clinical_summary", label: "Clinical Summary Report" },
    { value: "compliance_report", label: "Compliance Report" },
    { value: "data_validation", label: "Data Validation Report" },
    { value: "audit_trail", label: "Audit Trail Report" }
  ];

  const handleGenerateReport = async () => {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to generate reports.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Get user's uploaded files
      const { data: files } = await supabase
        .from('uploaded_files')
        .select('id')
        .eq('user_id', user.id)
        .eq('processing_status', 'completed');

      if (!files || files.length === 0) {
        toast({
          title: "No Data Available",
          description: "Please upload and process clinical trial data first.",
          variant: "destructive",
        });
        return;
      }

      // Generate report using edge function
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: { 
          reportType, 
          userId: user.id,
          fileIds: files.map(f => f.id)
        }
      });

      if (error) throw error;

      setGeneratedReports(prev => [...prev, data.report]);
      onReportGenerated?.(data.report.id);
      
      toast({
        title: "Report Generated",
        description: "Your clinical trial report has been generated successfully.",
      });

    } catch (error: any) {
      console.error('Report generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate report.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = (report: any) => {
    const reportContent = JSON.stringify(report.content, null, 2);
    const blob = new Blob([reportContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="bg-card border-border shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileBarChart className="h-5 w-5" />
          Generate Clinical Reports
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Report Type</label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger>
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              {reportTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleGenerateReport} 
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader className="h-4 w-4 mr-2 animate-spin" />
              Generating Report...
            </>
          ) : (
            <>
              <FileBarChart className="h-4 w-4 mr-2" />
              Generate Report
            </>
          )}
        </Button>

        {generatedReports.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold">Generated Reports</h4>
            {generatedReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-2 bg-muted rounded">
                <div>
                  <p className="font-medium">{report.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(report.generated_date).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadReport(report)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};