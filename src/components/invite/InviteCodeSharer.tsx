
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, LoaderCircle, RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStatus } from "@/hooks/useAuthStatus";

const InviteCodeSharer: React.FC = () => {
  const { user } = useAuthStatus();
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);
  const [codeError, setCodeError] = useState("");

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

  return (
    <>
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
    </>
  );
};

export default InviteCodeSharer;
