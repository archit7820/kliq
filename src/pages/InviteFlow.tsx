
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Sparkles } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const InviteFlow = () => {
  const [inviteCode, setInviteCode] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const validateInviteCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsChecking(true);

    const { data, error: supabaseError } = await supabase
      .from("invites")
      .select("code")
      .eq("code", inviteCode.trim())
      .eq("is_active", true)
      .single();

    setIsChecking(false);

    if (supabaseError) {
      setError("Something went wrong, try again.");
      return;
    }
    if (!data) {
      setError("Invalid or inactive invite code.");
      return;
    }
    setSuccess(true);
    toast({ title: "Invite Accepted!", description: "Welcome to Kelp!" });
    // Redirect to /signup with inviteCode in state/query
    setTimeout(() => {
      window.location.href = `/signup?inviteCode=${inviteCode.trim()}`;
      // or: navigate("/signup", { state: { inviteCode } });
    }, 900);
  };

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
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
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
            disabled={isChecking || !inviteCode.trim()}
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
