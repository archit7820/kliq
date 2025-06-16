
import React, { useState, useEffect } from "react";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Sparkles, Copy, LoaderCircle, RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const InviteFlow = () => {
  const { user, loading } = useAuthStatus();

  // --- For Authenticated User (sharing)
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);
  const [codeError, setCodeError] = useState("");

  // --- For Unauthenticated User (join with code)
  const [joinCode, setJoinCode] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Fetch referral code for logged-in user
  useEffect(() => {
    const fetchCode = async () => {
      if (!user) return;
      setFetching(true);
      setCodeError("");
      const { data, error } = await supabase
        .from("profiles")
        .select("referral_code")
        .eq("id", user.id)
        .maybeSingle();
      if (error || !data?.referral_code) {
        setCodeError("Couldn't load your invite code.");
        setInviteCode(null);
      } else {
        setInviteCode(data.referral_code);
      }
      setFetching(false);
    };
    if (user) fetchCode();
  }, [user]);

  // Handler to copy code to clipboard for logged-in
  const handleCopyCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      toast({
        title: "Copied!",
        description: "Your invite code is ready to share.",
      });
    }
  };

  // Handler to regenerate referral code
  const handleRegenerate = async () => {
    if (!user) return;
    setFetching(true);
    setCodeError("");
    // Generate random code
    const randomCode = Math.random().toString(36).slice(2, 10).toUpperCase();
    const { error } = await supabase
      .from("profiles")
      .update({ referral_code: randomCode })
      .eq("id", user.id);
    if (error) setCodeError("Could not generate invite code. Try again.");
    setInviteCode(error ? inviteCode : randomCode);
    setFetching(false);
    if (!error)
      toast({
        title: "Invite code regenerated!",
        description: "Your new code is ready to share.",
      });
  };

  // --- Unauthenticated: Handle joining with code
  const validateInviteCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsChecking(true);

    try {
      const searchCode = joinCode.trim().toUpperCase();
      console.log("Validating invite code:", searchCode);

      const { data, error: supabaseError } = await supabase
        .from("profiles")
        .select("referral_code, id, username")
        .eq("referral_code", searchCode)
        .maybeSingle();

      console.log("Invite validation result:", { data, error: supabaseError, searchCode });

      if (supabaseError) {
        console.error("Error validating invite code:", supabaseError);
        setError("Something went wrong, try again.");
        setIsChecking(false);
        return;
      }
      
      if (!data) {
        console.log("No user found with referral code:", searchCode);
        setError("Invalid invite code. Please check and try again.");
        setIsChecking(false);
        return;
      }
      
      console.log("Valid invite code found for user:", data.username || data.id);
      setSuccess(true);
      toast({ title: "Invite Accepted!", description: "Welcome to Kelp!" });
      setTimeout(() => {
        window.location.href = `/signup?inviteCode=${searchCode}`;
      }, 900);
    } catch (err) {
      console.error("Exception validating invite code:", err);
      setError("Something went wrong, try again.");
    }
    
    setIsChecking(false);
  };

  // Loading UI
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-green-100 to-blue-50">
        <LoaderCircle className="w-8 h-8 animate-spin text-green-500 mr-3" />
        <span className="text-xl text-green-700">Loading…</span>
      </div>
    );
  }

  // Authenticated: Show invite code and share options
  if (user) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-b from-green-100 to-blue-50 p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
          <Sparkles className="w-12 h-12 text-green-600 mb-5 animate-pulse" />
          <h1 className="text-2xl font-bold text-green-800 mb-2 text-center">Share Your Kelp Invite Code</h1>
          <p className="text-gray-600 text-center mb-4">
            Give your invite code to friends! When they join, you both earn 50 Kelp Points.
          </p>
          <div className="flex items-center gap-2 bg-gray-100 px-5 py-3 rounded-xl font-mono text-xl text-green-800 mb-3 select-all">
            {fetching ? (
              <LoaderCircle className="animate-spin w-5 h-5 text-gray-400" />
            ) : inviteCode ? (
              <>
                <span data-testid="invite-code">{inviteCode}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-1"
                  disabled={!inviteCode}
                  onClick={handleCopyCode}
                  title="Copy"
                >
                  <Copy className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRegenerate}
                  title="Regenerate code"
                >
                  <RefreshCw className="w-5 h-5" />
                </Button>
              </>
            ) : (
              <span className="text-red-600">{codeError || "No code"}</span>
            )}
          </div>
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl"
            onClick={() => {
              if (inviteCode) {
                navigator.clipboard.writeText(
                  `Join me on Kelp! Use my invite code: ${inviteCode} https://kelp.lovable.app/invite`
                );
                toast({
                  title: "Invite Copied",
                  description:
                    "The invite message is ready to paste in any chat. You both get 50 Kelp Points!",
                });
              }
            }}
            disabled={!inviteCode}
          >
            Share Invite Message
          </Button>
          <div className="mt-3 text-xs text-green-700 text-center">
            Every successful invite earns both of you 50 Kelp Points!
          </div>
        </div>
        <div className="mt-8 text-center text-sm text-gray-400 max-w-xs leading-relaxed">
          Want more connections? Invite more friends!
        </div>
      </div>
    );
  }

  // Unauthenticated: show original join form
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-b from-green-100 to-blue-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
        <Sparkles className="w-12 h-12 text-green-600 mb-5 animate-pulse" />
        <h1 className="text-2xl font-bold text-green-800 mb-2 text-center">Kelp Invite</h1>
        <p className="text-gray-600 text-center mb-6">
          Enter your invite code to access climate-positive actions, rewards, and community!
        </p>
        <form onSubmit={validateInviteCode} className="w-full space-y-3">
          <Input
            id="invite-code"
            autoFocus
            placeholder="Enter invite code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            disabled={isChecking || success}
            className="text-lg"
          />
          {error && (
            <div className="flex items-center text-red-600 bg-red-50 px-3 py-2 rounded-md text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {error}
            </div>
          )}
          <Button
            type="submit"
            className={`w-full bg-green-600 hover:bg-green-700 text-white font-semibold transition ${success ? "animate-bounce" : ""}`}
            disabled={isChecking || !joinCode.trim()}
          >
            {isChecking ? "Checking..." : success ? "Accepted!" : "Continue"}
          </Button>
        </form>
      </div>
      <div className="mt-8 text-center text-sm text-gray-400 max-w-xs leading-relaxed">
        Want access? Watch for community drops or ask a friend for an invite!
      </div>
    </div>
  );
};

export default InviteFlow;
