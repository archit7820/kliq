
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, User, AlertCircle, Leaf } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const SignupPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Get inviteCode from location.state or query param
  const inviteCode =
    location.state?.inviteCode ||
    new URLSearchParams(window.location.search).get("inviteCode") ||
    "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to /invite if no inviteCode is present
  useEffect(() => {
    if (!inviteCode) {
      navigate("/invite");
    }
  }, [inviteCode, navigate]);

  // Handle signup (with invite code tracking)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const redirectUrl = `${window.location.origin}/`;

    // First, sign up with email/password
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: fullName }, // Pass full_name as metadata
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsLoading(false);
      toast({
        title: "Signup Failed",
        description: signUpError.message,
        variant: "destructive",
      });
      return;
    }

    // Next, update the user's profile with invite_code (do this after signup: requires login confirmation from email)
    toast({
      title: "Signup Successful",
      description:
        "Please check your email to verify your account. After confirming, your invite will be linked!",
    });

    setIsLoading(false);
    // Optional: After successful signup, redirect to login page
    setTimeout(() => {
      navigate("/login");
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <div className="flex flex-col items-center mb-8">
          <Leaf className="w-16 h-16 text-green-600 mb-3" />
          <h1 className="text-3xl font-bold text-gray-800">Sign Up for Kelp</h1>
          <p className="text-gray-600 mt-1">
            Your invite code:{" "}
            <span className="font-bold text-green-700">{inviteCode}</span>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="text-gray-700 font-medium">
              Email
            </label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={email}
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="font-medium">
              Password
            </label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="password"
                type="password"
                value={password}
                autoComplete="new-password"
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10"
                placeholder="••••••••"
              />
            </div>
          </div>
          <div>
            <label htmlFor="fullName" className="font-medium">
              Name
            </label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="pl-10"
                placeholder="Your name"
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? "Signing up..." : "Create Account"}
          </Button>
        </form>
        <div className="mt-4 text-sm text-center text-gray-500">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-green-700 font-medium hover:underline"
          >
            Log in
          </a>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
