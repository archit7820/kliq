
import React, { useState, useEffect } from 'react';
import AuthForm from '@/components/AuthForm';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import ImpactScoreChip from '@/components/ImpactScoreChip';
import { Sparkles, Trophy } from 'lucide-react';

const LoginPage = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Login | Kelp — Gamified Climate Action';
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate('/home');
      }
    });

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate('/home');
      }
    });
    
    return () => subscription?.unsubscribe();
  }, [navigate]);

  const toggleMode = () => {
    setMode(prevMode => (prevMode === 'login' ? 'signup' : 'login'));
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/40 flex flex-col items-center p-4">
      <header className="w-full max-w-md pt-8 pb-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Trophy className="text-primary" />
          <h1 className="text-2xl font-extrabold tracking-tight">Kelp</h1>
        </div>
        <p className="text-sm text-muted-foreground">Join the climate crew. Earn rewards, level up your eco impact.</p>
        <div className="mt-4 flex justify-center">
          <ImpactScoreChip scoreLabel="Community impact" scoreValue="+12.4k" />
        </div>
      </header>

      <section className="w-full max-w-md">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Sparkles className="w-4 h-4 text-primary" /> Streaks + Rewards</span>
          </div>
          <AuthForm
            mode={mode}
            onSuccess={() => navigate('/home')}
          />
          <div className="mt-4 text-center">
            {mode === 'login' ? (
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Button variant="link" onClick={toggleMode} className="p-0">Sign up</Button>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Button variant="link" onClick={toggleMode} className="p-0">Log in</Button>
              </p>
            )}
          </div>
        </div>
      </section>

      <footer className="w-full max-w-md mt-6 text-center text-xs text-muted-foreground">
        <p>Track CO₂e, keep your streak, redeem green rewards.</p>
      </footer>
    </main>
  );
};

export default LoginPage;
