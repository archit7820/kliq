
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";

interface SignupFormProps {
  onSuccess: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    const redirectUrl = `${window.location.origin}/`;

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    
    if (signUpError) {
      setError(signUpError.message);
      toast({ title: "Signup Failed", description: signUpError.message, variant: "destructive" });
      setIsLoading(false);
      return;
    }

    console.log("Signup successful, user:", signUpData.user?.id);
    setMessage("Welcome to Kelp! Please check your email to verify your account.");
    toast({ title: "Welcome to Kelp!", description: "Please check your email to verify your account." });
    onSuccess();
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-xl flex items-center animate-fade-in border border-destructive/20">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      
      {message && (
        <div className="mb-4 p-4 bg-primary/10 text-primary rounded-xl flex items-center animate-fade-in border border-primary/20">
          <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <span className="text-sm">{message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-12 h-12 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
              placeholder="you@example.com"
              disabled={isLoading}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-12 h-12 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-mint-500 hover:from-primary/90 hover:to-mint-500/90 text-white font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
              Creating Account...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              Start your journey
              <UserPlus className="ml-2 w-5 h-5" />
            </div>
          )}
        </Button>
      </form>
    </div>
  );
};

export default SignupForm;
