import { useEffect, useRef, useState } from 'react';
import { TrendingUp, Clock, Droplet, Leaf, MapPin, Navigation, Activity } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function AdminDashboard() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const [trafficData, setTrafficData] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Pointing all requests to the working Port 8080
        const [trafficRes, vehiclesRes, statsRes] = await Promise.all([
          fetch('http://localhost:8080/api/traffic'),
          fetch('http://localhost:8080/api/vehicles'),
          fetch('http://localhost:8080/api/stats')
        ]);
        
        setTrafficData(await trafficRes.json());
        
        // Sync vehicle coordinates with Mumbai center
        const vehicleData = await vehiclesRes.json();
        setVehicles(vehicleData.map((v: any, i: number) => ({
          ...v,
          lat: 19.0760 + (i * 0.012),
          lng: 72.8777 + (i * 0.008)
        })));
        
        setStats(await statsRes.json());
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!mapRef.current || vehicles.length === 0) return;

    import('leaflet').then((L) => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const map = L.map(mapRef.current!, {
        center: [19.0760, 72.8777], // Mumbai Center
        zoom: 12,
        zoomControl: false,
      });

      mapInstanceRef.current = map;
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

      vehicles.forEach((vehicle) => {
        const color = vehicle.status === 'active' ? '#0EA5E9' : vehicle.status === 'parking' ? '#F59E0B' : '#6B7280';
        const icon = L.divIcon({
          className: 'custom-vehicle-marker',
          html: `<div style="background: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color};"></div>`,
        });

        L.marker([vehicle.lat, vehicle.lng], { icon })
          .addTo(map)
          .bindPopup(`<b style="color:black">${vehicle.name}</b><br/>Status: ${vehicle.status}`);
      });
    });

    return () => { if (mapInstanceRef.current) mapInstanceRef.current.remove(); };
  }, [vehicles]);

  return (
    <div className="w-[1440px] h-[1024px] bg-[#0B0F1A] p-8 rounded-xl shadow-2xl overflow-auto border border-[#1E293B]">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-white text-3xl font-bold tracking-tight">Fleet Control Center</h1>
          <p className="text-gray-500">Live Mumbai Logistics Operations</p>
        </div>
        <Badge className="bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/20 px-4 py-2 font-mono">
          SYSTEM ONLINE: 8080
        </Badge>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
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

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2 bg-[#0F1829] border-[#1E293B] p-4">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-[#0EA5E9]" /> Real-time Fleet Map
          </h3>
          <div ref={mapRef} className="h-[450px] rounded-lg overflow-hidden bg-[#0B0F1A]" />
        </Card>

        <Card className="bg-[#0F1829] border-[#1E293B] p-4">
          <h3 className="text-white font-bold mb-4">Congestion Trends</h3>
          <ResponsiveContainer width="100%" height={450}>
            <AreaChart data={trafficData}>
              <XAxis dataKey="time" stroke="#4B5563" fontSize={10} />
              <YAxis stroke="#4B5563" fontSize={10} />
              <Tooltip contentStyle={{ background: '#0F1829', border: '1px solid #1E293B' }} />
              <Area type="monotone" dataKey="congestion" stroke="#EF4444" fill="#EF4444" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}