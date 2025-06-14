
import React, { useState, useEffect } from 'react';
import AuthForm from '@/components/AuthForm';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

const LoginPage = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const navigate = useNavigate();

  useEffect(() => {
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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <AuthForm
        mode={mode}
        onSuccess={() => navigate('/home')}
      />
      <div className="mt-6 text-center">
        {mode === 'login' ? (
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Button variant="link" onClick={toggleMode} className="font-medium text-green-600 hover:text-green-500 p-0">
              Sign up
            </Button>
          </p>
        ) : (
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Button variant="link" onClick={toggleMode} className="font-medium text-green-600 hover:text-green-500 p-0">
              Log in
            </Button>
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
