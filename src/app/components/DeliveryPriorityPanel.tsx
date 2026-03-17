import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ListOrdered, AlertCircle, CheckCircle2, Circle, Gauge, TrendingUp } from 'lucide-react';

interface PriorityProps {
  refreshKey?: number; 
}

export function DeliveryPriorityPanel({ refreshKey }: PriorityProps) {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // FETCH LIVE DATA FROM MONGODB
  useEffect(() => {
    const fetchPriorityData = async () => {
      try {
        // Pointing to your new live backend server
        const response = await fetch("https://margdarshak-4.onrender.com/api/deliveries");
        const data = await response.json();
        
        // Filter out completed orders so they vanish from the list when confirmed
        const activeOnly = Array.isArray(data) ? data.filter((d: any) => d.status !== 'Completed') : [];
        setDeliveries(activeOnly);
        setLoading(false);
      } catch (error) {
        console.error("Priority Panel Sync Error:", error);
        setLoading(false);
      }
    };

    fetchPriorityData();
  }, [refreshKey]); // Auto-reloads when refreshKey changes in App.tsx

  if (loading) return <div className="p-12 text-[#0EA5E9] font-mono animate-pulse text-center">SYNCING REAL-TIME PRIORITY QUEUE...</div>;

  return (
    <div className="w-[834px] min-h-[1000px] bg-[#0B0F1A] p-10 rounded-3xl border border-[#1E293B] shadow-2xl overflow-y-auto">
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-white text-4xl font-black tracking-tight flex items-center gap-3">
            <ListOrdered className="text-[#0EA5E9]" />
            Priority Dashboard
          </h1>
          <Badge className="bg-[#0EA5E9]/10 text-[#0EA5E9] border-[#0EA5E9]/30 px-4 py-2 text-[10px] font-black tracking-widest">
            <Gauge className="w-3 h-3 mr-2" />
            AI REAL-TIME RANKING
          </Badge>
        </div>
        <p className="text-gray-500 text-lg">Optimizing fleet sequence based on live Mumbai traffic and parking telemetry.</p>
      </div>

      {/* STATISTICS ROW */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        <StatCard title="QUEUE SIZE" value={deliveries.length} color="text-[#0EA5E9]" icon={<TrendingUp size={16}/>} />
        <StatCard 
          title="URGENT ACTIONS" 
          value={deliveries.filter(d => d.priority > 80).length} 
          color="text-red-500" 
          icon={<AlertCircle size={16}/>} 
        />
        <StatCard 
          title="ON SCHEDULE" 
          value={deliveries.filter(d => d.status !== 'Urgent').length} 
          color="text-[#00FF88]" 
          icon={<CheckCircle2 size={16}/>} 
        />
      </div>

      {/* ACTIVE ORDERS LIST */}
      <div className="space-y-4">
        {deliveries.length === 0 ? (
          <div className="text-gray-600 text-center py-24 border-2 border-dashed border-[#1E293B] rounded-[2rem]">
            <p className="text-sm uppercase tracking-widest font-bold">No active deliveries in current route.</p>
          </div>
        ) : (
          deliveries.map((order) => (
            <Card key={order.orderId} className="bg-[#0F1829]/50 border-[#1E293B] p-6 hover:border-[#0EA5E9]/50 transition-all group backdrop-blur-md rounded-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-6">
                  {/* AI Priority Circular Badge */}
                  <div className={`h-14 w-14 rounded-2xl flex flex-col items-center justify-center font-black ${
                    order.priority > 80 ? 'bg-red-500/10 text-red-500' : 'bg-[#0EA5E9]/10 text-[#0EA5E9]'
                  }`}>
                    <span className="text-[8px] font-bold opacity-50 uppercase">Score</span>
                    {order.priority}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-xl">{order.orderId}</h4>
                    <p className="text-gray-400 text-sm font-medium">{order.address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-10">
                  <div className="text-right">
                    <p className="text-gray-500 text-[9px] uppercase font-black tracking-widest mb-1">Status</p>
                    <p className="text-white font-bold flex items-center justify-end gap-2 text-xs">
                      <Circle size={8} fill={order.status === 'In Transit' ? '#00FF88' : '#F59E0B'} className="border-none"/>
                      {order.status || 'Pending'}
                    </p>
                  </div>
                  <div className="text-right min-w-[85px]">
                    <p className="text-gray-500 text-[9px] uppercase font-black tracking-widest mb-1">ETA</p>
                    <p className="text-[#0EA5E9] font-black text-lg">{order.eta || '12 min'}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-5 opacity-20 group-hover:opacity-100 transition-opacity">
                 <Progress value={order.priority} className="h-1 bg-white/5" />
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// Reusable Stat Card Component
function StatCard({ title, value, color, icon }: any) {
  return (
    <Card className="bg-[#0F1829]/30 border-[#1E293B] p-6 rounded-2xl relative overflow-hidden group hover:border-[#0EA5E9]/20 transition-all">
      <p className="text-gray-500 text-[10px] font-black tracking-[0.25em] mb-2 flex items-center gap-2">
        {icon} {title}
      </p>
      <p className={`text-4xl font-black ${color} tracking-tighter`}>{value}</p>
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
        <ListOrdered size={56} />
      </div>
    </Card>
  );
}