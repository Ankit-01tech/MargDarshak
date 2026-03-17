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

// 3. AI Parking Probability Visualization
function ProbabilityCircle({ value }: { value: number }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  
  // Dynamic color based on probability
  const getColor = (v: number) => {
    if (v >= 70) return '#00FF88'; // High probability (Green)
    if (v >= 40) return '#F59E0B'; // Medium probability (Amber)
    return '#EF4444'; // Low probability (Red)
  };

  return (
    <div className="relative flex items-center justify-center">
      <svg width="80" height="80" className="transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="#1E293B"
          strokeWidth="6"
          fill="none"
        />
        {/* Progress Circle */}
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
        <span className="text-white text-sm font-bold font-mono tracking-tighter">
          {value}%
        </span>
      </div>
    </div>
  );
}

export function ParkingPredictionView() {
  const [parkingZones, setParkingZones] = useState<ParkingZone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParkingZones = async () => {
      try {
        const response = await fetch(
          "https://margdarshak-4.onrender.com/api/parking-zones"
        );
        const rawData = await response.json();

        const mappedData = rawData.map((zone: any) => ({
          name: zone.name,
          distance: zone.distance || "0.4 km",
          arrivalTime: zone.arrivalTime || "4 min",
          probability: zone.probability || (100 - zone.occupancy),
          trend: zone.trend || "stable",
          historicalData: zone.historicalData || [60, 70, 65, 80, 75, 90],
        }));

        setParkingZones(mappedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching parking zones:", error);
        setLoading(false);
      }
    };

    fetchParkingZones();
  }, []);

  if (loading) {
    return (
      <div className="w-[360px] h-[640px] bg-[#0B0F1A] rounded-t-3xl shadow-2xl flex flex-col items-center justify-center border-t border-white/10">
        <div className="w-12 h-12 border-4 border-[#0EA5E9]/20 border-t-[#0EA5E9] rounded-full animate-spin mb-4" />
        <div className="text-[#0EA5E9] animate-pulse font-mono text-[10px] tracking-widest uppercase">
          Analyzing Mumbai Hubs...
        </div>
      </div>
    );
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-[#00FF88]';
      case 'down': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="w-[360px] h-[640px] bg-[#0B0F1A] rounded-t-3xl shadow-2xl overflow-hidden border-t border-white/10 mx-auto relative">
      {/* Visual Handle Bar */}
      <div className="flex justify-center py-3">
        <div className="w-12 h-1.5 bg-gray-800 rounded-full" />
      </div>

      {/* Header */}
      <div className="px-6 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge className="bg-[#0EA5E9]/10 text-[#0EA5E9] border-[#0EA5E9]/20 font-bold uppercase text-[9px] tracking-tighter">
            <Activity className="w-3 h-3 mr-1" />
            Predictive AI Engine
          </Badge>
        </div>
        <h2 className="text-white text-xl font-bold tracking-tight">Nearby Hubs</h2>
        <p className="text-gray-500 text-[11px] mt-1 leading-tight">
          AI-driven availability prediction for Mumbai logistics clusters.
        </p>
      </div>

      {/* Parking Zones List */}
      <div className="px-6 space-y-4 pb-24 h-[460px] overflow-y-auto scrollbar-hide">
        {parkingZones.map((zone) => (
          <Card
            key={zone.name}
            className="bg-[#0F1829]/60 backdrop-blur-md border-[#1E293B] hover:border-[#0EA5E9]/40 transition-all duration-300 overflow-hidden"
          >
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-3.5 h-3.5 text-[#0EA5E9]" />
                    <h4 className="text-white text-[13px] font-bold truncate">{zone.name}</h4>
                  </div>
                  
                  <div className="flex items-center gap-3 text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-mono tracking-tighter">{zone.distance}</span>
                    </div>
                    <span className="text-gray-800 text-xs">|</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span className="text-[10px] font-mono tracking-tighter">{zone.arrivalTime}</span>
                    </div>
                    <TrendingUp className={`w-3.5 h-3.5 ${getTrendColor(zone.trend)} ml-auto`} />
                  </div>
                </div>

                {/* AI Probability Circle Injected Here */}
                <div className="ml-2">
                  <ProbabilityCircle value={zone.probability} />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-2">
                <span className="text-gray-600 text-[8px] uppercase font-black tracking-widest">Occupancy Trend</span>
                <MiniSparkline data={zone.historicalData} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0B0F1A] via-[#0B0F1A] to-transparent p-6">
        <div className="bg-[#0EA5E9]/5 border border-[#0EA5E9]/10 rounded-xl p-3 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#0EA5E9] animate-pulse" />
          <p className="text-gray-400 text-[9px] font-medium uppercase tracking-tight">
            Syncing live telemetry with traffic patterns
          </p>
        </div>
      </div>
    </div>
  );
}