import { useEffect, useRef, useState } from 'react';
import { TrendingUp, Clock, Droplet, Leaf, Navigation, AlertCircle, Activity } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export function AdminDashboard() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  
  const [trafficData, setTrafficData] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [stats, setStats] = useState<any>({
    onTimeDelivery: "94.2%",
    avgParkingSearch: "3.5 min",
    fuelSaved: "12.8L",
    co2Reduction: "8.4kg"
  });

  // 1. LIVE ENGINE: Data & Logs Simulation
  useEffect(() => {
    const generateInitialData = () => {
      const points = [];
      for (let i = 0; i < 8; i++) {
        points.push({
          time: `${10 + (i * 2)}:00`,
          congestion: Math.floor(Math.random() * 40) + 30
        });
      }
      setTrafficData(points);
    };
    generateInitialData();

    const logActions = [
      "ORD-1001: Approaching Gateway Hub",
      "BKC Cluster: High Congestion Alert",
      "ORD-1009: Rerouted via Worli Sea Link",
      "Parking Spot Detected: Nariman Point",
      "Fleet Efficiency: +12% optimized"
    ];

    const interval = setInterval(() => {
      const newLog = `[${new Date().toLocaleTimeString()}] ${logActions[Math.floor(Math.random() * logActions.length)]}`;
      setLogs(prev => [newLog, ...prev].slice(0, 8)); // Increased log count to fill space
      
      setTrafficData(prev => {
        const newData = [...prev.slice(1), { 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
          congestion: Math.floor(Math.random() * 40) + 30 
        }];
        return newData;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // 2. DATA SYNC: API Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const BASE_URL = "https://margdarshak-4.onrender.com";
        const [vRes, sRes] = await Promise.all([
          fetch(`${BASE_URL}/api/vehicles`),
          fetch(`${BASE_URL}/api/stats`)
        ]);
        const vData = await vRes.json();
        const sData = await sRes.json();

        setVehicles(vData.length > 0 ? vData : [
          { name: "Fleet-A1", status: 'active', lat: 19.076, lng: 72.877 },
          { name: "Fleet-B2", status: 'parking', lat: 19.030, lng: 72.850 }
        ]);
        if(sData.onTimeDelivery) setStats(sData);
      } catch (e) { console.error("API Sync Error:", e); }
    };
    fetchData();
  }, []);

  // 3. MAP ENGINE: Leaflet Fixes
  useEffect(() => {
    if (!mapRef.current) return;
    const initMap = async () => {
      const L = await import('leaflet');
      if (mapInstanceRef.current) mapInstanceRef.current.remove();

      const map = L.map(mapRef.current!, {
        center: [19.0760, 72.8777],
        zoom: 12,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);
      mapInstanceRef.current = map;

      vehicles.forEach((v) => {
        const color = v.status === 'active' ? '#00FF88' : '#F59E0B';
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 15px ${color};"></div>`
        });
        L.marker([v.lat, v.lng], { icon }).addTo(map);
      });
      setTimeout(() => map.invalidateSize(), 500);
    };
    initMap();
  }, [vehicles]);

  return (
    <div className="w-full max-w-[1440px] h-screen bg-[#0B0F1A] p-8 overflow-auto mx-auto border border-[#1E293B] no-scrollbar">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-white text-3xl font-black tracking-tighter uppercase">Fleet Control</h1>
            <Badge className="bg-red-500/10 text-red-500 border-red-500/20 animate-pulse font-black px-3 py-1 text-[10px]">
              <Activity className="w-3 h-3 mr-1 inline" /> LIVE TELEMETRY
            </Badge>
          </div>
          <p className="text-gray-500 text-sm font-medium">Global Logistics Gateway • Mumbai Sector 01</p>
        </div>
        <div className="flex gap-4">
            <div className="text-right mr-4 hidden md:block">
                <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">Network Status</p>
                <p className="text-[#00FF88] text-xs font-mono">ENCRYPTED • 8080</p>
            </div>
            <Badge className="bg-[#0F1829] text-gray-400 border-[#1E293B] px-4 py-2 font-mono h-fit">
                {new Date().toLocaleDateString('en-IN')}
            </Badge>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'On-Time Rate', val: stats.onTimeDelivery, icon: TrendingUp, color: 'text-[#0EA5E9]' },
          { label: 'Avg Search Time', val: stats.avgParkingSearch, icon: Clock, color: 'text-[#F59E0B]' },
          { label: 'Fuel Savings', val: stats.fuelSaved, icon: Droplet, color: 'text-[#6366F1]' },
          { label: 'CO2 Reduction', val: stats.co2Reduction, icon: Leaf, color: 'text-[#00FF88]' }
        ].map((kpi, i) => (
          <Card key={i} className="bg-[#0F1829] border-[#1E293B] p-5 relative overflow-hidden group hover:border-[#334155] transition-all">
            <div className="flex justify-between items-start z-10 relative">
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{kpi.label}</p>
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
            <p className="text-white text-3xl font-bold mt-2 font-mono z-10 relative">{kpi.val}</p>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Map Display (Primary Focus) */}
        <Card className="lg:col-span-2 bg-[#0F1829] border-[#1E293B] p-4 relative">
          <div className="absolute top-8 right-8 z-[50] space-y-2">
            <div className="bg-black/80 backdrop-blur-md p-3 rounded-xl border border-white/10 shadow-2xl">
                <p className="text-[9px] text-gray-500 font-black mb-2 uppercase tracking-widest">Tracking Assets</p>
                <div className="space-y-2">
                    {vehicles.slice(0, 2).map((v, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#00FF88] shadow-[0_0_8px_#00FF88]" />
                            <span className="text-white text-[10px] font-mono uppercase">{v.name}</span>
                        </div>
                    ))}
                </div>
            </div>
          </div>
          <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
            <Navigation className="w-4 h-4 text-[#0EA5E9]" /> Fleet Geospatial View
          </h3>
          {/* Map height is fixed to match the side column */}
          <div ref={mapRef} className="h-[680px] rounded-lg overflow-hidden brightness-100 contrast-100" />
        </Card>

        {/* Side Column (Balanced Heights) */}
        <div className="flex flex-col gap-6 h-[680px]">
            {/* Congestion Card */}
            <Card className="bg-[#0F1829] border-[#1E293B] p-5 flex flex-col flex-1">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                    <Activity className="w-4 h-4 text-red-500" /> Congestion Trends
                </h3>
                <div className="flex-grow w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trafficData}>
                            <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                            <Tooltip contentStyle={{ background: '#0F1829', border: '1px solid #1E293B', fontSize: '10px' }} />
                            <Area type="monotone" dataKey="congestion" stroke="#EF4444" fill="url(#chartGradient)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* Activity Logs Card */}
            <Card className="bg-[#0F1829] border-[#1E293B] p-5 flex flex-col flex-1">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
                        <AlertCircle className="w-4 h-4 text-[#F59E0B]" /> Activity Logs
                    </h3>
                    <div className="w-2 h-2 rounded-full bg-[#00FF88] animate-ping" />
                </div>
                <div className="space-y-3 overflow-y-auto no-scrollbar">
                    {logs.map((log, i) => (
                        <div key={i} className="text-[10px] font-mono text-gray-500 border-l-2 border-[#1E293B] pl-4 py-1.5 hover:text-gray-300 transition-colors">
                            {log}
                        </div>
                    ))}
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
}