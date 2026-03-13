import { useState, useEffect, useRef } from 'react';
import { Navigation, MapPin, Clock, Circle } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import logo from "figma:asset/dbed89e4ed97b7b89750f12d42820319147fd246.png";

export function DriverMobileApp() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [currentStop, setCurrentStop] = useState(0);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        // Calling your actual backend endpoint
        // Change this line:
const response = await fetch('http://localhost:8080/api/deliveries');
        const data = await response.json();

        // Mapping your mockData.js fields to the UI
        const mapped = data.map((d: any, index: number) => ({
          ...d,
          id: index + 1,
          city: "Mumbai, MH",
          // Syncing coordinates to Mumbai area
          lat: 19.0760 + (index * 0.005), 
          lng: 72.8777 + (index * 0.005),
          eta: (index * 10 + 5) + " min",
        }));

        setDeliveries(mapped);
        setLoading(false);
      } catch (error) {
        console.error('Fetch error:', error);
        setLoading(false);
      }
    };
    fetchDeliveries();
  }, []);

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
          html: `<div style="background: #0EA5E9; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; color: white; font-size: 10px; display: flex; align-items: center; justify-content: center;">${index + 1}</div>`,
        });
        L.marker([stop.lat, stop.lng], { icon }).addTo(map);
      });
    });
  }, [deliveries]);

  if (loading) return <div className="p-10 text-white">Connecting to Fleet...</div>;

  const current = deliveries[currentStop] || {};

  return (
    <div className="w-[390px] h-[844px] bg-[#0B0F1A] relative overflow-hidden rounded-2xl border border-[#1E293B] mx-auto">
      <div className="absolute top-0 left-0 right-0 z-30 bg-[#0B0F1A]/90 px-4 py-3 border-b border-[#1E293B]/50 flex items-center">
         <img src={logo} alt="Logo" className="h-16 w-auto" />
      </div>
 
      <div className="absolute inset-0 z-0">
        <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      </div>
      <div className="absolute bottom-0 left-0 right-0 z-30 p-4">
        <Card className="bg-[#0F1829]/95 backdrop-blur-xl border-[#1E293B] p-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-white font-bold">{current.orderId || 'ORD-UNKNOWN'}</h4>
            <Badge className="bg-[#00FF88]/10 text-[#00FF88] border-none uppercase text-[10px]">On Track</Badge>
          </div>
          <p className="text-gray-400 text-xs mb-4">{current.address}</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-[#0B0F1A] p-2 rounded-lg border border-[#1E293B]">
              <p className="text-gray-500 text-[10px]">ETA</p>
              <p className="text-white text-sm font-bold">{current.eta}</p>
            </div>
            <div className="bg-[#0B0F1A] p-2 rounded-lg border border-[#1E293B]">
              <p className="text-gray-500 text-[10px]">DIFFICULTY</p>
              <p className="text-[#F59E0B] text-sm font-bold uppercase">{current.parkingDifficulty}</p>
            </div>
          </div>
          <button 
            onClick={() => setCurrentStop((prev) => (prev + 1) % deliveries.length)}
            className="w-full bg-[#0EA5E9] text-white py-3 rounded-xl font-bold text-sm"
          >
            CONFIRM ARRIVAL
          </button>
        </Card>
      </div>
    </div>
  );
}