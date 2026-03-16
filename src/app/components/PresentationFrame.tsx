import { useEffect, useRef, useState } from 'react';
// @ts-ignore
import logo from "../../assets/MargDarshakLogo.png";
import { Zap, MapPin, TrendingUp, CloudSun, Clock, Activity, Navigation, Route } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Path } from 'leaflet';

interface DashboardStats {
  onTimeDelivery: string;
  avgParkingSearch: string;
  fuelSaved: string;
  co2Reduction: string;
  deliveriesToday: number;
}

export function PresentationFrame() {
  // 1. Define all missing variables identified in the error log
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://margdarshak-3.onrender.com/api/stats');
        const data = await response.json();
        setStats(data.stats);
        setVehicles(data.vehicles || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    import('leaflet').then((L) => {
      const map = L.map(mapRef.current!, {
        center: [19.0760, 72.8777],
        zoom: 11,
        zoomControl: false,
      });
      mapInstanceRef.current = map;
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);
    });
  }, []);

  return (
    <div className="w-[1920px] h-[1080px] bg-gradient-to-br from-[#0B0F1A] via-[#0D1321] to-[#0B0F1A] p-12 rounded-xl shadow-2xl relative overflow-hidden">
      <div className="relative z-10">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            < Route className="w-12 h-12 text-[Gold]" />
            <h1 className="text-6xl text-white font-bold tracking-tight">Marg Darshak Optimizer</h1>
          </div>
          <p className="text-2xl text-gray-300 mb-6 italic">Beyond Navigation. Towards Intelligence.</p>
        </div>

        <div className="grid grid-cols-12 gap-8 mb-8">
          {/* DRIVER APP SECTION */}
          <div className="col-span-3">
            <Card className="bg-[#0F1829]/80 backdrop-blur-md border-[#1E293B] h-full overflow-hidden p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-[#D4AF37]" />
                  <h3 className="text-white text-xl font-bold">Driver App</h3>
                </div>
                <Badge className="bg-[#00FF88]/20 text-[#00FF88] border-none text-[10px] animate-pulse">LIVE</Badge>
              </div>
              <div className="bg-[#0B0F1A] rounded-[2.5rem] p-3 border-[6px] border-[#1E293B] shadow-2xl relative">
                <div className="aspect-[9/18.5] bg-[#0F1829] rounded-[2rem] relative overflow-hidden flex flex-col items-center justify-center">
                  <Navigation className="w-12 h-12 text-[#D4AF37] animate-bounce" />
                  <span className="text-[#D4AF37] text-xs font-mono mt-4 uppercase">Route Active</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="col-span-6 space-y-4">
            {/* USP 1: PARKING */}
            <Card className="bg-gradient-to-r from-[#D4AF37]/10 to-transparent border-[#D4AF37]/30 p-8 flex justify-between items-center">
              <div className="flex items-center gap-6">
                <MapPin className="w-10 h-10 text-[#D4AF37]" />
                <div>
                  <h3 className="text-white text-2xl font-bold">Predictive Parking Intelligence</h3>
                  <p className="text-gray-400">AI availability forecasts 15 mins ahead.</p>
                </div>
              </div>
              <div className="text-[#D4AF37] text-5xl font-bold">85%</div>
            </Card>

            {/* USP 2: PRIORITY */}
            <Card className="bg-gradient-to-r from-[#00FF88]/10 to-transparent border-[#00FF88]/30 p-8 flex justify-between items-center">
              <div className="flex items-center gap-6">
                <TrendingUp className="w-10 h-10 text-[#00FF88]" />
                <div>
                  <h3 className="text-white text-2xl font-bold">Dynamic Delivery Prioritization</h3>
                  <p className="text-gray-400">Continuous re-ranking based on live traffic.</p>
                </div>
              </div>
              <div className="text-[#00FF88] text-5xl font-bold">{stats?.onTimeDelivery || '94%'}</div>
            </Card>

            {/* USP 3: WEATHER */}
            <Card className="bg-gradient-to-r from-[#0EA5E9]/10 to-transparent border-[#0EA5E9]/30 p-8 flex justify-between items-center">
              <div className="flex items-center gap-6">
                <CloudSun className="w-10 h-10 text-[#0EA5E9]" />
                <div>
                  <h3 className="text-white text-2xl font-bold">Hyper-local Weather Adaptation</h3>
                  <p className="text-gray-400">Route recalibration based on precipitation data.</p>
                </div>
              </div>
              <div className="text-[#0EA5E9] text-5xl font-bold">LIVE</div>
            </Card>
          </div>

          <div className="col-span-3">
            <Card className="bg-[#0F1829]/80 backdrop-blur-md border-[#1E293B] h-full p-6">
              <h3 className="text-white text-xl mb-6">Fleet Status</h3>
              <div className="space-y-4 mb-6">
                <div className="bg-[#0B0F1A] rounded-xl p-4 border border-[#1E293B] flex justify-between">
                  <span className="text-gray-400">Vehicles</span>
                  <span className="text-[#D4AF37] font-bold">{vehicles.length}</span>
                </div>
                <div className="bg-[#0B0F1A] rounded-xl p-4 border border-[#1E293B] flex justify-between">
                  <span className="text-gray-400">Today</span>
                  <span className="text-[#00FF88] font-bold">{stats?.deliveriesToday || 87}</span>
                </div>
              </div>
              <div className="bg-[#0B0F1A] rounded-2xl overflow-hidden border border-[#1E293B] h-[240px]">
                <div ref={mapRef} className="h-full w-full" />
              </div>
            </Card>
          </div>
        </div>

        {/* Bottom Metrics Bar - Resolving 'stats' and 'item' errors */}
        <div className="grid grid-cols-5 gap-6">
          {[
            { icon: Clock, val: stats?.avgParkingSearch || "2.4m", label: "Avg Search", color: "#D4AF37" },
            { icon: TrendingUp, val: stats?.onTimeDelivery || "94%", label: "Reliability", color: "#00FF88" },
            { icon: MapPin, val: stats?.deliveriesToday || "87", label: "Deliveries", color: "#F59E0B" },
            { icon: CloudSun, val: "31°C", label: "Mumbai Weather", color: "#0EA5E9" },
            { icon: Activity, val: stats?.fuelSaved || "18%", label: "Efficiency", color: "#D4AF37" }
          ].map((item, i) => (
            <Card key={i} className="bg-[#0F1829]/80 backdrop-blur-md border-[#1E293B] p-6 text-center">
              <item.icon className="w-10 h-10 mx-auto mb-3" style={{ color: item.color }} />
              <div className="text-4xl text-white font-bold mb-1">{item.val}</div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">{item.label}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}