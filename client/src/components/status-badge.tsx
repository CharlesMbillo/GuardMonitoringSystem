import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: "on-duty" | "late" | "absent" | "verified" | "pending" | "exception";
  className?: string;
}

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "on-duty":
        return {
          label: "On Duty",
          className: "bg-green-100 text-green-800",
          indicator: "bg-green-500"
        };
      case "late":
        return {
          label: "Late",
          className: "bg-amber-100 text-amber-800", 
          indicator: "bg-amber-500"
        };
      case "absent":
        return {
          label: "Absent",
          className: "bg-red-100 text-red-800",
          indicator: "bg-red-500"
        };
      case "verified":
        return {
          label: "Verified",
          className: "bg-green-100 text-green-800",
          indicator: "bg-green-500"
        };
      case "pending":
        return {
          label: "Pending",
          className: "bg-blue-100 text-blue-800",
          indicator: "bg-blue-500"
        };
      case "exception":
        return {
          label: "Exception",
          className: "bg-orange-100 text-orange-800",
          indicator: "bg-orange-500"
        };
      default:
        return {
          label: "Unknown",
          className: "bg-gray-100 text-gray-800",
          indicator: "bg-gray-500"
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge 
      className={`inline-flex items-center text-xs font-medium ${config.className} ${className}`}
      data-testid={`badge-status-${status}`}
    >
      <div className={`w-1.5 h-1.5 ${config.indicator} rounded-full mr-1`}></div>
      {config.label}
    </Badge>
  );
}
