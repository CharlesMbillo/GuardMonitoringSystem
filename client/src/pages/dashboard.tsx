import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import NavigationHeader from "@/components/navigation-header";
import GuardApp from "./guard-app";
import SupervisorDashboard from "./supervisor-dashboard";
import HRPortal from "./hr-portal";
import AdminPanel from "./admin-panel";

type TabType = "guard" | "supervisor" | "hr" | "admin";

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("guard");

  // Determine available tabs based on user role
  const getAvailableTabs = () => {
    const tabs = [];
    
    if (user?.role === "guard" || user?.role === "supervisor" || user?.role === "hr" || user?.role === "admin") {
      tabs.push({ id: "guard", label: "Guard App", icon: "fas fa-mobile-alt" });
    }
    
    if (user?.role === "supervisor" || user?.role === "hr" || user?.role === "admin") {
      tabs.push({ id: "supervisor", label: "Supervisor Dashboard", icon: "fas fa-chart-line" });
    }
    
    if (user?.role === "hr" || user?.role === "admin") {
      tabs.push({ id: "hr", label: "HR Portal", icon: "fas fa-users-cog" });
    }
    
    if (user?.role === "admin") {
      tabs.push({ id: "admin", label: "Admin", icon: "fas fa-cog" });
    }
    
    return tabs;
  };

  const availableTabs = getAvailableTabs();

  // Set default active tab based on user role
  if (availableTabs.length > 0 && !availableTabs.find(tab => tab.id === activeTab)) {
    setActiveTab(availableTabs[0].id as TabType);
  }

  const renderContent = () => {
    switch (activeTab) {
      case "guard":
        return <GuardApp />;
      case "supervisor":
        return <SupervisorDashboard />;
      case "hr":
        return <HRPortal />;
      case "admin":
        return <AdminPanel />;
      default:
        return <GuardApp />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        availableTabs={availableTabs}
      />
      
      {renderContent()}
    </div>
  );
}
