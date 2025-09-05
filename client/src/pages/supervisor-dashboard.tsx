import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/components/status-badge";
import { RefreshCw, UserCheck, Clock, UserX, AlertTriangle, MapPin, CheckCircle, XCircle } from "lucide-react";

interface AttendanceRecord {
  id: string;
  guardId: string;
  clockInTime: string | null;
  clockOutTime: string | null;
  status: string;
  guard: {
    firstName: string;
    lastName: string;
    employeeId: string;
  };
}

interface Exception {
  id: string;
  type: string;
  description: string;
  severity: string;
  status: string;
  createdAt: string;
}

export default function SupervisorDashboard() {
  // Mock data for demonstration - replace with real API calls
  const mockAttendance: AttendanceRecord[] = [
    {
      id: "1",
      guardId: "guard1",
      clockInTime: "2024-01-15T08:02:00Z",
      clockOutTime: null,
      status: "verified",
      guard: { firstName: "John", lastName: "Mwangi", employeeId: "EMP-001" }
    },
    {
      id: "2", 
      guardId: "guard2",
      clockInTime: "2024-01-15T08:15:00Z",
      clockOutTime: null,
      status: "exception",
      guard: { firstName: "Sarah", lastName: "Kiprop", employeeId: "EMP-002" }
    },
    {
      id: "3",
      guardId: "guard3", 
      clockInTime: null,
      clockOutTime: null,
      status: "absent",
      guard: { firstName: "David", lastName: "Kiprotich", employeeId: "EMP-003" }
    }
  ];

  const mockExceptions: Exception[] = [
    {
      id: "1",
      type: "geofence_violation",
      description: "Guard Mary Wanjiku attempted clock-in from 250m outside authorized zone",
      severity: "medium",
      status: "pending",
      createdAt: "2024-01-15T08:45:00Z"
    },
    {
      id: "2", 
      type: "low_biometric_score",
      description: "Peter Ochieng's fingerprint match score was 82% (below 85% threshold)",
      severity: "low",
      status: "pending", 
      createdAt: "2024-01-15T08:30:00Z"
    }
  ];

  // In production, these would be real API calls
  const { data: todayAttendance = mockAttendance } = useQuery({
    queryKey: ["/api/attendance/today"],
    queryFn: () => Promise.resolve(mockAttendance),
  });

  const { data: pendingExceptions = mockExceptions } = useQuery({
    queryKey: ["/api/exceptions/pending"],
    queryFn: () => Promise.resolve(mockExceptions),
  });

  const getStatusCounts = () => {
    const onDuty = todayAttendance.filter(a => a.clockInTime && !a.clockOutTime && a.status === "verified").length;
    const late = todayAttendance.filter(a => a.status === "exception").length;
    const absent = todayAttendance.filter(a => !a.clockInTime).length;
    const exceptions = pendingExceptions.length;

    return { onDuty, late, absent, exceptions };
  };

  const { onDuty, late, absent, exceptions } = getStatusCounts();

  const getStatusBadge = (attendance: AttendanceRecord) => {
    if (!attendance.clockInTime) {
      return <StatusBadge status="absent" />;
    }
    if (attendance.status === "exception") {
      return <StatusBadge status="late" />;
    }
    return <StatusBadge status="on-duty" />;
  };

  const formatDuration = (clockInTime: string | null) => {
    if (!clockInTime) return "--";
    
    const start = new Date(clockInTime);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold" data-testid="text-dashboard-title">Supervisor Dashboard</h2>
          <p className="text-muted-foreground" data-testid="text-site-info">Westlands Shopping Center - Real-time monitoring</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span data-testid="text-last-updated">Last updated: 2 minutes ago</span>
          </div>
          <Button className="hover:bg-primary/90" data-testid="button-refresh">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">On Duty</p>
              <p className="text-3xl font-bold text-green-600" data-testid="text-on-duty-count">{onDuty}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck className="text-green-600 text-xl" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Late</p>
              <p className="text-3xl font-bold text-amber-600" data-testid="text-late-count">{late}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="text-amber-600 text-xl" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Absent</p>
              <p className="text-3xl font-bold text-red-600" data-testid="text-absent-count">{absent}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <UserX className="text-red-600 text-xl" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Exceptions</p>
              <p className="text-3xl font-bold text-blue-600" data-testid="text-exceptions-count">{exceptions}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-blue-600 text-xl" />
            </div>
          </div>
        </Card>
      </div>

      {/* Live Guard Status Table */}
      <Card className="overflow-hidden mb-8">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold" data-testid="text-guard-status-title">Live Guard Status</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Guard</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Employee ID</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Check-in Time</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Duration</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Location</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {todayAttendance.map((attendance, index) => (
                <tr key={attendance.id} data-testid={`row-guard-${index}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {attendance.guard.firstName[0]}{attendance.guard.lastName[0]}
                      </div>
                      <span className="font-medium" data-testid={`text-guard-name-${index}`}>
                        {attendance.guard.firstName} {attendance.guard.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm" data-testid={`text-employee-id-${index}`}>
                    {attendance.guard.employeeId}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(attendance)}
                  </td>
                  <td className="px-6 py-4 text-sm" data-testid={`text-checkin-time-${index}`}>
                    {attendance.clockInTime ? new Date(attendance.clockInTime).toLocaleTimeString() : "--"}
                  </td>
                  <td className="px-6 py-4 text-sm" data-testid={`text-duration-${index}`}>
                    {formatDuration(attendance.clockInTime)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center text-sm text-green-600">
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Verified
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800" data-testid={`button-view-details-${index}`}>
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Exception Alerts */}
      <div>
        <h3 className="text-lg font-semibold mb-4" data-testid="text-exceptions-title">Exception Alerts</h3>
        <div className="space-y-3">
          {pendingExceptions.map((exception, index) => (
            <Card key={exception.id} className={`p-4 flex items-start space-x-3 ${
              exception.severity === "high" ? "bg-red-50 border-red-200" :
              exception.severity === "medium" ? "bg-amber-50 border-amber-200" :
              "bg-blue-50 border-blue-200"
            }`} data-testid={`card-exception-${index}`}>
              <AlertTriangle className={`mt-1 ${
                exception.severity === "high" ? "text-red-600" :
                exception.severity === "medium" ? "text-amber-600" :
                "text-blue-600"
              }`} />
              <div className="flex-1">
                <h4 className={`font-medium ${
                  exception.severity === "high" ? "text-red-800" :
                  exception.severity === "medium" ? "text-amber-800" :
                  "text-blue-800"
                }`} data-testid={`text-exception-type-${index}`}>
                  {exception.type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                </h4>
                <p className={`text-sm ${
                  exception.severity === "high" ? "text-red-700" :
                  exception.severity === "medium" ? "text-amber-700" :
                  "text-blue-700"
                }`} data-testid={`text-exception-description-${index}`}>
                  {exception.description}
                </p>
                <div className="flex space-x-2 mt-2">
                  <Button 
                    size="sm" 
                    className={`text-xs ${
                      exception.severity === "high" ? "bg-red-600 hover:bg-red-700" :
                      exception.severity === "medium" ? "bg-amber-600 hover:bg-amber-700" :
                      "bg-blue-600 hover:bg-blue-700"
                    } text-white`}
                    data-testid={`button-review-${index}`}
                  >
                    Review
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className={`text-xs ${
                      exception.severity === "high" ? "text-red-600 border-red-600 hover:bg-red-50" :
                      exception.severity === "medium" ? "text-amber-600 border-amber-600 hover:bg-amber-50" :
                      "text-blue-600 border-blue-600 hover:bg-blue-50"
                    }`}
                    data-testid={`button-dismiss-${index}`}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          
          {pendingExceptions.length === 0 && (
            <Card className="p-6 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <p className="text-muted-foreground" data-testid="text-no-exceptions">No pending exceptions</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
