
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
    document.title = 'Login | Kelp — IRL adventures as social currency';
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
        <p className="text-sm text-muted-foreground">IRL adventures → social currency. Be real. Earn impact.</p>
        <div className="mt-4 flex justify-center">
          <ImpactScoreChip scoreLabel="Community impact" scoreValue="+12.4k" />
        </div>
      </header>

      <section className="w-full max-w-md">
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
      </section>

      <footer className="w-full max-w-md mt-6 text-center text-xs text-muted-foreground">
        <p>Share real adventures. Earn impact. Convert it into social currency.</p>
      </footer>
    </main>
  );
};

export default LoginPage;
