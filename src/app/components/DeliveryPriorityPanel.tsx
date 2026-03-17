import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
// FIXED: Added Circle and Gauge to the imports
import { ListOrdered, AlertCircle, CheckCircle2, Clock, Circle, Gauge, TrendingUp } from 'lucide-react';

// Interface to handle the refreshKey from App.tsx
interface PriorityProps {
  refreshKey?: number; 
}

export function DeliveryPriorityPanel({ refreshKey }: PriorityProps) {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // FETCH LIVE DATA
  useEffect(() => {
    const fetchPriorityData = async () => {
      try {
        // FIXED: Pointing to the correct deliveries endpoint instead of login
        const response = await fetch("https://margdarshak-3.onrender.com/api/deliveries");
        const data = await response.json();
        
        // Only show items that Ankit hasn't finished yet
        const activeOnly = Array.isArray(data) ? data.filter((d: any) => d.status !== 'Completed') : [];
        setDeliveries(activeOnly);
        setLoading(false);
      } catch (error) {
        console.error("Priority Fetch Error:", error);
        setLoading(false);
      }
    };

    fetchPriorityData();
  }, [refreshKey]); // Syncs automatically when Driver App updates

  if (loading) return <div className="p-12 text-[#0EA5E9] font-mono animate-pulse">CALCULATING AI PRIORITY QUEUE...</div>;

  return (
    <div className="w-[834px] min-h-[1000px] bg-[#0B0F1A] p-10 rounded-xl border border-[#1E293B] shadow-2xl overflow-y-auto">
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-white text-4xl font-bold tracking-tight flex items-center gap-3">
            <ListOrdered className="text-[#0EA5E9]" />
            Priority Dashboard
          </h1>
          <Badge className="bg-[#0EA5E9]/10 text-[#0EA5E9] border-[#0EA5E9]/30 px-4 py-2 text-xs font-bold">
            <Gauge className="w-3 h-3 mr-2" />
            AI REAL-TIME RANKING
          </Badge>
        </div>
        <p className="text-gray-500 text-lg">Optimizing fleet sequence based on live Mumbai traffic and parking telemetry.</p>
      </div>

      {/* Stats Row */}
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

      {/* Order List */}
      <div className="space-y-4">
        {deliveries.length === 0 ? (
          <div className="text-gray-600 text-center py-20 border-2 border-dashed border-[#1E293B] rounded-2xl">
            No active deliveries found in the current route.
          </div>
        ) : (
          deliveries.map((order) => (
            <Card key={order.orderId} className="bg-[#0F1829]/50 border-[#1E293B] p-6 hover:border-[#0EA5E9]/50 transition-all group backdrop-blur-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-6">
                  {/* Priority Circular Score */}
                  <div className={`h-14 w-14 rounded-2xl flex flex-col items-center justify-center font-black ${
                    order.priority > 80 ? 'bg-red-500/10 text-red-500' : 'bg-[#0EA5E9]/10 text-[#0EA5E9]'
                  }`}>
                    <span className="text-xs font-bold opacity-50">SCORE</span>
                    {order.priority}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-xl">{order.orderId}</h4>
                    <p className="text-gray-400 text-sm">{order.address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-10">
                  <div className="text-right">
                    <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">Status</p>
                    <p className="text-white font-medium flex items-center justify-end gap-2 text-sm">
                      <Circle size={8} fill={order.status === 'In Transit' ? '#00FF88' : '#F59E0B'} className="border-none"/>
                      {order.status || 'Pending'}
                    </p>
                  </div>
                  <div className="text-right min-w-[80px]">
                    <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">ETA</p>
                    <p className="text-[#0EA5E9] font-black text-lg">{order.eta || '12 min'}</p>
                  </div>
                </div>
              </div>
              
              {/* Added a small progress bar for the priority score inside the card */}
              <div className="mt-4 opacity-30 group-hover:opacity-100 transition-opacity">
                 <Progress value={order.priority} className="h-1 bg-white/5" />
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, color, icon }: any) {
  return (
    <Card className="bg-[#0F1829]/30 border-[#1E293B] p-6 rounded-2xl relative overflow-hidden">
      <p className="text-gray-500 text-[10px] font-bold tracking-[0.2em] mb-2 flex items-center gap-2">
        {icon} {title}
      </p>
      <p className={`text-4xl font-black ${color}`}>{value}</p>
      <div className="absolute top-0 right-0 p-4 opacity-5">
        <ListOrdered size={48} />
      </div>
    </Card>
  );
}