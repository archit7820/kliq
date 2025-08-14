
import React, { useState, useEffect } from 'react';
import AuthForm from '@/components/AuthForm';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import ImpactScoreChip from '@/components/ImpactScoreChip';
import { Sparkles, Trophy, Leaf, Globe, Heart } from 'lucide-react';

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
    <main className="relative min-h-screen bg-background overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 animate-[bounce_3s_ease-in-out_infinite]">
          <Leaf className="w-12 h-12 text-primary/40" />
        </div>
        <div className="absolute top-32 right-16 animate-[bounce_2.5s_ease-in-out_infinite_0.5s]">
          <Globe className="w-8 h-8 text-primary/30" />
        </div>
        <div className="absolute bottom-40 left-16 animate-[bounce_3.5s_ease-in-out_infinite_1s]">
          <Heart className="w-10 h-10 text-primary/35" />
        </div>
        <div className="absolute bottom-32 right-12 animate-[bounce_2.8s_ease-in-out_infinite_1.5s]">
          <Sparkles className="w-6 h-6 text-primary/40" />
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        {/* Hero illustration area */}
        <div className="w-full max-w-sm mb-8 animate-fade-in">
          <div className="relative bg-card/80 backdrop-blur-sm rounded-3xl p-8 border border-border/50 shadow-lg">
            {/* Cozy room illustration with icons */}
            <div className="flex flex-col items-center space-y-6">
              {/* Main character area */}
              <div className="relative">
                <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center shadow-lg animate-scale-in">
                  <Leaf className="w-12 h-12 text-primary-foreground" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary rounded-full flex items-center justify-center animate-[bounce_2s_ease-in-out_infinite]">
                  <Sparkles className="w-4 h-4 text-secondary-foreground" />
                </div>
              </div>
              
              {/* Room elements */}
              <div className="flex justify-between w-full items-end">
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-8 h-12 bg-muted rounded-t-lg"></div>
                  <div className="w-12 h-3 bg-muted-foreground/20 rounded"></div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 bg-accent rounded-full"></div>
                  <div className="w-8 h-8 bg-accent/80 rounded"></div>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-6 h-10 bg-muted rounded-t-full"></div>
                  <div className="w-10 h-3 bg-muted-foreground/20 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome text */}
        <div className="text-center mb-8 animate-fade-in animation-delay-300">
          <h1 className="text-3xl font-extrabold text-foreground mb-2">
            Save the earth with a snap
          </h1>
          <p className="text-muted-foreground text-lg">Track your carbon footprint</p>
          <div className="mt-4 flex justify-center animate-scale-in animation-delay-500">
            <ImpactScoreChip scoreLabel="Community impact" scoreValue="+12.4k" />
          </div>
        </div>

        {/* Auth form */}
        <section className="w-full max-w-md animate-fade-in animation-delay-700">
          <AuthForm
            mode={mode}
            onSuccess={() => navigate('/home')}
          />
          <div className="mt-6 text-center">
            {mode === 'login' ? (
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Button variant="link" onClick={toggleMode} className="p-0 text-primary hover:text-primary/80">
                  Sign up
                </Button>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Button variant="link" onClick={toggleMode} className="p-0 text-primary hover:text-primary/80">
                  Log in
                </Button>
              </p>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full max-w-md mt-8 text-center text-xs text-muted-foreground animate-fade-in animation-delay-1000">
          <p>Join thousands making a real impact on our planet 🌱</p>
        </footer>
      </div>
    </main>
  );
};

export default LoginPage;
