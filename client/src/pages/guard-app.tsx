import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BiometricScanner from "@/components/biometric-scanner";
import { AlertTriangle, MapPin, CheckCircle, Clock } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";

interface GuardProfile {
  id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  siteId: string;
}

interface Attendance {
  id: string;
  shiftId: string;
  clockInTime: string | null;
  clockOutTime: string | null;
  status: string;
}

export default function GuardApp() {
  const { user } = useAuth();
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isOnDuty, setIsOnDuty] = useState(false);
  const [currentAttendance, setCurrentAttendance] = useState<Attendance | null>(null);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  // Fetch guard profile
  const { data: guardProfile } = useQuery<GuardProfile>({
    queryKey: ["/api/my-guard-profile"],
    enabled: !!user,
  });

  // Fetch today's attendance
  const { data: todayAttendance } = useQuery<Attendance[]>({
    queryKey: ["/api/attendance/today"],
    enabled: !!user,
  });

  // Check if currently on duty
  useEffect(() => {
    if (todayAttendance && todayAttendance.length > 0) {
      const latestAttendance = todayAttendance[todayAttendance.length - 1];
      setCurrentAttendance(latestAttendance);
      setIsOnDuty(!!latestAttendance.clockInTime && !latestAttendance.clockOutTime);
    }
  }, [todayAttendance]);

  // Clock in mutation
  const clockInMutation = useMutation({
    mutationFn: async (data: { biometricScore: number }) => {
      if (!currentLocation) throw new Error("Location not available");
      
      // For demo, we'll use a mock shift ID - in production, this would come from scheduled shifts
      const mockShiftId = "00000000-0000-0000-0000-000000000001";
      
      const response = await apiRequest("POST", "/api/attendance/clock-in", {
        shiftId: mockShiftId,
        latitude: currentLocation.lat,
        longitude: currentLocation.lng,
        biometricScore: data.biometricScore,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/today"] });
      setIsOnDuty(true);
    },
  });

  // Clock out mutation
  const clockOutMutation = useMutation({
    mutationFn: async (data: { biometricScore: number }) => {
      if (!currentLocation || !currentAttendance) throw new Error("Invalid state for clock out");
      
      const response = await apiRequest("POST", "/api/attendance/clock-out", {
        attendanceId: currentAttendance.id,
        latitude: currentLocation.lat,
        longitude: currentLocation.lng,
        biometricScore: data.biometricScore,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/today"] });
      setIsOnDuty(false);
    },
  });

  const handleBiometricSuccess = (score: number) => {
    if (isOnDuty) {
      clockOutMutation.mutate({ biometricScore: score });
    } else {
      clockInMutation.mutate({ biometricScore: score });
    }
  };

  const getStatusColor = () => {
    if (isOnDuty) return "bg-green-50 border-green-200";
    return "bg-gray-50 border-gray-200";
  };

  const getStatusText = () => {
    if (isOnDuty) return "On Duty";
    return "Off Duty";
  };

  const getDuration = () => {
    if (!currentAttendance?.clockInTime) return "0h 0m";
    
    const start = new Date(currentAttendance.clockInTime);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="max-w-md mx-auto bg-card min-h-screen">
      {/* Mobile App Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="text-center">
          <h2 className="text-lg font-semibold" data-testid="text-app-title">Guard Check-In</h2>
          <p className="text-sm opacity-90" data-testid="text-site-name">
            {guardProfile ? `${guardProfile.firstName} ${guardProfile.lastName}` : "Loading..."}
          </p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Current Status Card */}
        <Card className={`p-4 ${getStatusColor()}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isOnDuty ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className={`font-medium ${isOnDuty ? 'text-green-800' : 'text-gray-700'}`} data-testid="text-duty-status">
                  {getStatusText()}
                </span>
              </div>
              {currentAttendance?.clockInTime && (
                <p className={`text-sm mt-1 ${isOnDuty ? 'text-green-600' : 'text-gray-600'}`} data-testid="text-clock-in-time">
                  Checked in at {new Date(currentAttendance.clockInTime).toLocaleTimeString()}
                </p>
              )}
            </div>
            {isOnDuty && (
              <div className="text-right">
                <p className="text-xl font-bold text-green-800" data-testid="text-duration">{getDuration()}</p>
                <p className="text-xs text-green-600">Duration</p>
              </div>
            )}
          </div>
        </Card>

        {/* Location Status */}
        <Card className="bg-blue-50 border-blue-200 p-3">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800" data-testid="text-location-status">
              {currentLocation ? "Location Verified" : "Getting location..."}
            </span>
            {currentLocation && <CheckCircle className="h-4 w-4 text-green-500" />}
          </div>
          {currentLocation && (
            <p className="text-xs text-blue-600 mt-1" data-testid="text-location-details">
              Location: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
            </p>
          )}
        </Card>

        {/* Biometric Authentication Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-4" data-testid="text-action-title">
            {isOnDuty ? "Clock Out" : "Clock In"}
          </h3>
          
          <BiometricScanner
            onSuccess={handleBiometricSuccess}
            disabled={!currentLocation || clockInMutation.isPending || clockOutMutation.isPending}
          />

          {/* Emergency Contact Button */}
          <Button 
            className="w-full bg-amber-500 text-white hover:bg-amber-600" 
            variant="secondary"
            data-testid="button-emergency"
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Report Emergency
          </Button>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h4 className="font-semibold mb-3" data-testid="text-recent-activity">Today's Activity</h4>
          <div className="space-y-2">
            {todayAttendance?.map((attendance, index) => (
              <div key={attendance.id} className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${attendance.clockInTime ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-sm" data-testid={`text-activity-${index}`}>
                    {attendance.clockInTime ? "Clock In" : "Scheduled"}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground" data-testid={`text-activity-time-${index}`}>
                  {attendance.clockInTime ? new Date(attendance.clockInTime).toLocaleTimeString() : "--"}
                </span>
              </div>
            ))}
            
            {(!todayAttendance || todayAttendance.length === 0) && (
              <div className="text-center py-4 text-muted-foreground" data-testid="text-no-activity">
                No activity today
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
