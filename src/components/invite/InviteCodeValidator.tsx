
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";

interface InviteCodeValidatorProps {
  onSuccess: () => void;
}

const InviteCodeValidator: React.FC<InviteCodeValidatorProps> = ({ onSuccess }) => {
  const [joinCode, setJoinCode] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

  return (
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
  );
};

export default InviteCodeValidator;
