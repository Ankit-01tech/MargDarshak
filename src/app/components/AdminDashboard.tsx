import { useEffect, useRef, useState } from 'react';
import { TrendingUp, Clock, Droplet, Leaf, Navigation } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Note: We import the heatmap plugin dynamically inside the useEffect 
// to ensure it has access to the Leaflet global object (L).

export function AdminDashboard() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const heatLayerRef = useRef<any>(null); // Ref to track the heatmap layer

  const [trafficData, setTrafficData] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [movingVehicles, setMovingVehicles] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  // 1. Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const BASE_URL = "https://margdarshak-4.onrender.com";

        const [trafficRes, vehiclesRes, statsRes] = await Promise.all([
          fetch(`${BASE_URL}/api/traffic`),
          fetch(`${BASE_URL}/api/vehicles`),
          fetch(`${BASE_URL}/api/stats`)
        ]);

        const trafficJson = await trafficRes.json();
        const vehicleData = await vehiclesRes.json();
        const statsJson = await statsRes.json();

        setTrafficData(trafficJson);
        setStats(statsJson);
        setMovingVehicles(vehicleData);

        setVehicles(
          vehicleData.map((v: any, i: number) => ({
            ...v,
            lat: 19.076 + i * 0.01,
            lng: 72.8777 + i * 0.01,
          }))
        );
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, []);

  // 2. Movement Interval
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles((prev) =>
        prev.map((v) => ({
          ...v,
          lat: v.lat + (Math.random() - 0.5) * 0.002,
          lng: v.lng + (Math.random() - 0.5) * 0.002,
        }))
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // 3. Map, Markers, and Heatmap Initialization
  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = async () => {
      const L = await import('leaflet');
      // @ts-ignore - Dynamically importing the heatmap plugin
      await import('leaflet.heat');

      // Initialize map instance only once
      if (!mapInstanceRef.current) {
        const map = L.map(mapRef.current!, {
          center: [19.0760, 72.8777],
          zoom: 12,
          zoomControl: false,
        });
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; CartoDB'
        }).addTo(map);
        
        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;

      // --- HEATMAP LOGIC ---
      // Remove old heatmap layer if it exists
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }

      if (trafficData.length > 0) {
        const heatPoints = trafficData.map((t) => [
          19.076 + Math.random() * 0.05,
          72.8777 + Math.random() * 0.05,
          t.congestion || 0.5
        ]);

        // Accessing .heatLayer via (L as any) since it's a plugin
        heatLayerRef.current = (L as any).heatLayer(heatPoints, {
          radius: 25,
          blur: 20,
          maxZoom: 17,
        }).addTo(map);
      }

      // --- VEHICLE MARKERS LOGIC ---
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      vehicles.forEach((vehicle) => {
        const color = vehicle.status === 'active' ? '#00FF88' : vehicle.status === 'parking' ? '#F59E0B' : '#6B7280';
        const icon = L.divIcon({
          className: 'custom-vehicle-marker',
          html: `<div style="background: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 12px ${color};"></div>`,
        });

        const marker = L.marker([vehicle.lat, vehicle.lng], { icon })
          .addTo(map)
          .bindPopup(`<b style="color:black">${vehicle.name}</b><br/>Status: ${vehicle.status}`);
        
        markersRef.current.push(marker);
      });
    };

    initMap();
  }, [vehicles, trafficData]); 

  return (
    <div className="w-full max-w-[1440px] h-screen bg-[#0B0F1A] p-8 rounded-xl shadow-2xl overflow-auto border border-[#1E293B] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-white text-3xl font-bold tracking-tight">Fleet Control Center</h1>
          <p className="text-gray-400">Live Mumbai Logistics & Traffic Heatmap</p>
        </div>
        <Badge className="bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/20 px-4 py-2 font-mono">
          SYSTEM ONLINE: 8080
        </Badge>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'On-Time Rate', val: stats?.onTimeDelivery, icon: TrendingUp, color: 'text-[#0EA5E9]' },
          { label: 'Avg Search Time', val: stats?.avgParkingSearch, icon: Clock, color: 'text-[#F59E0B]' },
          { label: 'Fuel Savings', val: stats?.fuelSaved, icon: Droplet, color: 'text-[#6366F1]' },
          { label: 'CO2 Reduction', val: stats?.co2Reduction, icon: Leaf, color: 'text-[#00FF88]' }
        ].map((kpi, i) => (
          <Card key={i} className="bg-[#0F1829] border-[#1E293B] p-5">
            <div className="flex justify-between items-start">
              <p className="text-gray-500 text-xs font-bold uppercase">{kpi.label}</p>
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
            <p className="text-white text-3xl font-bold mt-2">{kpi.val || '0.0%'}</p>
          </Card>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-[#0F1829] border-[#1E293B] p-4">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-[#0EA5E9]" /> Real-time Fleet Map & Congestion
          </h3>
          <div ref={mapRef} className="h-[500px] rounded-lg overflow-hidden bg-[#0B0F1A] z-0" />
        </Card>

        <Card className="bg-[#0F1829] border-[#1E293B] p-4">
          <h3 className="text-white font-bold mb-4">Congestion Trends</h3>
          <div className="h-[500px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData}>
                <XAxis dataKey="time" stroke="#4B5563" fontSize={10} />
                <YAxis stroke="#4B5563" fontSize={10} />
                <Tooltip 
                  contentStyle={{ background: '#0F1829', border: '1px solid #1E293B', color: '#fff' }} 
                  itemStyle={{ color: '#EF4444' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="congestion" 
                  stroke="#EF4444" 
                  fill="#EF4444" 
                  fillOpacity={0.1} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}