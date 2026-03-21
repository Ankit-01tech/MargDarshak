import { useState, useEffect } from 'react';
import { MapPin, TrendingUp, Clock, Activity } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface ParkingZone {
  name: string;
  distance: string;
  arrivalTime: string;
  probability: number;
  trend: 'up' | 'down' | 'stable';
  historicalData: number[];
}

// 1. Mini Sparkline for Occupancy Trends
function MiniSparkline({ data }: { data: number[] }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data);
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 80;
    const y = 30 - (value / max) * 25;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="80" height="30" className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke="#0EA5E9"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 2. AI Parking Probability Visualization
function ProbabilityCircle({ value }: { value: number }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  
  const getColor = (v: number) => {
    if (v >= 80) return '#00FF88'; // High (Green)
    if (v >= 50) return '#F59E0B'; // Medium (Amber)
    return '#EF4444'; // Low (Red)
  };

  return (
    <div className="relative flex items-center justify-center">
      <svg width="80" height="80" className="transform -rotate-90">
        <circle cx="40" cy="40" r={radius} stroke="#1E293B" strokeWidth="6" fill="none" />
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke={getColor(value)}
          strokeWidth="6"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white text-sm font-bold font-mono">{value}%</span>
      </div>
    </div>
  );
}

export function ParkingPredictionView() {
  const [parkingZones, setParkingZones] = useState<ParkingZone[]>([]);
  const [loading, setLoading] = useState(true);

  // MAPPED LOCATIONS: Matching your 10 Priority Panel Orders (ORD-1001 to 1010)
  const mockHubs: ParkingZone[] = [
    { name: "Gateway Hub (Colaba)", distance: "0.4 km", arrivalTime: "3 min", probability: 95, trend: 'up', historicalData: [70, 75, 85, 90, 92, 95] },
    { name: "BKC Finance District", distance: "1.2 km", arrivalTime: "8 min", probability: 82, trend: 'stable', historicalData: [60, 65, 70, 75, 80, 82] },
    { name: "Nariman Point Hub", distance: "0.9 km", arrivalTime: "5 min", probability: 91, trend: 'up', historicalData: [50, 60, 75, 80, 88, 91] },
    { name: "Andheri Metro Zone", distance: "2.1 km", arrivalTime: "14 min", probability: 65, trend: 'stable', historicalData: [40, 45, 50, 60, 62, 65] },
    { name: "Worli Sea Face Hub", distance: "1.5 km", arrivalTime: "10 min", probability: 45, trend: 'down', historicalData: [70, 65, 60, 55, 50, 45] },
    { name: "Lower Parel Hub", distance: "0.7 km", arrivalTime: "4 min", probability: 88, trend: 'up', historicalData: [60, 65, 70, 80, 85, 88] },
    { name: "Juhu Beach Logistics", distance: "3.2 km", arrivalTime: "22 min", probability: 30, trend: 'down', historicalData: [50, 45, 40, 35, 32, 30] },
    { name: "Powai Hiranandani", distance: "1.8 km", arrivalTime: "11 min", probability: 77, trend: 'stable', historicalData: [50, 55, 60, 70, 75, 77] },
    { name: "Dadar West Station", distance: "0.5 km", arrivalTime: "2 min", probability: 98, trend: 'up', historicalData: [80, 85, 90, 95, 97, 98] },
    { name: "Vile Parle SV Road", distance: "1.4 km", arrivalTime: "9 min", probability: 55, trend: 'stable', historicalData: [40, 45, 50, 52, 53, 55] }
  ];

  useEffect(() => {
    const fetchParkingZones = async () => {
      try {
        const response = await fetch("https://margdarshak-4.onrender.com/api/parking-zones");
        const rawData = await response.json();

        if (rawData && rawData.length > 0) {
          const mappedData = rawData.map((zone: any) => ({
            name: zone.name,
            distance: zone.distance || "0.5 km",
            arrivalTime: zone.arrivalTime || "6 min",
            probability: zone.probability || (100 - (zone.occupancy || 50)),
            trend: zone.trend || "stable",
            historicalData: zone.historicalData || [50, 60, 55, 70, 65, 80],
          }));
          setParkingZones(mappedData);
        }
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchParkingZones();
  }, []);

  const displayZones = parkingZones.length > 0 ? parkingZones : mockHubs;

  const getTrendColor = (trend: string) => {
    if (trend === 'up') return 'text-[#00FF88]';
    if (trend === 'down') return 'text-red-400';
    return 'text-gray-400';
  };

  if (loading) {
    return (
      <div className="w-[360px] h-[640px] bg-[#0B0F1A] rounded-t-3xl flex flex-col items-center justify-center border-t border-white/10 mx-auto">
        <div className="w-12 h-12 border-4 border-[#0EA5E9]/20 border-t-[#0EA5E9] rounded-full animate-spin mb-4" />
        <div className="text-[#0EA5E9] animate-pulse font-mono text-[10px] tracking-widest uppercase">Predicting Hubs...</div>
      </div>
    );
  }

  return (
    <div className="w-[360px] h-[640px] bg-[#0B0F1A] rounded-t-3xl shadow-2xl overflow-hidden border-t border-white/10 mx-auto relative flex flex-col">
      {/* Visual Handle Bar */}
      <div className="flex justify-center py-3 flex-shrink-0">
        <div className="w-12 h-1.5 bg-gray-800 rounded-full" />
      </div>

      {/* Header */}
      <div className="px-6 pb-4 flex-shrink-0">
        <Badge className="bg-[#0EA5E9]/10 text-[#0EA5E9] border-[#0EA5E9]/20 font-bold uppercase text-[9px] mb-2 tracking-tighter">
          <Activity className="w-3 h-3 mr-1" /> Predictive AI Engine
        </Badge>
        <h2 className="text-white text-xl font-bold tracking-tight">Nearby Hubs</h2>
        <p className="text-gray-500 text-[11px] leading-tight">Smart availability clusters for Mumbai fleet operations.</p>
      </div>

      {/* Scrollable List */}
      <div className="px-6 space-y-4 pb-20 overflow-y-auto no-scrollbar flex-grow">
        {displayZones.map((zone) => (
          <Card
            key={zone.name}
            className="bg-[#0F1829]/60 backdrop-blur-md border-[#1E293B] hover:border-[#0EA5E9]/40 transition-all duration-300 p-4"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-[#0EA5E9]" />
                  <h4 className="text-white text-[13px] font-bold truncate">{zone.name}</h4>
                </div>
                
                <div className="flex items-center gap-3 text-gray-500 mb-4">
                  <span className="text-[10px] font-mono">{zone.distance}</span>
                  <span className="text-gray-800 text-xs">|</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span className="text-[10px] font-mono">{zone.arrivalTime}</span>
                  </div>
                  <TrendingUp className={`w-3.5 h-3.5 ${getTrendColor(zone.trend)} ml-auto`} />
                </div>
              </div>
              <div className="ml-2">
                <ProbabilityCircle value={zone.probability} />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-2">
              <span className="text-gray-600 text-[8px] uppercase font-black tracking-widest">Occupancy Trend</span>
              <MiniSparkline data={zone.historicalData} />
            </div>
          </Card>
        ))}
      </div>

      {/* Sticky Bottom Status */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0B0F1A] via-[#0B0F1A] to-transparent p-6 pointer-events-none">
        <div className="bg-[#0EA5E9]/5 border border-[#0EA5E9]/10 rounded-xl p-3 flex items-center gap-3 backdrop-blur-sm">
          <div className="w-2 h-2 rounded-full bg-[#0EA5E9] animate-pulse" />
          <p className="text-gray-400 text-[9px] font-medium uppercase tracking-tight">
            Syncing live telemetry with traffic patterns
          </p>
        </div>
      </div>
    </div>
  );
}