import { useState, useEffect, useRef } from 'react';
import { Navigation, MapPin, Clock, Activity, Loader2, CheckCircle2 } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface DriverProps {
  currentUser: { name: string } | null;
  onStatusChange: () => void;
}

export function DriverMobileApp({ currentUser, onStatusChange }: DriverProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [currentStop, setCurrentStop] = useState(0);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  // 1. DATA ENGINE: Fetching & Syncing Mumbai Hubs
  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const response = await fetch("https://margdarshak-4.onrender.com/api/deliveries");
        const data = await response.json();
        
        // Mapping 10 locations to match your Priority Panel for the demo
        const mapped = data.map((d: any, index: number) => ({
          ...d,
          lat: d.lat || 18.9220 + (index * 0.012),
          lng: d.lng || 72.8347 + (index * 0.008),
          eta: d.eta || (index + 1) * 8 + " min",
          parkingDifficulty: d.parkingDifficulty || (index % 2 === 0 ? "High" : "Medium")
        }));

        setDeliveries(mapped);
      } catch (error) {
        console.error("Uplink Error:", error);
      }
    };
    fetchDeliveries();
  }, []);

  // 2. MAP ENGINE: Full-Screen Optimization
  useEffect(() => {
    if (!mapRef.current || deliveries.length === 0 || mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      if (mapInstanceRef.current) mapInstanceRef.current.remove();

      const map = L.map(mapRef.current!, {
        center: [19.0300, 72.8400], 
        zoom: 12,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);
      mapInstanceRef.current = map;

      deliveries.forEach((stop, index) => {
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background: #0EA5E9; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; color: white; font-weight: 900; font-size: 11px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px #0EA5E9;">${index + 1}</div>`,
        });
        L.marker([stop.lat, stop.lng], { icon }).addTo(map);
      });

      // Force refresh for instant load
      setTimeout(() => {
        map.invalidateSize();
        setIsMapReady(true);
      }, 500);
    });
  }, [deliveries]);

  // 3. CONFIRM ARRIVAL: With restored Notifications & Real-Time Sync
  const handleConfirmArrival = async () => {
    const current = deliveries[currentStop];
    if (!current || !current.orderId) return;

    setIsConfirming(true);
    try {
      const response = await fetch("https://margdarshak-4.onrender.com/api/delivery/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          orderId: current.orderId,
          driverName: currentUser?.name || "Ankit Singh" 
        }),
      });

      if (response.ok) {
        // 🔥 Restoration of the Sync Notification for the demo
        alert(`✅ Order ${current.orderId} Confirmed!\n\nLocation: ${current.address}\nStatus: Dashboards Synced.`);
        
        onStatusChange(); // Trigger refresh in App.tsx (Priority Panel & Fleet Dashboard)
        const updated = deliveries.filter((d) => d.orderId !== current.orderId);
        setDeliveries(updated);
        setCurrentStop(0);
      } else {
        alert("⚠️ Server Sync Error. Check Backend.");
      }
    } catch (error) {
      alert("❌ Connection Failed. Check Network.");
    } finally {
      setIsConfirming(false);
    }
  };

  const current = deliveries[currentStop] || {};

  return (
    <div className="w-[390px] h-[844px] bg-[#0B0F1A] relative overflow-hidden rounded-[3rem] border-[8px] border-[#1E293B] mx-auto shadow-2xl">
      
      {/* 📍 Full-Screen Map: Starts from the very top */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${isMapReady ? 'opacity-100' : 'opacity-20'}`}>
        <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      </div>

      {/* Loading State Overlay */}
      {!isMapReady && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#0EA5E9] animate-spin" />
        </div>
      )}

      {/* 🛡️ Top Gradient for visual depth */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#0B0F1A]/60 to-transparent z-10 pointer-events-none" />

      {/* 🎴 Floating Order Card: Adjusted height & padding */}
      <div className="absolute bottom-6 left-0 right-0 z-30 p-4">
        <Card className="bg-[#0F1829]/95 backdrop-blur-3xl border-[#1E293B] p-4 rounded-[2.5rem] shadow-3xl">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00FF88] animate-ping" />
                <h4 className="text-white font-black text-xl tracking-tighter uppercase">
                    {current.orderId || 'Standby Mode'}
                </h4>
            </div>
            {current.orderId && (
                <Badge className="bg-[#00FF88]/10 text-[#00FF88] border-none text-[9px] font-black uppercase px-2">
                    Live Task
                </Badge>
            )}
          </div>
          
          <p className="text-gray-400 text-sm mb-6 leading-tight h-10 overflow-hidden font-medium italic">
            {current.address || 'Checking Mumbai logistics cluster for next assignment...'}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-black/40 p-5 rounded-2xl border border-white/5">
              <p className="text-gray-600 text-[9px] uppercase font-black tracking-widest mb-1">ETA</p>
              <p className="text-white text-lg font-black tracking-tight">{current.eta || '--'}</p>
            </div>
            <div className="bg-black/40 p-5 rounded-2xl border border-white/5">
              <p className="text-gray-600 text-[9px] uppercase font-black tracking-widest mb-1">Hub Risk</p>
              <p className="text-[#F59E0B] text-lg font-black tracking-tight uppercase">
                {current.parkingDifficulty || 'Low'}
              </p>
            </div>
          </div>

          <button 
            disabled={!current.orderId || isConfirming}
            onClick={handleConfirmArrival}
            className="w-full bg-[#0EA5E9] hover:bg-[#00FF88] hover:text-black text-white py-5 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-lg shadow-[#0EA5E9]/20 flex items-center justify-center gap-2 group"
          >
            {isConfirming ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
            )}
            {isConfirming ? "SYNCING..." : "CONFIRM ARRIVAL"}
          </button>
        </Card>
      </div>
    </div>
  );
}