import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, FileText, AlertTriangle } from "lucide-react";

const mockAuditEntries = [
  {
    id: "1",
    timestamp: "2024-01-15 14:32:15",
    user: "Dr. Sarah Johnson",
    action: "Data Validation",
    details: "Validated SUBJ-001 baseline forms",
    type: "validation" as const
  },
  {
    id: "2", 
    timestamp: "2024-01-15 13:45:22",
    user: "System",
    action: "Auto-Export",
    details: "Generated SDTM export for Site A",
    type: "export" as const
  },
  {
    id: "3",
    timestamp: "2024-01-15 12:18:44", 
    user: "Mark Wilson",
    action: "Query Resolution",
    details: "Resolved data query for SUBJ-003",
    type: "query" as const
  },
  {
    id: "4",
    timestamp: "2024-01-15 11:22:33",
    user: "System",
    action: "Validation Error",
    details: "Range check failed for vital signs",
    type: "error" as const
  }
];

export const AuditTrail = () => {
  const getActionIcon = (type: string) => {
    switch (type) {
      case "validation": return FileText;
      case "export": return FileText;
      case "query": return AlertTriangle;
      case "error": return AlertTriangle;
      default: return Clock;
    }
  };

  const getActionBadge = (type: string) => {
    switch (type) {
      case "validation": return <Badge variant="secondary">Validation</Badge>;
      case "export": return <Badge className="bg-status-complete text-white">Export</Badge>;
      case "query": return <Badge className="bg-status-pending text-warning-foreground">Query</Badge>;
      case "error": return <Badge className="bg-status-error text-white">Error</Badge>;
      default: return <Badge variant="outline">System</Badge>;
    }
  };

  return (
    <Card className="bg-card border-border shadow-card">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-foreground">Audit Trail</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {mockAuditEntries.map((entry) => {
            const IconComponent = getActionIcon(entry.type);
            return (
              <div key={entry.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-2 bg-gradient-subtle rounded-lg">
                  <IconComponent className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{entry.action}</p>
                    {getActionBadge(entry.type)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{entry.details}</p>
                  <div className="flex items-center space-x-2 mt-2 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>{entry.user}</span>
                    <Clock className="h-3 w-3 ml-2" />
                    <span>{entry.timestamp}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};