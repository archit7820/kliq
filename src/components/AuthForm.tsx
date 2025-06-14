
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, Mail, Lock, LogIn, UserPlus, AlertCircle } from 'lucide-react'; // Assuming Leaf is a suitable logo icon
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";

interface AuthFormProps {
  mode: 'login' | 'signup';
  onSuccess: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const redirectUrl = `${window.location.origin}/`;

    if (mode === 'signup') {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });
      if (signUpError) {
        setError(signUpError.message);
        toast({ title: "Signup Failed", description: signUpError.message, variant: "destructive" });
      } else {
        toast({ title: "Signup Successful", description: "Please check your email to verify your account." });
        // onSuccess will be called by onAuthStateChange in LoginPage
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
        toast({ title: "Login Failed", description: signInError.message, variant: "destructive" });
      } else {
        // onSuccess will be called by onAuthStateChange in LoginPage
      }
    }
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (oauthError) {
      setError(oauthError.message);
      toast({ title: "Google Sign-In Failed", description: oauthError.message, variant: "destructive" });
      setIsLoading(false);
    }
    // On success, Supabase redirects and onAuthStateChange handles it.
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <div className="flex flex-col items-center mb-8">
          <Leaf className="w-16 h-16 text-green-600 mb-3" />
          <h1 className="text-3xl font-bold text-gray-800">Kelp</h1>
          <p className="text-gray-600 mt-1">{mode === 'signup' ? 'Create your account' : 'Welcome back!'}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email" className="text-gray-700">Email</Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10"
                placeholder="••••••••"
              />
            </div>
          </div>
          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={isLoading}>
            {isLoading ? 'Processing...' : (mode === 'signup' ? 'Sign Up' : 'Login')}
            {mode === 'signup' ? <UserPlus className="ml-2 w-5 h-5" /> : <LogIn className="ml-2 w-5 h-5" />}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>
          <Button onClick={handleGoogleSignIn} variant="outline" className="w-full mt-4" disabled={isLoading}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 mr-2" />
            Sign in with Google
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
