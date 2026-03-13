import { useState, useEffect, useRef } from 'react';
import { CloudRain, Wind, Thermometer, Sun, Leaf, TriangleAlert, MapPin, Clock } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

export function WeatherClimateView() {
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [deliveryPoints, setDeliveryPoints] = useState<any[]>([]);

  useEffect(() => {
    const fetchWeatherClimate = async () => {
      try {
        // Updated to use the working Port 8080
        const response = await fetch('http://localhost:8080/api/weather-climate');
        const data = await response.json();
        
        // Mumbai coordinate offset to ensure they appear on the map
        const mappedData = data.map((p: any, i: number) => ({
          ...p,
          lat: 19.0760 + (i * 0.01), 
          lng: 72.8777 + (i * 0.01)
        }));
        
        setDeliveryPoints(mappedData);
      } catch (error) {
        console.error('Error fetching weather climate data:', error);
      }
    };
    fetchWeatherClimate();
  }, []);

  useEffect(() => {
    if (!mapRef.current || deliveryPoints.length === 0) return;

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

      deliveryPoints.forEach((point) => {
        const color = point.climate.riskLevel === 'low' ? '#00FF88' : '#EF4444';
        const icon = L.divIcon({
          className: 'custom-weather-marker',
          html: `<div style="background: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color};"></div>`,
          iconSize: [12, 12],
        });

        L.marker([point.lat, point.lng], { icon })
          .addTo(map)
          .on('click', () => setSelectedPoint(point.id));
      });
    });

    return () => { if (mapInstanceRef.current) mapInstanceRef.current.remove(); };
  }, [deliveryPoints]);

  const getWeatherIcon = (condition: string) => {
    if (condition.includes("Rain")) return CloudRain;
    return Sun;
  };

  return (
    <div className="w-[1194px] h-[834px] bg-[#0B0F1A] relative overflow-hidden rounded-xl border border-[#1E293B]">
      {/* Header with Stats */}
      <div className="absolute top-0 left-0 right-0 z-[1000] bg-[#0B0F1A]/90 p-6 border-b border-[#1E293B]">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            <div className="bg-[#0EA5E9]/20 p-2 rounded-lg"><Leaf className="text-[#0EA5E9]" /></div>
            <div>
              <h1 className="text-white text-xl font-bold">Climate Intelligence</h1>
              <p className="text-gray-500 text-xs">Real-time Mumbai environment telemetry</p>
            </div>
          </div>
          <Badge className="bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/20 px-4 py-2">LIVE MONITORING</Badge>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Avg Temp', val: '28°C', icon: Thermometer, color: 'text-amber-500' },
            { label: 'Air Quality', val: '142 AQI', icon: Wind, color: 'text-red-400' },
            { label: 'Humidity', val: '84%', icon: CloudRain, color: 'text-blue-400' },
            { label: 'Carbon Saved', val: '-12%', icon: Leaf, color: 'text-[#00FF88]' }
          ].map((stat, i) => (
            <Card key={i} className="bg-[#0F1829] border-[#1E293B] p-4 flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">{stat.label}</p>
                <p className="text-white text-xl font-bold">{stat.val}</p>
              </div>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </Card>
          ))}
        </div>
      </div>

      {/* Main Map View */}
      <div className="absolute inset-0 pt-[180px]">
        <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      </div>

      {/* Side Panel */}
      <div className="absolute top-[200px] right-6 bottom-6 w-[350px] z-[1000] overflow-y-auto space-y-4">
        {deliveryPoints.map((point) => {
          const Icon = getWeatherIcon(point.weather.condition);
          return (
            <Card key={point.id} className={`bg-[#0F1829]/95 border-[#1E293B] p-4 transition-all ${selectedPoint === point.id ? 'ring-2 ring-[#0EA5E9]' : ''}`}>
              <div className="flex justify-between mb-3">
                <span className="text-white text-sm font-bold">{point.location}</span>
                <Badge className="bg-[#1E293B] text-gray-400 text-[10px]">{point.delivery.eta}</Badge>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <Icon className="text-[#0EA5E9]" />
                <span className="text-white text-xl">{point.weather.temp}°C</span>
                <span className="text-gray-500 text-xs">Humidity: {point.weather.humidity}%</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] uppercase font-bold text-gray-500">
                  <span>Air Quality Index</span>
                  <span className={point.climate.airQuality > 100 ? 'text-red-400' : 'text-[#00FF88]'}>{point.climate.airQuality} AQI</span>
                </div>
                <Progress value={point.climate.airQuality} className="h-1 bg-[#0B0F1A]" />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}