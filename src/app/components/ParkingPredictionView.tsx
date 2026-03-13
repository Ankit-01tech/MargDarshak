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

export function ParkingPredictionView() {
  const [parkingZones, setParkingZones] = useState<ParkingZone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParkingZones = async () => {
      try {
        // Sync with your verified Port 8080
        const response = await fetch('http://localhost:8080/api/parking-zones');
        const rawData = await response.json();
        
        // Map backend fields to UI fields
        const mappedData = rawData.map((zone: any) => ({
          name: zone.name,
          distance: zone.distance || "0.4 km",
          arrivalTime: zone.arrivalTime || "4 min",
          // Calculate probability based on occupancy
          probability: zone.probability || (100 - zone.occupancy), 
          trend: zone.trend || 'stable',
          historicalData: zone.historicalData || [60, 70, 65, 80, 75, 90]
        }));

        setParkingZones(mappedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching parking zones:', error);
        setLoading(false);
      }
    };
    fetchParkingZones();
  }, []);

  if (loading) {
    return (
      <div className="w-[360px] h-[640px] bg-[#0B0F1A] rounded-t-3xl shadow-2xl flex items-center justify-center border-t border-white/10">
        <div className="text-[#0EA5E9] animate-pulse font-mono text-sm tracking-widest uppercase">Analyzing Mumbai Hubs...</div>
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

  const getProbabilityColor = (probability: number) => {
    if (probability >= 70) return 'bg-[#00FF88]';
    if (probability >= 40) return 'bg-amber-400';
    return 'bg-red-400';
  };

  return (
    <div className="w-[360px] h-[640px] bg-[#0B0F1A] rounded-t-3xl shadow-2xl overflow-hidden border-t border-white/10 mx-auto">
      {/* Visual Handle Bar */}
      <div className="flex justify-center py-3">
        <div className="w-12 h-1.5 bg-gray-800 rounded-full" />
      </div>

      {/* Header */}
      <div className="px-6 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge className="bg-[#0EA5E9]/10 text-[#0EA5E9] border-[#0EA5E9]/20 font-bold uppercase text-[10px] tracking-tighter">
            <Activity className="w-3 h-3 mr-1" />
            Predictive AI Engine
          </Badge>
        </div>
        <h2 className="text-white text-xl font-bold tracking-tight">Nearby Hubs</h2>
        <p className="text-gray-500 text-xs mt-1 leading-relaxed">
          Predicting availability for Mumbai logistics points.
        </p>
      </div>

      {/* Parking Zones List */}
      <div className="px-6 space-y-3 pb-6 max-h-[420px] overflow-y-auto">
        {parkingZones.map((zone) => (
          <Card
            key={zone.name}
            className="bg-[#0F1829]/60 backdrop-blur-md border-[#1E293B] hover:border-[#0EA5E9]/40 transition-all duration-300"
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#0EA5E9] mt-0.5" />
                  <div>
                    <h4 className="text-white text-sm font-bold">{zone.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-gray-500 text-[10px] uppercase font-bold">{zone.distance}</span>
                      <span className="text-gray-700">•</span>
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span className="text-gray-500 text-[10px] uppercase font-bold">{zone.arrivalTime} ETA</span>
                    </div>
                  </div>
                </div>
                <TrendingUp className={`w-4 h-4 ${getTrendColor(zone.trend)}`} />
              </div>

              {/* Confidence Meter */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Spot Probability</span>
                  <span className="text-white text-xs font-bold">{zone.probability}%</span>
                </div>
                <div className="h-1.5 bg-gray-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getProbabilityColor(zone.probability)} transition-all duration-700 ease-out`}
                    style={{ width: `${zone.probability}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-gray-600 text-[9px] uppercase font-black tracking-widest">6H Occupancy Trend</span>
                <MiniSparkline data={zone.historicalData} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Footer Info */}
      <div className="px-6 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0B0F1A] via-[#0B0F1A] p-4">
        <div className="bg-[#0EA5E9]/5 border border-[#0EA5E9]/10 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <Activity className="w-3 h-3 text-[#0EA5E9]" />
            <p className="text-gray-500 text-[9px] leading-tight font-medium uppercase tracking-tighter">
              Telemetry synchronized with live traffic patterns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}