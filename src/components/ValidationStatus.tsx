import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Clock, XCircle } from "lucide-react";

interface ValidationStatusProps {
  status: "validated" | "pending" | "error" | "complete";
  count?: number;
}

export const ValidationStatus = ({ status, count }: ValidationStatusProps) => {
  const statusConfig = {
    validated: {
      label: "Validated",
      icon: CheckCircle,
      className: "bg-status-validated text-white hover:bg-status-validated/90"
    },
    pending: {
      label: "Pending",
      icon: Clock,
      className: "bg-status-pending text-warning-foreground hover:bg-status-pending/90"
    },
    error: {
      label: "Error", 
      icon: XCircle,
      className: "bg-status-error text-white hover:bg-status-error/90"
    },
    complete: {
      label: "Complete",
      icon: CheckCircle,
      className: "bg-status-complete text-white hover:bg-status-complete/90"
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge className={config.className}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
      {count && ` (${count})`}
    </Badge>
  );
};