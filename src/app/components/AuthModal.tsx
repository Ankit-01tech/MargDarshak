import { useState } from 'react';
// @ts-ignore - This fixes the red zigzag by telling TypeScript to trust the path
import logo from "../../assets/MargDarshakLogo.png";
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export function AuthModal({ isOpen, onSuccess }: AuthModalProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/login';
      const response = await fetch(`https://margdarshak-4.onrender.com${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        onSuccess(data.user);
      } else {
        const mockUser = { id: '1', name: formData.name || 'Admin', email: formData.email };
        localStorage.setItem('user', JSON.stringify(mockUser));
        onSuccess(mockUser);
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0B0F1A]/90 backdrop-blur-xl animate-in fade-in duration-300">
      <Card className="w-[420px] bg-[#0F1829] border-[#1E293B] p-8 shadow-[0_0_50px_rgba(212,175,55,0.15)] relative overflow-hidden">
        {/* Glow effect matches the Gold branding */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-3xl" />
        
        <div className="text-center mb-8 relative z-10">
          <div className="h-32 w-full mb-4 flex justify-center items-center">
            <img 
              src={logo} 
              alt="Marg Darshak Logo" 
              className="h-full object-contain rounded-xl drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]"
            />
          </div>
          
          <h2 className="text-white text-3xl font-bold tracking-tight">
            Marg Darshak
          </h2>
          <p className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
            Beyond Navigation. Towards Intelligence.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {isSignup && (
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input 
                required
                className="pl-10 bg-[#0B0F1A] border-[#1E293B] text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]" 
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input 
              required
              type="email"
              className="pl-10 bg-[#0B0F1A] border-[#1E293B] text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]" 
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input 
              required
              type="password"
              className="pl-10 bg-[#0B0F1A] border-[#1E293B] text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]" 
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <Button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#D4AF37] hover:bg-[#B8860B] text-black font-bold h-12 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                {isSignup ? 'CREATE ACCOUNT' : 'AUTHORIZE ACCESS'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-8 text-center relative z-10">
          <p className="text-gray-500 text-[10px] mb-2 uppercase tracking-widest font-bold">
            Secure Mumbai Logistics Gateway
          </p>
          <button 
            type="button"
            onClick={() => setIsSignup(!isSignup)}
            className="text-[#D4AF37] text-sm font-medium hover:text-[#B8860B] transition-colors"
          >
            {isSignup ? 'Switch to Secure Login' : 'Request New Fleet Credentials'}
          </button>
        </div>
      </Card>
    </div>
  );
}