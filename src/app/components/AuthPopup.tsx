import { useState } from 'react';
import { Mail, Lock, User, ShieldCheck } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function AuthPopup({ onLogin }: { onLogin: () => void }) {
  const [isSignup, setIsSignup] = useState(false);

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-[#0B0F1A]/80 backdrop-blur-sm">
      <Card className="w-[400px] bg-[#0F1829] border-[#1E293B] p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#0EA5E9]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-6 h-6 text-[#0EA5E9]" />
          </div>
          <h2 className="text-white text-2xl font-bold">
            {isSignup ? 'Create Account' : 'Fleet Access'}
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            Enter credentials to access Marg Darshak
          </p>
        </div>

        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
          {isSignup && (
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
              <Input className="pl-10 bg-[#0B0F1A] border-[#1E293B]" placeholder="Full Name" />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
            <Input className="pl-10 bg-[#0B0F1A] border-[#1E293B]" type="email" placeholder="Email Address" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
            <Input className="pl-10 bg-[#0B0F1A] border-[#1E293B]" type="password" placeholder="Password" />
          </div>

          <Button className="w-full bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-bold h-12">
            {isSignup ? 'Sign Up' : 'Login to Dashboard'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsSignup(!isSignup)}
            className="text-[#0EA5E9] text-sm hover:underline"
          >
            {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </Card>
    </div>
  );
}