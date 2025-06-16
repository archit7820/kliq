
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, Mail, Lock, LogIn, UserPlus, AlertCircle, Gift } from 'lucide-react';
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

  // Invite code state
  const [inviteCode, setInviteCode] = useState('');
  const [inviteValid, setInviteValid] = useState<boolean | null>(null);
  const [checkingInvite, setCheckingInvite] = useState(false);

  // Prefill invite code from URL param
  useEffect(() => {
    if (mode !== "signup") return;
    const search = new URLSearchParams(window.location.search);
    const code = search.get("inviteCode");
    if (code && !inviteCode) setInviteCode(code);
  }, [mode, inviteCode]);

  // Validate invite code on change (signup only)
  useEffect(() => {
    if (mode !== "signup" || !inviteCode.trim()) {
      setInviteValid(null);
      return;
    }
    
    setCheckingInvite(true);
    
    // Debounce to avoid spamming Supabase on every keystroke
    const timeout = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("referral_code")
          .eq("referral_code", inviteCode.trim().toUpperCase())
          .maybeSingle();
        
        console.log("Invite validation result:", { data, error, searchCode: inviteCode.trim().toUpperCase() });
        
        if (error) {
          console.error("Error validating invite code:", error);
          setInviteValid(false);
        } else {
          setInviteValid(!!data);
        }
      } catch (err) {
        console.error("Exception validating invite code:", err);
        setInviteValid(false);
      }
      setCheckingInvite(false);
    }, 300);
    
    return () => clearTimeout(timeout);
  }, [inviteCode, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const redirectUrl = `${window.location.origin}/`;

    if (mode === 'signup') {
      // Require valid invite code
      if (!inviteCode.trim()) {
        setIsLoading(false);
        setError('Invite code is required to sign up.');
        toast({ title: "No Invite Code", description: "Please enter your invite code.", variant: "destructive" });
        return;
      }
      if (!inviteValid) {
        setIsLoading(false);
        setError('Invalid invite code.');
        toast({ title: "Invalid Invite Code", description: "Please check your code and try again.", variant: "destructive" });
        return;
      }
      
      // Signup via Supabase
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
      toast({ title: "Signup Successful", description: "Please check your email to verify your account." });

      // Wait for the new user session, then update their profile with the invite code
      const pollSession = async (tries = 0) => {
        console.log(`Polling for session, attempt ${tries + 1}`);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user?.id) {
          console.log("Session found, updating profile with invite code:", inviteCode.trim().toUpperCase());
          
          // Update profile with invite code to trigger the referral system
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ invite_code: inviteCode.trim().toUpperCase() })
            .eq('id', session.user.id);
            
          if (updateError) {
            console.error("Error updating profile with invite code:", updateError);
            toast({ title: "Warning", description: "Account created but invite code processing failed.", variant: "destructive" });
          } else {
            console.log("Profile updated successfully with invite code");
            toast({ title: "Success!", description: "Account created and invite code applied. You both earned 50 Kelp Points!" });
          }
          
          onSuccess();
        } else if (tries < 15) {
          setTimeout(() => pollSession(tries + 1), 500);
        } else {
          console.error("Failed to get session after multiple attempts");
          toast({ title: "Warning", description: "Account created but please log in manually.", variant: "destructive" });
          onSuccess();
        }
      };
      pollSession();
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
        toast({ title: "Login Failed", description: signInError.message, variant: "destructive" });
      } else {
        onSuccess();
      }
      setIsLoading(false);
    }
    setIsLoading(false);
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
          {mode === "signup" && (
            <div>
              <Label htmlFor="invite-code" className="text-gray-700 flex items-center">
                <Gift className="inline-block w-5 h-5 mr-2 text-green-400" />
                Invite Code
              </Label>
              <div className="relative mt-1">
                <Input
                  id="invite-code"
                  autoFocus
                  placeholder="e.g. FRIEND123"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  required
                  className={`pl-3 ${inviteValid === false ? 'border-red-500' : inviteValid === true ? 'border-green-500' : ''}`}
                  disabled={isLoading}
                />
                {inviteCode && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold"
                        style={{ color: inviteValid === true ? "#16a34a" : inviteValid === false ? "#e11d48" : "#64748b" }}>
                    {checkingInvite ? "…" : inviteValid === true ? "Valid" : inviteValid === false ? "Invalid" : ""}
                  </span>
                )}
              </div>
            </div>
          )}
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
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>
          </div>
          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={isLoading || (mode === 'signup' && (!inviteCode || !inviteValid))}>
            {isLoading ? 'Processing...' : (mode === 'signup' ? 'Sign Up' : 'Login')}
            {mode === 'signup' ? <UserPlus className="ml-2 w-5 h-5" /> : <LogIn className="ml-2 w-5 h-5" />}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;
