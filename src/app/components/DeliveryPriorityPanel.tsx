import { useState, useEffect } from 'react';
import { Clock, CircleAlert, TrendingUp, Gauge } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface DeliveryCardProps {
  orderId: string;
  address: string;
  timeWindow: string;
  timeRemaining: string;
  priorityScore: number;
  parkingDifficulty: 'low' | 'medium' | 'high';
  status: 'urgent' | 'medium' | 'low';
}

function DeliveryCard({ orderId, address, timeWindow, timeRemaining, priorityScore, parkingDifficulty, status }: DeliveryCardProps) {
  const statusColors = {
    urgent: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', badge: 'bg-red-500/20 text-red-400' },
    medium: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-400' },
    low: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-400' },
  };

  const parkingColors = {
    high: 'text-red-400',
    medium: 'text-amber-400',
    low: 'text-emerald-400',
  };

  return (
    <Card className={`${statusColors[status]?.bg || 'bg-slate-800'} backdrop-blur-sm border ${statusColors[status]?.border || 'border-slate-700'} transition-all hover:scale-[1.01]`}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="text-white font-bold">{orderId}</h4>
            <p className="text-gray-400 text-sm mt-1">{address}</p>
          </div>
          <Badge className={statusColors[status]?.badge}>
            {status?.toUpperCase()}
          </Badge>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300 text-xs font-mono">{timeWindow}</span>
          <span className={`text-xs ml-auto font-bold ${statusColors[status]?.text}`}>{timeRemaining}</span>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-1 text-xs">
            <span className="text-gray-400">Route Priority Score</span>
            <span className="text-white font-bold">{priorityScore}%</span>
          </div>
          <Progress value={priorityScore} className="h-1.5" />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex items-center gap-2">
            <CircleAlert className={`w-3.5 h-3.5 ${parkingColors[parkingDifficulty]}`} />
            <span className="text-gray-500 text-xs">Parking Risk</span>
          </div>
          <span className={`text-xs font-bold uppercase tracking-tighter ${parkingColors[parkingDifficulty]}`}>
            {parkingDifficulty}
          </span>
        </div>
      </div>
    </Card>
  );
}

export function DeliveryPriorityPanel() {
  const [deliveries, setDeliveries] = useState<DeliveryCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const response = await fetch('https://margdarshak-3.onrender.com/api/auth/login');
        if (!response.ok) throw new Error('API Response Failed');
        const data = await response.json();
        
        // Safety check to ensure data is an array before setting state
        setDeliveries(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching priorities:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDeliveries();
  }, []);

  if (isLoading) {
    return <div className="p-12 text-blue-400 font-mono animate-pulse">SYNCING PRIORITY QUEUE...</div>;
  }

  return (
    <div className="w-[834px] h-[1194px] bg-[#0B0F1A] p-10 rounded-xl shadow-2xl overflow-y-auto border border-[#1E293B]">
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-white text-4xl font-bold tracking-tight">Priority Dashboard</h1>
          <Badge className="bg-[#0EA5E9]/10 text-[#0EA5E9] border-[#0EA5E9]/30 px-4 py-2 text-xs font-bold">
            <Gauge className="w-3 h-3 mr-2" />
            AI REAL-TIME RANKING
          </Badge>
        </div>
        <p className="text-gray-500 text-lg">Optimizing fleet sequence based on live Mumbai traffic and parking telemetry.</p>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-10">
        <Card className="bg-[#0EA5E9]/5 border-[#0EA5E9]/20 p-5">
            <p className="text-gray-500 text-xs font-bold uppercase mb-1">Queue Size</p>
            <div className="flex items-end justify-between">
              <span className="text-white text-3xl font-bold">{deliveries.length}</span>
              <TrendingUp className="w-6 h-6 text-[#0EA5E9]" />
            </div>
        </Card>
        <Card className="bg-red-500/5 border-red-500/20 p-5">
            <p className="text-gray-500 text-xs font-bold uppercase mb-1">Urgent Actions</p>
            <div className="flex items-end justify-between">
              <span className="text-red-400 text-3xl font-bold">
                {deliveries.filter(d => d.status === 'urgent').length}
              </span>
              <CircleAlert className="w-6 h-6 text-red-500" />
            </div>
        </Card>
        <Card className="bg-[#00FF88]/5 border-[#00FF88]/20 p-5">
            <p className="text-gray-500 text-xs font-bold uppercase mb-1">On Schedule</p>
            <div className="flex items-end justify-between">
              <span className="text-[#00FF88] text-3xl font-bold">
                {deliveries.filter(d => d.status !== 'urgent').length}
              </span>
              <div className="w-3 h-3 bg-[#00FF88] rounded-full animate-pulse mb-2" />
            </div>
        </Card>
      </div>

      <div className="space-y-4">
        {deliveries.length > 0 ? (
          deliveries.map((delivery) => (
            <DeliveryCard key={delivery.orderId} {...delivery} />
          ))
        ) : (
          <div className="text-gray-600 text-center py-20 border-2 border-dashed border-[#1E293B] rounded-2xl">
            No active deliveries found in the current route.
          </div>
        )}
      </div>
    </div>
  );
}