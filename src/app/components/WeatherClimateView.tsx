import { useState, useEffect, useRef } from 'react';
import { CloudRain, Wind, Thermometer, Sun, Leaf, MapPin, Activity } from 'lucide-react';
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

  // MAPPED LOCATIONS: Matching your 10 Priority Panel Orders (ORD-1001 to 1010)
  const mockClimateData = [
    { id: 1001, location: "Gateway of India, Colaba", lat: 18.9220, lng: 72.8347, temp: 28, humidity: 84, aqi: 72, risk: 'low' },
    { id: 1002, location: "Bandra-Kurla Complex (BKC)", lat: 19.0607, lng: 72.8633, temp: 29, humidity: 80, aqi: 142, risk: 'low' },
    { id: 1003, location: "Nariman Point Business Hub", lat: 18.9256, lng: 72.8242, temp: 28, humidity: 82, aqi: 88, risk: 'low' },
    { id: 1004, location: "Andheri East Metro Zone", lat: 19.1136, lng: 72.8697, temp: 30, humidity: 78, aqi: 156, risk: 'high' },
    { id: 1005, location: "Worli Sea Face Road", lat: 19.0176, lng: 72.8150, temp: 27, humidity: 88, aqi: 95, risk: 'low' },
    { id: 1006, location: "Lower Parel Palladium", lat: 18.9927, lng: 72.8297, temp: 29, humidity: 85, aqi: 130, risk: 'low' },
    { id: 1007, location: "Juhu Beach Residences", lat: 19.0988, lng: 72.8264, temp: 28, humidity: 90, aqi: 65, risk: 'low' },
    { id: 1008, location: "Powai Hiranandani Gardens", lat: 19.1176, lng: 72.9060, temp: 31, humidity: 72, aqi: 110, risk: 'low' },
    { id: 1009, location: "Dadar West Station Road", lat: 19.0178, lng: 72.8478, temp: 29, humidity: 81, aqi: 165, risk: 'high' },
    { id: 1010, location: "Vile Parle SV Road", lat: 19.1025, lng: 72.8454, temp: 30, humidity: 79, aqi: 125, risk: 'low' }
  ];

  useEffect(() => {
    const fetchWeatherClimate = async () => {
      try {
        const response = await fetch('https://margdarshak-4.onrender.com/api/weather-climate');
        const data = await response.json();
        
        // Use API data if available, otherwise use our consistent 10-point mock data
        const finalData = data.length > 0 ? data : mockClimateData;
        setDeliveryPoints(finalData);
      } catch (error) {
        console.error('Error fetching Mumbai climate data:', error);
        setDeliveryPoints(mockClimateData);
      }
    };
    fetchWeatherClimate();
  }, [refreshKey]);

  useEffect(() => {
    if (!mapRef.current || deliveryPoints.length === 0) return;

    import('leaflet').then((L) => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const map = L.map(mapRef.current!, {
        center: [19.0300, 72.8400], // Centered to see all Mumbai points
        zoom: 11,
        zoomControl: false,
      });

      mapInstanceRef.current = map;
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

      deliveryPoints.forEach((point) => {
        const color = point.risk === 'high' ? '#EF4444' : '#00FF88';
        const icon = L.divIcon({
          className: 'custom-weather-marker',
          html: `<div style="background: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 15px ${color};"></div>`,
          iconSize: [14, 14],
        });

        L.marker([point.lat, point.lng], { icon })
          .addTo(map)
          .on('click', () => setSelectedPoint(point.id));
      });

      // Fix grey map issue
      setTimeout(() => map.invalidateSize(), 400);
    });

    return () => { if (mapInstanceRef.current) mapInstanceRef.current.remove(); };
  }, [deliveryPoints]);

  return (
    <div className="w-[1194px] h-[834px] bg-[#0B0F1A] relative overflow-hidden rounded-3xl border border-[#1E293B] shadow-2xl mx-auto">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-[50] bg-[#0B0F1A]/90 backdrop-blur-xl p-8 border-b border-[#1E293B]">
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-4">
            <div className="bg-[#0EA5E9]/20 p-3 rounded-2xl flex items-center justify-center">
                <Leaf className="text-[#0EA5E9]" size={28} />
            </div>
            <div>
              <h1 className="text-white text-2xl font-black">Climate Intelligence</h1>
              <p className="text-gray-500 text-sm">Real-time Environmental Monitoring for Mumbai Fleet</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <Badge className="bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/20 px-4 py-2 text-[10px] font-black tracking-widest uppercase">
               <Activity className="w-3 h-3 mr-2 inline" /> LIVE TELEMETRY
             </Badge>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {[
            { label: 'Avg Temp', val: '29°C', icon: Thermometer, color: 'text-amber-500' },
            { label: 'Air Quality', val: '112 AQI', icon: Wind, color: 'text-red-400' },
            { label: 'Humidity', val: '81%', icon: CloudRain, color: 'text-blue-400' },
            { label: 'Carbon Saved', val: '-14%', icon: Leaf, color: 'text-[#00FF88]' }
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
      <div className="absolute inset-0 pt-[240px]">
        <div ref={mapRef} className="w-full h-full" />
      </div>

      {/* Side Zone List */}
      <div className="absolute top-[280px] right-8 bottom-8 w-[380px] z-[60] overflow-y-auto space-y-4 no-scrollbar pr-2">
        {deliveryPoints.map((point) => (
            <Card 
              key={point.id} 
              className={`bg-[#0F1829]/95 backdrop-blur-md border-[#1E293B] p-5 rounded-2xl transition-all hover:border-[#0EA5E9]/50 ${selectedPoint === point.id ? 'ring-2 ring-[#0EA5E9] border-transparent' : ''}`}
            >
              <div className="flex justify-between mb-4">
                <span className="text-white text-[13px] font-bold flex items-center gap-2">
                    <MapPin size={14} className="text-[#0EA5E9]" />
                    {point.location}
                </span>
                <Badge className="bg-black/50 text-[#0EA5E9] border-none text-[9px] uppercase font-bold">ORD-{point.id}</Badge>
              </div>
              <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center gap-2">
                    <Sun className="text-amber-400" size={20} />
                    <span className="text-white text-2xl font-black">{point.temp}°C</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-[9px] uppercase font-black tracking-widest">Humidity</span>
                  <span className="text-gray-300 text-xs font-mono">{point.humidity}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] uppercase font-black text-gray-500">
                  <span>Air Quality Index</span>
                  <span className={point.aqi > 140 ? 'text-red-400' : 'text-[#00FF88]'}>{point.aqi} AQI</span>
                </div>
                <Progress value={(point.aqi / 200) * 100} className={`h-1.5 bg-black ${point.aqi > 140 ? '[&>div]:bg-red-400' : '[&>div]:bg-[#00FF88]'}`} />
              </div>
            </Card>
        ))}
      </div>
    </div>
  );
}