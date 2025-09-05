import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Settings, Plus, Search, Filter, Heart, Users, FolderSync, Database } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: any;
  ipAddress: string;
  result: string;
  createdAt: string;
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("users");
  const [userFilter, setUserFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch users
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      // Mock data for now - replace with real API call
      return [
        {
          id: "1",
          username: "john.mwangi",
          email: "john.mwangi@company.com",
          role: "guard",
          isActive: true,
          createdAt: "2023-10-15T00:00:00Z",
          updatedAt: "2023-10-15T00:00:00Z"
        },
        {
          id: "2",
          username: "mary.supervisor",
          email: "mary.wanjiku@company.com",
          role: "supervisor",
          isActive: true,
          createdAt: "2023-09-22T00:00:00Z",
          updatedAt: "2023-09-22T00:00:00Z"
        },
        {
          id: "3",
          username: "admin.user",
          email: "admin@company.com",
          role: "admin",
          isActive: true,
          createdAt: "2023-08-01T00:00:00Z",
          updatedAt: "2023-08-01T00:00:00Z"
        }
      ];
    },
  });

  // Fetch audit logs
  const { data: auditLogs = [] } = useQuery<AuditLog[]>({
    queryKey: ["/api/audit-logs"],
  });

  // System configuration state
  const [config, setConfig] = useState({
    biometricMinScore: 85,
    fallbackMethod: "facial_recognition",
    livenessCheck: true,
    geofenceRadius: 100,
    timeWindow: 15,
    dataRetention: 3,
    autoDelete: true,
    encryptBiometric: true,
    lateAlerts: true,
    absenceAlerts: true,
    exceptionAlerts: true
  });

  const systemStats = {
    health: "Healthy",
    activeUsers: 67,
    dataSync: 99.8,
    storageUsed: "2.3GB"
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = userFilter === "all" || user.role === userFilter;
    return matchesSearch && matchesFilter;
  });

  const handleUserToggle = async (userId: string, isActive: boolean) => {
    try {
      await apiRequest("PATCH", `/api/admin/users/${userId}`, { isActive });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  const handleSaveConfig = async () => {
    try {
      await apiRequest("POST", "/api/admin/config", config);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/config"] });
    } catch (error) {
      console.error("Failed to save configuration:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold" data-testid="text-admin-title">System Administration</h2>
          <p className="text-muted-foreground" data-testid="text-admin-subtitle">System configuration and user management</p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <Button className="bg-amber-600 text-white hover:bg-amber-700" data-testid="button-audit-log">
            <Download className="mr-2 h-4 w-4" />
            Audit Log
          </Button>
          <Button data-testid="button-settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">System Health</p>
              <p className="text-2xl font-bold text-green-600" data-testid="text-system-health">{systemStats.health}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Heart className="text-green-600 text-xl" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Users</p>
              <p className="text-2xl font-bold" data-testid="text-active-users">{systemStats.activeUsers}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="text-blue-600 text-xl" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Data FolderSync</p>
              <p className="text-2xl font-bold text-green-600" data-testid="text-data-sync">{systemStats.dataSync}%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FolderSync className="text-green-600 text-xl" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Storage Used</p>
              <p className="text-2xl font-bold" data-testid="text-storage-used">{systemStats.storageUsed}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Database className="text-purple-600 text-xl" />
            </div>
          </div>
        </Card>
      </div>

      {/* Admin Tabs */}
      <Card className="overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-border">
            <TabsList className="grid w-full grid-cols-3 rounded-none bg-transparent h-auto p-0">
              <TabsTrigger 
                value="users" 
                className="py-4 px-6 text-sm font-medium border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none"
                data-testid="tab-users"
              >
                User Management
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="py-4 px-6 text-sm font-medium border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none"
                data-testid="tab-settings"
              >
                System Settings
              </TabsTrigger>
              <TabsTrigger 
                value="audit" 
                className="py-4 px-6 text-sm font-medium border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none"
                data-testid="tab-audit"
              >
                Audit Trail
              </TabsTrigger>
            </TabsList>
          </div>

          {/* User Management Tab */}
          <TabsContent value="users" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold" data-testid="text-user-management">User Management</h3>
              <div className="flex items-center space-x-3">
                <Input 
                  type="search" 
                  placeholder="Search users..." 
                  className="w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-search-users"
                />
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger className="w-32" data-testid="select-user-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="guard">Guards</SelectItem>
                    <SelectItem value="supervisor">Supervisors</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                  </SelectContent>
                </Select>
                <Button data-testid="button-add-user">
                  <Plus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </div>
            </div>

            {/* Users Table */}
            <Card className="overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">User</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Last Login</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Created</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((user, index) => (
                    <tr key={user.id} data-testid={`row-user-${index}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                            {user.username.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium" data-testid={`text-username-${index}`}>{user.username}</p>
                            <p className="text-sm text-muted-foreground" data-testid={`text-email-${index}`}>{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge 
                          className={`${
                            user.role === "admin" ? "bg-purple-100 text-purple-800" :
                            user.role === "hr" ? "bg-green-100 text-green-800" :
                            user.role === "supervisor" ? "bg-blue-100 text-blue-800" :
                            "bg-gray-100 text-gray-800"
                          }`}
                          data-testid={`badge-role-${index}`}
                        >
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge 
                          className={user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                          data-testid={`badge-status-${index}`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm" data-testid={`text-last-login-${index}`}>2 hours ago</td>
                      <td className="px-6 py-4 text-sm" data-testid={`text-created-${index}`}>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800" data-testid={`button-edit-user-${index}`}>
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={user.isActive ? "text-red-600 hover:text-red-800" : "text-green-600 hover:text-green-800"}
                            onClick={() => handleUserToggle(user.id, !user.isActive)}
                            data-testid={`button-toggle-user-${index}`}
                          >
                            {user.isActive ? "Disable" : "Enable"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </TabsContent>

          {/* System Settings Tab */}
          <TabsContent value="settings" className="p-6">
            <h3 className="text-lg font-semibold mb-6" data-testid="text-system-config">System Configuration</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Biometric Settings */}
              <div className="space-y-6">
                <Card className="p-6">
                  <h4 className="font-medium mb-4" data-testid="text-biometric-settings">Biometric Authentication</h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="min-score" className="block text-sm font-medium mb-2">Minimum Match Score (%)</Label>
                      <Input 
                        id="min-score"
                        type="number" 
                        value={config.biometricMinScore} 
                        onChange={(e) => setConfig({...config, biometricMinScore: parseInt(e.target.value)})}
                        className="w-full"
                        data-testid="input-min-score"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fallback" className="block text-sm font-medium mb-2">Fallback Method</Label>
                      <Select 
                        value={config.fallbackMethod} 
                        onValueChange={(value) => setConfig({...config, fallbackMethod: value})}
                      >
                        <SelectTrigger data-testid="select-fallback">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="facial_recognition">Facial Recognition</SelectItem>
                          <SelectItem value="pin_code">PIN Code</SelectItem>
                          <SelectItem value="supervisor_override">Supervisor Override</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="liveness" 
                        checked={config.livenessCheck}
                        onCheckedChange={(checked) => setConfig({...config, livenessCheck: checked})}
                        data-testid="switch-liveness"
                      />
                      <Label htmlFor="liveness" className="text-sm">Enable liveness detection</Label>
                    </div>
                  </div>
                </Card>

                {/* Geofencing Settings */}
                <Card className="p-6">
                  <h4 className="font-medium mb-4" data-testid="text-geofencing-settings">Geofencing</h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="radius" className="block text-sm font-medium mb-2">Default Radius (meters)</Label>
                      <Input 
                        id="radius"
                        type="number" 
                        value={config.geofenceRadius} 
                        onChange={(e) => setConfig({...config, geofenceRadius: parseInt(e.target.value)})}
                        className="w-full"
                        data-testid="input-geofence-radius"
                      />
                    </div>
                    <div>
                      <Label htmlFor="time-window" className="block text-sm font-medium mb-2">Time Window (minutes)</Label>
                      <Input 
                        id="time-window"
                        type="number" 
                        value={config.timeWindow} 
                        onChange={(e) => setConfig({...config, timeWindow: parseInt(e.target.value)})}
                        className="w-full"
                        data-testid="input-time-window"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Clock-in window before/after scheduled time</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Compliance Settings */}
              <div className="space-y-6">
                <Card className="p-6">
                  <h4 className="font-medium mb-4" data-testid="text-compliance-settings">Data Protection & Compliance</h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="retention" className="block text-sm font-medium mb-2">Data Retention Period (years)</Label>
                      <Input 
                        id="retention"
                        type="number" 
                        value={config.dataRetention} 
                        onChange={(e) => setConfig({...config, dataRetention: parseInt(e.target.value)})}
                        className="w-full"
                        data-testid="input-retention-period"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="auto-delete" 
                        checked={config.autoDelete}
                        onCheckedChange={(checked) => setConfig({...config, autoDelete: checked})}
                        data-testid="switch-auto-delete"
                      />
                      <Label htmlFor="auto-delete" className="text-sm">Auto-delete expired records</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="encryption" 
                        checked={config.encryptBiometric}
                        onCheckedChange={(checked) => setConfig({...config, encryptBiometric: checked})}
                        data-testid="switch-encryption"
                      />
                      <Label htmlFor="encryption" className="text-sm">Encrypt biometric data at rest</Label>
                    </div>
                  </div>
                </Card>

                {/* Notification Settings */}
                <Card className="p-6">
                  <h4 className="font-medium mb-4" data-testid="text-notification-settings">Notifications</h4>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="late-alerts" 
                        checked={config.lateAlerts}
                        onCheckedChange={(checked) => setConfig({...config, lateAlerts: checked})}
                        data-testid="switch-late-alerts"
                      />
                      <Label htmlFor="late-alerts" className="text-sm">Late arrival alerts</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="absence-alerts" 
                        checked={config.absenceAlerts}
                        onCheckedChange={(checked) => setConfig({...config, absenceAlerts: checked})}
                        data-testid="switch-absence-alerts"
                      />
                      <Label htmlFor="absence-alerts" className="text-sm">Absence notifications</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="exception-alerts" 
                        checked={config.exceptionAlerts}
                        onCheckedChange={(checked) => setConfig({...config, exceptionAlerts: checked})}
                        data-testid="switch-exception-alerts"
                      />
                      <Label htmlFor="exception-alerts" className="text-sm">Exception alerts</Label>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <Button onClick={handleSaveConfig} data-testid="button-save-config">
                Save Configuration
              </Button>
            </div>
          </TabsContent>

          {/* Audit Trail Tab */}
          <TabsContent value="audit" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold" data-testid="text-audit-trail">Audit Trail</h3>
              <div className="flex items-center space-x-3">
                <Input 
                  type="date" 
                  className="text-sm"
                  data-testid="input-audit-date"
                />
                <Select defaultValue="all">
                  <SelectTrigger className="w-48" data-testid="select-audit-action">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="clock-in">Clock-in/out</SelectItem>
                    <SelectItem value="user-management">User Management</SelectItem>
                    <SelectItem value="system-changes">System Changes</SelectItem>
                  </SelectContent>
                </Select>
                <Button data-testid="button-filter-audit">
                  <Search className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>
            </div>

            {/* Audit Log Table */}
            <Card className="overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Timestamp</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">User</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Action</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Resource</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Result</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {auditLogs.slice(0, 10).map((log, index) => (
                    <tr key={log.id} data-testid={`row-audit-${index}`}>
                      <td className="px-6 py-4 text-sm" data-testid={`text-timestamp-${index}`}>
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm" data-testid={`text-user-${index}`}>
                        {log.userId || "System"}
                      </td>
                      <td className="px-6 py-4 text-sm" data-testid={`text-action-${index}`}>
                        {log.action}
                      </td>
                      <td className="px-6 py-4 text-sm" data-testid={`text-resource-${index}`}>
                        {log.resource}
                      </td>
                      <td className="px-6 py-4">
                        <Badge 
                          className={log.result === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                          data-testid={`badge-result-${index}`}
                        >
                          {log.result.charAt(0).toUpperCase() + log.result.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm" data-testid={`text-ip-${index}`}>
                        {log.ipAddress || "--"}
                      </td>
                    </tr>
                  ))}
                  
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground" data-testid="text-no-audit-logs">
                        No audit logs available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
