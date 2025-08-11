
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
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-secondary/40">
      {/* Decorative vibe blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-16 h-56 w-56 -translate-x-1/2 rounded-full bg-gradient-to-br from-primary/25 to-primary/5 blur-3xl" />
        <div className="absolute right-10 bottom-10 h-40 w-40 rounded-full bg-gradient-to-br from-secondary/20 to-primary/10 blur-2xl" />
      </div>

      <div className="w-full max-w-md p-4">
        <div className="rounded-2xl border bg-card/80 backdrop-blur-xl p-8 shadow-xl">
          <div className="flex flex-col items-center mb-6 text-center">
            <Leaf className="w-12 h-12 text-primary mb-3" />
            <h1 className="text-3xl font-extrabold tracking-tight">Kelp</h1>
            <p className="mt-1 text-sm text-muted-foreground">IRL adventures → social currency</p>
          </div>

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
