import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Leaf, Apple, Chrome } from 'lucide-react';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine initial mode based on URL path
  const getInitialMode = () => {
    if (location.pathname === '/login') return 'login';
    if (location.pathname === '/signup') return 'signup';
    return 'signup'; // default to signup for /auth
  };
  
  const [mode, setMode] = useState<'login' | 'signup'>(getInitialMode());

  // Update mode when URL changes
  useEffect(() => {
    setMode(getInitialMode());
  }, [location.pathname]);

  useEffect(() => {
    document.title = mode === 'login' ? 'Login | Kelp' : 'Join Kelp';
    
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
  }, [navigate, mode]);

  const toggleMode = () => {
    const newMode = mode === 'login' ? 'signup' : 'login';
    setMode(newMode);
    // Update URL without adding to history
    navigate(`/${newMode}`, { replace: true });
  };

  const handleBack = () => {
    navigate('/landing');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex flex-col">
      
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full px-4 py-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>
        
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-xl text-gray-900">Kelp</span>
        </div>
        
        <div className="w-16"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 pb-8">
        <div className="w-full max-w-md">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <Leaf className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-3">
              {mode === 'signup' ? 'Join Kelp' : 'Welcome Back'}
            </h1>
            <p className="text-gray-600 text-lg">
              {mode === 'signup' 
                ? 'Start your sustainability journey' 
                : 'Continue making an impact'
              }
            </p>
          </div>

          {/* Social Login Options */}
          <div className="space-y-3 mb-8">
            <Button 
              variant="outline"
              className="w-full h-14 rounded-2xl bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 font-semibold text-gray-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Apple className="w-5 h-5 mr-3" />
              Continue with Apple
            </Button>
            <Button 
              variant="outline"
              className="w-full h-14 rounded-2xl bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 font-semibold text-gray-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Chrome className="w-5 h-5 mr-3" />
              Continue with Google
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-6 bg-gradient-to-br from-green-50 via-white to-emerald-50 text-gray-500 font-medium">or continue with email</span>
            </div>
          </div>

          {/* Auth Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50 shadow-2xl p-8 mb-6">
            {mode === 'signup' ? (
              <SignupForm onSuccess={() => navigate('/home')} />
            ) : (
              <LoginForm onSuccess={() => navigate('/home')} />
            )}
          </div>

          {/* Mode Toggle */}
          <div className="text-center mb-6">
            {mode === 'login' ? (
              <p className="text-gray-600">
                New to Kelp?{' '}
                <Button 
                  variant="link" 
                  onClick={toggleMode} 
                  className="p-0 text-green-600 hover:text-green-700 font-bold underline-offset-4"
                >
                  Join the movement
                </Button>
              </p>
            ) : (
              <p className="text-gray-600">
                Already have an account?{' '}
                <Button 
                  variant="link" 
                  onClick={toggleMode} 
                  className="p-0 text-green-600 hover:text-green-700 font-bold underline-offset-4"
                >
                  Sign in
                </Button>
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-gray-500 leading-relaxed">
              By continuing, you agree to our{' '}
              <span className="text-green-600 hover:text-green-700 cursor-pointer font-medium">Terms</span>
              {' '}and{' '}
              <span className="text-green-600 hover:text-green-700 cursor-pointer font-medium">Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AuthPage;