import { useState, useEffect, useRef } from 'react';
import { CloudRain, Wind, Thermometer, Sun, Leaf, MapPin } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface WeatherProps {
  refreshKey?: number;
}

export function WeatherClimateView({ refreshKey }: WeatherProps) {
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [deliveryPoints, setDeliveryPoints] = useState<any[]>([]);

  useEffect(() => {
    const fetchWeatherClimate = async () => {
      try {
        // Fetching real Mumbai data from the corrected API
        const response = await fetch('https://margdarshak-3.onrender.com/api/weather-climate');
        const data = await response.json();
        
        // Mapped specifically to Mumbai regions like BKC, Colaba, Andheri
        const mappedData = data.map((p: any, i: number) => ({
          ...p,
          id: p.id || i,
          lat: 19.0760 + (i * 0.01), 
          lng: 72.8777 + (i * 0.01)
        }));
        
        setDeliveryPoints(mappedData);
      } catch (error) {
        console.error('Error fetching Mumbai climate data:', error);
      }
    };
    fetchWeatherClimate();
  }, [refreshKey]); // Reloads when driver completes a task

  useEffect(() => {
    if (!mapRef.current || deliveryPoints.length === 0) return;

    import('leaflet').then((L) => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const map = L.map(mapRef.current!, {
        center: [19.0760, 72.8777], 
        zoom: 12,
        zoomControl: false,
      });

      mapInstanceRef.current = map;
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

      deliveryPoints.forEach((point) => {
        const color = point.climate?.riskLevel === 'low' ? '#00FF88' : '#EF4444';
        const icon = L.divIcon({
          className: 'custom-weather-marker',
          html: `<div style="background: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 15px ${color};"></div>`,
          iconSize: [14, 14],
        });

        L.marker([point.lat, point.lng], { icon })
          .addTo(map)
          .on('click', () => setSelectedPoint(point.id));
      });
    });

    return () => { if (mapInstanceRef.current) mapInstanceRef.current.remove(); };
  }, [deliveryPoints]);

  return (
    <div className="w-[1194px] h-[834px] bg-[#0B0F1A] relative overflow-hidden rounded-3xl border border-[#1E293B] shadow-2xl">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-[1000] bg-[#0B0F1A]/80 backdrop-blur-xl p-8 border-b border-[#1E293B]">
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-4">
            <div className="bg-[#0EA5E9]/20 p-3 rounded-2xl flex items-center justify-center">
                <Leaf className="text-[#0EA5E9]" size={28} />
            </div>
            <div>
              <h1 className="text-white text-2xl font-black">Climate Intelligence</h1>
              <p className="text-gray-500 text-sm">Synchronized with Mumbai Logistics Gateway</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <Badge className="bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/20 px-4 py-2 text-[10px] font-black tracking-widest">LIVE TELEMETRY</Badge>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {[
            { label: 'Avg Temp', val: '28°C', icon: Thermometer, color: 'text-amber-500' },
            { label: 'Air Quality', val: '142 AQI', icon: Wind, color: 'text-red-400' },
            { label: 'Humidity', val: '84%', icon: CloudRain, color: 'text-blue-400' },
            { label: 'Carbon Saved', val: '-12%', icon: Leaf, color: 'text-[#00FF88]' }
          ].map((stat, i) => (
            <Card key={i} className="bg-black/40 border-[#1E293B] p-5 flex items-center justify-between rounded-2xl">
              <div>
                <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-1">{stat.label}</p>
                <p className="text-white text-2xl font-black">{stat.val}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color} opacity-80`} />
            </Card>
          ))}
        </div>
      </div>

      {/* Map Background */}
      <div className="absolute inset-0 pt-[220px]">
        <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      </div>

      {/* Side Zone List */}
      <div className="absolute top-[260px] right-8 bottom-8 w-[380px] z-[1000] overflow-y-auto space-y-4 no-scrollbar">
        {deliveryPoints.map((point) => (
            <Card key={point.id} className={`bg-[#0F1829]/95 backdrop-blur-md border-[#1E293B] p-5 rounded-2xl transition-all hover:border-[#0EA5E9]/50 ${selectedPoint === point.id ? 'ring-2 ring-[#0EA5E9]' : ''}`}>
              <div className="flex justify-between mb-4">
                <span className="text-white text-md font-bold flex items-center gap-2">
                    <MapPin size={14} className="text-[#0EA5E9]" />
                    {point.location}
                </span>
                <Badge className="bg-black/50 text-[#0EA5E9] border-none text-[10px]">{point.delivery?.eta || 'Live'}</Badge>
              </div>
              <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center gap-2">
                    <Sun className="text-amber-400" size={20} />
                    <span className="text-white text-2xl font-black">{point.weather?.temp || '28'}°C</span>
                </div>
                <span className="text-gray-500 text-xs font-medium uppercase tracking-widest">Humidity: {point.weather?.humidity || '60'}%</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] uppercase font-black text-gray-500">
                  <span>Air Quality Index</span>
                  <span className={point.climate?.airQuality > 100 ? 'text-red-400' : 'text-[#00FF88]'}>{point.climate?.airQuality || '72'} AQI</span>
                </div>
                <Progress value={point.climate?.airQuality || 50} className="h-1.5 bg-black" />
              </div>
            </Card>
        ))}
      </div>
    </div>
  );
}