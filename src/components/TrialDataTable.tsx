import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ValidationStatus } from "./ValidationStatus";
import { Button } from "@/components/ui/button";
import { Eye, Download } from "lucide-react";

const mockTrialData = [
  {
    id: "001",
    subject: "SUBJ-001",
    site: "Site A",
    visit: "Baseline",
    status: "validated" as const,
    lastModified: "2024-01-15",
    forms: 12,
    queries: 0
  },
  {
    id: "002", 
    subject: "SUBJ-002",
    site: "Site A",
    visit: "Week 4",
    status: "pending" as const,
    lastModified: "2024-01-14",
    forms: 10,
    queries: 2
  },
  {
    id: "003",
    subject: "SUBJ-003", 
    site: "Site B",
    visit: "Week 8",
    status: "error" as const,
    lastModified: "2024-01-13",
    forms: 8,
    queries: 3
  },
  {
    id: "004",
    subject: "SUBJ-004",
    site: "Site B", 
    visit: "Baseline",
    status: "complete" as const,
    lastModified: "2024-01-12",
    forms: 12,
    queries: 0
  }
];

export const TrialDataTable = () => {
  return (
    <Card className="bg-card border-border shadow-card">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground">Clinical Trial Data</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="text-muted-foreground">Subject ID</TableHead>
              <TableHead className="text-muted-foreground">Site</TableHead>
              <TableHead className="text-muted-foreground">Visit</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Forms</TableHead>
              <TableHead className="text-muted-foreground">Queries</TableHead>
              <TableHead className="text-muted-foreground">Last Modified</TableHead>
              <TableHead className="text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockTrialData.map((row) => (
              <TableRow key={row.id} className="border-border hover:bg-muted/50">
                <TableCell className="font-medium text-foreground">{row.subject}</TableCell>
                <TableCell className="text-foreground">{row.site}</TableCell>
                <TableCell className="text-foreground">{row.visit}</TableCell>
                <TableCell>
                  <ValidationStatus status={row.status} />
                </TableCell>
                <TableCell className="text-foreground">{row.forms}</TableCell>
                <TableCell className="text-foreground">{row.queries}</TableCell>
                <TableCell className="text-muted-foreground">{row.lastModified}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};