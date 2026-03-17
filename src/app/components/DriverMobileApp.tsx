import { useState, useEffect, useRef } from 'react';
import { Navigation, MapPin, Clock, Circle } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import logo from "figma:asset/dbed89e4ed97b7b89750f12d42820319147fd246.png";

interface DriverProps {
  currentUser: { name: string } | null;
  onStatusChange: () => void;
}

export function DriverMobileApp({ currentUser, onStatusChange }: DriverProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [currentStop, setCurrentStop] = useState(0);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // FETCH DELIVERIES
  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const response = await fetch("https://margdarshak-4.onrender.com/api/deliveries");
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();

        const mapped = data.map((d: any, index: number) => ({
          ...d,
          id: index + 1,
          city: "Mumbai, MH",
          lat: d.lat || 19.076 + index * 0.005,
          lng: d.lng || 72.8777 + index * 0.005,
          eta: d.eta || index * 10 + 5 + " min",
        }));

        setDeliveries(mapped);
        setLoading(false);
      } catch (error) {
        console.error("Fetch error:", error);
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, []);

  // MAP LOGIC
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current || deliveries.length === 0) return;

    import('leaflet').then((L) => {
      if (mapInstanceRef.current) return;

      const map = L.map(mapRef.current!, {
        center: [19.0760, 72.8777], 
        zoom: 13,
        zoomControl: false,
      });

      mapInstanceRef.current = map;
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

      deliveries.forEach((stop, index) => {
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background: #0EA5E9; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; color: white; font-weight: bold; font-size: 12px; display: flex; align-items: center; justify-content: center;">${index + 1}</div>`,
        });
        L.marker([stop.lat, stop.lng], { icon }).addTo(map);
      });
    });
  }, [deliveries]);

  // CONFIRM ARRIVAL ACTION
  const handleConfirmArrival = async () => {
    const current = deliveries[currentStop];
    if (!current || !current.orderId) {
        alert("No active order to confirm.");
        return;
    }

    try {
      console.log("Attempting to confirm:", current.orderId);
      
      const response = await fetch("https://margdarshak-4.onrender.com/api/delivery/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          orderId: current.orderId,
          driverName: currentUser?.name || "Ankit" 
        }),
      });

      if (response.ok) {
        console.log("Confirmation Success!");
        onStatusChange(); // Tell App.tsx to refresh all tabs

        const updated = deliveries.filter((d) => d.orderId !== current.orderId);
        setDeliveries(updated);
        setCurrentStop(0);
        
        alert(`Order ${current.orderId} Confirmed. Dashboards updated!`);
      } else {
        const err = await response.json();
        alert(`Server Error: ${err.error || "Update failed"}`);
      }
    } catch (error) {
      console.error("Connection Error:", error);
      alert("Network Error: Could not connect to backend.");
    }
  };

  if (loading) return <div className="p-10 text-white animate-pulse">Syncing with Fleet Center...</div>;

  const current = deliveries[currentStop] || {};

  return (
    <div className="w-[390px] h-[844px] bg-[#0B0F1A] relative overflow-hidden rounded-[3rem] border-[8px] border-[#1E293B] mx-auto shadow-2xl">
      <div className="absolute top-0 left-0 right-0 z-30 bg-[#0B0F1A]/80 backdrop-blur-lg px-6 py-8 border-b border-[#1E293B]/50 flex items-center justify-center">
         <img src={logo} alt="Logo" className="h-10 w-auto" />
      </div>
 
      <div className="absolute inset-0 z-0">
        <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      </div>

      <div className="absolute bottom-10 left-0 right-0 z-30 p-4">
        <Card className="bg-[#0F1829]/95 backdrop-blur-2xl border-[#1E293B] p-6 rounded-[2rem]">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-white font-bold text-lg">{current.orderId || 'STANDBY'}</h4>
            {current.orderId && <Badge className="bg-[#00FF88]/20 text-[#00FF88] border-none text-[10px]">LIVE</Badge>}
          </div>
          <p className="text-gray-400 text-sm mb-6">{current.address || 'Waiting for new orders...'}</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
              <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">ETA</p>
              <p className="text-white text-base font-black tracking-tight">{current.eta || '--'}</p>
            </div>
            <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
              <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">Difficulty</p>
              <p className="text-[#F59E0B] text-base font-black tracking-tight">{current.parkingDifficulty || '--'}</p>
            </div>
          </div>
          <button 
            disabled={!current.orderId}
            onClick={handleConfirmArrival}
            className="w-full bg-[#0EA5E9] hover:bg-[#0284C7] disabled:bg-gray-800 text-white py-4 rounded-2xl font-black text-sm transition-all active:scale-95"
          >
            CONFIRM ARRIVAL
          </button>
        </Card>
      </div>
    </div>
  );
}