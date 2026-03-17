import { useState, useEffect } from "react";
import { DriverMobileApp } from "./components/DriverMobileApp";
import { DeliveryPriorityPanel } from "./components/DeliveryPriorityPanel";
import { ParkingPredictionView } from "./components/ParkingPredictionView";
import { AdminDashboard } from "./components/AdminDashboard";
import { PresentationFrame } from "./components/PresentationFrame";
import { WeatherClimateView } from "./components/WeatherClimateView";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs";
import {
  Smartphone,
  Tablet,
  Monitor,
  Presentation,
  Map,
  CloudSun,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { Button } from "./components/ui/button";
import { AuthModal, type User } from "./components/AuthModal";
import logo from "figma:asset/dbed89e4ed97b7b89750f12d42820319147fd246.png";

export default function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // CHECK LOGIN SESSION
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    } else {
      setIsAuthModalOpen(true);
    }
  }, []);

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    setIsAuthModalOpen(true);
  };

  // UPDATED: Points to your new live deployment (margdarshak-4)
  const downloadCSV = () => {
    window.open(
      "https://margdarshak-4.onrender.com/api/download-activity-csv",
      "_blank"
    );
  };

  // Triggers a refresh across all dashboard components
  const handleDataChange = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="relative min-h-screen bg-[#0B0F1A] dark">
      <AuthModal
        isOpen={isAuthModalOpen || !currentUser}
        onClose={() => currentUser && setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthModalOpen(false);
        }}
      />

      <div className={`min-h-screen bg-gradient-to-br from-[#0B0F1A] via-[#0D1321] to-[#0B0F1A] p-8 transition-all duration-500 ${
          !currentUser ? "blur-xl scale-95 pointer-events-none" : "blur-0 scale-100"
        }`}>
        <div className="max-w-[2000px] mx-auto">
          {/* TOP NAVIGATION BAR */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1E293B]/50">
            <div className="relative h-20 w-64">
              <img src={logo} alt="Marg Darshak" className="h-full w-full object-contain object-left" />
            </div>

            <div className="flex items-center gap-3">
              {currentUser && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-gray-300">
                    <UserIcon className="w-4 h-4 text-[#0EA5E9]" />
                    <span className="font-medium tracking-tight">Operator: {currentUser.name}</span>
                  </div>
                  <Button onClick={downloadCSV} className="bg-green-600 hover:bg-green-700 text-white shadow-[0_0_15px_rgba(22,163,74,0.3)]">
                    Export Activity CSV
                  </Button>
                  <Button variant="outline" onClick={handleLogout} className="bg-transparent border-red-500/50 text-red-500 hover:bg-red-500/10">
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-white text-4xl mb-2 font-bold tracking-tight">Smart Parking & Micro Route Optimizer</h1>
            <p className="text-gray-400 text-lg font-medium tracking-wide">Beyond Navigation. Towards Intelligence.</p>
          </div>

          <Tabs defaultValue="presentation" className="w-full">
            <TabsList className="grid w-full max-w-[1400px] mx-auto grid-cols-6 mb-8 bg-[#0F1829]/80 border border-[#1E293B] backdrop-blur-md">
              <TabsTrigger value="presentation"><Presentation className="w-4 h-4 mr-2" />Intro</TabsTrigger>
              <TabsTrigger value="mobile"><Smartphone className="w-4 h-4 mr-2" />Driver App</TabsTrigger>
              <TabsTrigger value="tablet"><Tablet className="w-4 h-4 mr-2" />Priority Panel</TabsTrigger>
              <TabsTrigger value="parking"><Map className="w-4 h-4 mr-2" />Parking View</TabsTrigger>
              <TabsTrigger value="weather"><CloudSun className="w-4 h-4 mr-2" />Weather</TabsTrigger>
              <TabsTrigger value="admin"><Monitor className="w-4 h-4 mr-2" />Fleet Dashboard</TabsTrigger>
            </TabsList>

            <TabsContent value="presentation" className="flex justify-center">
              <div className="transform scale-[0.65] origin-top"><PresentationFrame key={`pres-${refreshKey}`} /></div>
            </TabsContent>

            <TabsContent value="mobile" className="flex justify-center">
              <DriverMobileApp currentUser={currentUser} onStatusChange={handleDataChange} />
            </TabsContent>

            <TabsContent value="tablet" className="flex justify-center">
              <div className="transform scale-[0.85] origin-top"><DeliveryPriorityPanel refreshKey={refreshKey} /></div>
            </TabsContent>

            <TabsContent value="parking" className="flex justify-center">
              <ParkingPredictionView key={`park-${refreshKey}`} />
            </TabsContent>

            <TabsContent value="weather" className="flex justify-center">
              <div className="transform scale-[0.75] origin-top"><WeatherClimateView refreshKey={refreshKey} /></div>
            </TabsContent>

            <TabsContent value="admin" className="flex justify-center">
              <div className="transform scale-[0.75] origin-top"><AdminDashboard key={`admin-${refreshKey}`} /></div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}