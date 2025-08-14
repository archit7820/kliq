
import React from 'react';
import { Leaf } from 'lucide-react';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';

interface AuthFormProps {
  mode: 'login' | 'signup';
  onSuccess: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, onSuccess }) => {
  return (
    <div className="w-full">
      <div className="relative bg-card/90 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl animate-scale-in">
        {/* Floating decoration */}
        <div className="absolute -top-3 -right-3 w-6 h-6 bg-gradient-to-br from-mint-400 to-sky-400 rounded-full animate-[bounce_2s_ease-in-out_infinite]"></div>
        
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="relative mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-mint-500 rounded-2xl flex items-center justify-center shadow-lg animate-scale-in">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-sky-400 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {mode === 'signup' ? 'Join Kelp' : 'Welcome back'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {mode === 'signup' 
              ? 'Start your sustainability journey today' 
              : 'Continue your eco-friendly adventure'
            }
          </p>
        </div>

        <div className="animate-fade-in animation-delay-300">
          {mode === 'signup' ? (
            <SignupForm onSuccess={onSuccess} />
          ) : (
            <LoginForm onSuccess={onSuccess} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
