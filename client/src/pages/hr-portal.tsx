import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Download, Plus, Filter, Copy, ArrowLeftRight } from "lucide-react";

interface Guard {
  id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  email: string;
  isActive: boolean;
  siteId: string;
  lastActive: string;
}

interface PayrollRecord {
  guardId: string;
  guardName: string;
  scheduledHours: number;
  verifiedHours: number;
  hourlyRate: number;
  grossPay: number;
  status: string;
}

export default function HRPortal() {
  const [activeTab, setActiveTab] = useState("schedule");

  // Mock data for demonstration
  const mockGuards: Guard[] = [
    {
      id: "1",
      firstName: "John",
      lastName: "Mwangi", 
      employeeId: "EMP-001",
      email: "john.mwangi@company.com",
      isActive: true,
      siteId: "site1",
      lastActive: "2 hours ago"
    },
    {
      id: "2",
      firstName: "Sarah",
      lastName: "Kiprop",
      employeeId: "EMP-002", 
      email: "sarah.kiprop@company.com",
      isActive: true,
      siteId: "site1",
      lastActive: "1 hour ago"
    }
  ];

  const mockPayroll: PayrollRecord[] = [
    {
      guardId: "1",
      guardName: "John Mwangi",
      scheduledHours: 40.0,
      verifiedHours: 38.5,
      hourlyRate: 450,
      grossPay: 17325,
      status: "verified"
    },
    {
      guardId: "2", 
      guardName: "Sarah Kiprop",
      scheduledHours: 40.0,
      verifiedHours: 39.2,
      hourlyRate: 450,
      grossPay: 17640,
      status: "verified"
    }
  ];

  const { data: guards = mockGuards } = useQuery({
    queryKey: ["/api/guards"],
    queryFn: () => Promise.resolve(mockGuards),
  });

  const { data: payrollData = mockPayroll } = useQuery({
    queryKey: ["/api/payroll/current"],
    queryFn: () => Promise.resolve(mockPayroll),
  });

  const stats = {
    totalGuards: guards.length,
    activeShifts: 16,
    sites: 8,
    attendanceRate: 94
  };

  const payrollSummary = {
    verifiedHours: payrollData.reduce((sum, record) => sum + record.verifiedHours, 0),
    pendingVerification: 23,
    excludedHours: 15
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* HR Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold" data-testid="text-hr-title">HR Management Portal</h2>
          <p className="text-muted-foreground" data-testid="text-hr-subtitle">Manage guards, schedules, and payroll</p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <Button className="bg-green-600 text-white hover:bg-green-700" data-testid="button-export-payroll">
            <Download className="mr-2 h-4 w-4" />
            Export Payroll
          </Button>
          <Button data-testid="button-add-guard">
            <Plus className="mr-2 h-4 w-4" />
            Add Guard
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Guards</p>
              <p className="text-2xl font-bold" data-testid="text-total-guards">{stats.totalGuards}</p>
            </div>
            <i className="fas fa-users text-blue-600 text-2xl"></i>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Shifts</p>
              <p className="text-2xl font-bold" data-testid="text-active-shifts">{stats.activeShifts}</p>
            </div>
            <i className="fas fa-calendar-check text-green-600 text-2xl"></i>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Sites</p>
              <p className="text-2xl font-bold" data-testid="text-sites">{stats.sites}</p>
            </div>
            <i className="fas fa-map-marked-alt text-purple-600 text-2xl"></i>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Attendance Rate</p>
              <p className="text-2xl font-bold" data-testid="text-attendance-rate">{stats.attendanceRate}%</p>
            </div>
            <i className="fas fa-chart-line text-orange-600 text-2xl"></i>
          </div>
        </Card>
      </div>

      {/* Tab Navigation for HR Features */}
      <Card className="overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-border">
            <TabsList className="grid w-full grid-cols-3 rounded-none bg-transparent h-auto p-0">
              <TabsTrigger 
                value="schedule" 
                className="py-4 px-6 text-sm font-medium border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none"
                data-testid="tab-schedule"
              >
                Schedule Management
              </TabsTrigger>
              <TabsTrigger 
                value="guards" 
                className="py-4 px-6 text-sm font-medium border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none"
                data-testid="tab-guards"
              >
                Guard Management
              </TabsTrigger>
              <TabsTrigger 
                value="payroll" 
                className="py-4 px-6 text-sm font-medium border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none"
                data-testid="tab-payroll"
              >
                Payroll Reports
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Schedule Management Tab */}
          <TabsContent value="schedule" className="p-6">
            <div className="flex flex-col lg:flex-row lg:space-x-6">
              {/* Calendar View */}
              <div className="lg:w-2/3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold" data-testid="text-weekly-schedule">Weekly Schedule</h3>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <i className="fas fa-chevron-left"></i>
                    </Button>
                    <span className="text-sm font-medium" data-testid="text-schedule-date">Nov 13-19, 2023</span>
                    <Button variant="ghost" size="sm">
                      <i className="fas fa-chevron-right"></i>
                    </Button>
                  </div>
                </div>
                
                {/* Schedule Grid */}
                <Card className="overflow-hidden">
                  <div className="grid grid-cols-8 bg-muted">
                    <div className="p-3 text-sm font-medium text-center border-r border-border">Time</div>
                    <div className="p-3 text-sm font-medium text-center border-r border-border">Mon</div>
                    <div className="p-3 text-sm font-medium text-center border-r border-border">Tue</div>
                    <div className="p-3 text-sm font-medium text-center border-r border-border">Wed</div>
                    <div className="p-3 text-sm font-medium text-center border-r border-border">Thu</div>
                    <div className="p-3 text-sm font-medium text-center border-r border-border">Fri</div>
                    <div className="p-3 text-sm font-medium text-center border-r border-border">Sat</div>
                    <div className="p-3 text-sm font-medium text-center">Sun</div>
                  </div>
                  <div className="grid grid-cols-8 border-t border-border">
                    <div className="p-3 text-sm border-r border-border bg-gray-50 font-medium">06:00</div>
                    <div className="p-3 border-r border-border">
                      <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded" data-testid="shift-john-mon">
                        J. Mwangi<br/>Main Gate
                      </div>
                    </div>
                    <div className="p-3 border-r border-border">
                      <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded" data-testid="shift-sarah-tue">
                        S. Kiprop<br/>Parking
                      </div>
                    </div>
                    <div className="p-3 border-r border-border"></div>
                    <div className="p-3 border-r border-border"></div>
                    <div className="p-3 border-r border-border"></div>
                    <div className="p-3 border-r border-border"></div>
                    <div className="p-3"></div>
                  </div>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="lg:w-1/3 mt-6 lg:mt-0">
                <h3 className="text-lg font-semibold mb-4" data-testid="text-quick-actions">Quick Actions</h3>
                <div className="space-y-3">
                  <Button className="w-full justify-start" data-testid="button-create-shift">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Shift
                  </Button>
                  <Button className="w-full justify-start bg-green-600 text-white hover:bg-green-700" data-testid="button-copy-week">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Last Week
                  </Button>
                  <Button className="w-full justify-start bg-amber-600 text-white hover:bg-amber-700" data-testid="button-manage-swaps">
                    <ArrowLeftRight className="mr-2 h-4 w-4" />
                    Manage Swaps
                  </Button>
                </div>

                {/* Upcoming Shifts */}
                <div className="mt-6">
                  <h4 className="font-medium mb-3" data-testid="text-upcoming-shifts">Upcoming Shifts</h4>
                  <div className="space-y-2">
                    <Card className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm" data-testid="text-shift-guard-1">John Mwangi</p>
                          <p className="text-xs text-muted-foreground" data-testid="text-shift-details-1">Main Gate • 6:00 AM - 2:00 PM</p>
                        </div>
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800" data-testid="badge-shift-date-1">Tomorrow</Badge>
                      </div>
                    </Card>
                    <Card className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm" data-testid="text-shift-guard-2">Sarah Kiprop</p>
                          <p className="text-xs text-muted-foreground" data-testid="text-shift-details-2">Parking • 2:00 PM - 10:00 PM</p>
                        </div>
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800" data-testid="badge-shift-date-2">Tomorrow</Badge>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Guard Management Tab */}
          <TabsContent value="guards" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold" data-testid="text-guard-management">Guard Management</h3>
              <div className="flex items-center space-x-3">
                <Input 
                  type="search" 
                  placeholder="Search guards..." 
                  className="w-64"
                  data-testid="input-search-guards"
                />
                <Button variant="outline" data-testid="button-filter-guards">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>
            </div>

            {/* Guards Table */}
            <Card className="overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Guard</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Employee ID</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Site Assignment</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Last Active</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {guards.map((guard, index) => (
                    <tr key={guard.id} data-testid={`row-guard-${index}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                            {guard.firstName[0]}{guard.lastName[0]}
                          </div>
                          <div>
                            <p className="font-medium" data-testid={`text-guard-name-${index}`}>{guard.firstName} {guard.lastName}</p>
                            <p className="text-sm text-muted-foreground" data-testid={`text-guard-email-${index}`}>{guard.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm" data-testid={`text-employee-id-${index}`}>{guard.employeeId}</td>
                      <td className="px-6 py-4">
                        <Badge 
                          variant={guard.isActive ? "default" : "secondary"}
                          className={guard.isActive ? "bg-green-100 text-green-800" : ""}
                          data-testid={`badge-status-${index}`}
                        >
                          {guard.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm" data-testid={`text-site-${index}`}>Westlands Shopping Center</td>
                      <td className="px-6 py-4 text-sm" data-testid={`text-last-active-${index}`}>{guard.lastActive}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800" data-testid={`button-edit-${index}`}>
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800" data-testid={`button-view-${index}`}>
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </TabsContent>

          {/* Payroll Reports Tab */}
          <TabsContent value="payroll" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold" data-testid="text-payroll-reports">Payroll Reports</h3>
              <div className="flex items-center space-x-3">
                <select className="px-3 py-2 border border-border rounded-lg text-sm" data-testid="select-pay-period">
                  <option>Current Pay Period</option>
                  <option>Previous Pay Period</option>
                  <option>Custom Range</option>
                </select>
                <Button className="bg-green-600 text-white hover:bg-green-700" data-testid="button-export">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            {/* Payroll Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-green-50 border-green-200 p-6">
                <h4 className="font-medium text-green-800">Verified Hours</h4>
                <p className="text-2xl font-bold text-green-900" data-testid="text-verified-hours">{payrollSummary.verifiedHours}</p>
                <p className="text-sm text-green-600">Ready for payroll</p>
              </Card>
              <Card className="bg-amber-50 border-amber-200 p-6">
                <h4 className="font-medium text-amber-800">Pending Verification</h4>
                <p className="text-2xl font-bold text-amber-900" data-testid="text-pending-hours">{payrollSummary.pendingVerification}</p>
                <p className="text-sm text-amber-600">Requires supervisor approval</p>
              </Card>
              <Card className="bg-red-50 border-red-200 p-6">
                <h4 className="font-medium text-red-800">Excluded Hours</h4>
                <p className="text-2xl font-bold text-red-900" data-testid="text-excluded-hours">{payrollSummary.excludedHours}</p>
                <p className="text-sm text-red-600">Failed verification</p>
              </Card>
            </div>

            {/* Payroll Details Table */}
            <Card className="overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Guard</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Scheduled Hours</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Verified Hours</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Rate (KSH)</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Gross Pay</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payrollData.map((record, index) => (
                    <tr key={record.guardId} data-testid={`row-payroll-${index}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {record.guardName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="font-medium" data-testid={`text-payroll-guard-${index}`}>{record.guardName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm" data-testid={`text-scheduled-hours-${index}`}>{record.scheduledHours.toFixed(1)}</td>
                      <td className="px-6 py-4 text-sm" data-testid={`text-verified-hours-${index}`}>{record.verifiedHours.toFixed(1)}</td>
                      <td className="px-6 py-4 text-sm" data-testid={`text-hourly-rate-${index}`}>{record.hourlyRate}</td>
                      <td className="px-6 py-4 text-sm font-medium" data-testid={`text-gross-pay-${index}`}>{record.grossPay.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <Badge 
                          className="bg-green-100 text-green-800"
                          data-testid={`badge-payroll-status-${index}`}
                        >
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
