import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const complianceData = [
  { name: "Site A", validated: 95, pending: 5, errors: 0 },
  { name: "Site B", validated: 87, pending: 8, errors: 5 },
  { name: "Site C", validated: 92, pending: 6, errors: 2 },
  { name: "Site D", validated: 88, pending: 10, errors: 2 }
];

const statusData = [
  { name: "Validated", value: 342, color: "hsl(142, 71%, 45%)" },
  { name: "Pending", value: 89, color: "hsl(43, 96%, 56%)" },
  { name: "Errors", value: 23, color: "hsl(0, 84%, 55%)" }
];

export const ComplianceChart = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-card border-border shadow-card">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-foreground">Site Compliance Status</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={complianceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px"
                }}
              />
              <Bar dataKey="validated" stackId="a" fill="hsl(142, 71%, 45%)" />
              <Bar dataKey="pending" stackId="a" fill="hsl(43, 96%, 56%)" />
              <Bar dataKey="errors" stackId="a" fill="hsl(0, 84%, 55%)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-card border-border shadow-card">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-foreground">Overall Data Status</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};