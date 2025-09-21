import { Header } from "@/components/Header";
import { StatsCard } from "@/components/StatsCard";
import { TrialDataTable } from "@/components/TrialDataTable";
import { AuditTrail } from "@/components/AuditTrail";
import { ComplianceChart } from "@/components/ComplianceChart";
import { Button } from "@/components/ui/button";
import { FileText, Users, CheckCircle, AlertTriangle, Upload, Download } from "lucide-react";
import heroImage from "@/assets/clinical-hero.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-primary">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Clinical Trial Data Management Dashboard"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
              Clinical Trial Data Agent
            </h1>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
              Automate eCRF data extraction, validation, and reporting. 
              Reduce weeks of manual work to hours with built-in compliance and audit trails.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Upload className="h-5 w-5 mr-2" />
                Upload eCRF Data
              </Button>
              <Button variant="outline" size="lg" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                <Download className="h-5 w-5 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Subjects"
            value="1,247"
            change="+12% from last month"
            icon={Users}
            trend="up"
          />
          <StatsCard
            title="Validated Forms"
            value="2,891"
            change="+8% from last week"
            icon={CheckCircle}
            trend="up"
          />
          <StatsCard
            title="Pending Queries"
            value="23"
            change="-15% from yesterday"
            icon={AlertTriangle}
            trend="down"
          />
          <StatsCard
            title="Compliance Rate"
            value="94.2%"
            change="+2.1% improvement"
            icon={FileText}
            trend="up"
          />
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <TrialDataTable />
            <ComplianceChart />
          </div>
          <div>
            <AuditTrail />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
