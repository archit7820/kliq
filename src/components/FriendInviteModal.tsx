
import React, { useState } from "react";
import { Dialog } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Copy, MailPlus, X, LoaderCircle, RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStatus } from "@/hooks/useAuthStatus";

// Helper to generate a new code and persist
const generateReferralCode = async (userId: string): Promise<string | null> => {
  const randomCode = Math.random().toString(36).slice(2, 10).toUpperCase();
  const { error } = await supabase
    .from("profiles")
    .update({ referral_code: randomCode })
    .eq("id", userId);
  if (error) return null;
  return randomCode;
};

const fetchOrGenerateReferralCode = async (userId: string): Promise<string | null> => {
  // Try to fetch code first
  const { data, error } = await supabase
    .from("profiles")
    .select("referral_code")
    .eq("id", userId)
    .single();

  let code = data?.referral_code || null;
  // If missing, generate and save
  if (!code) {
    code = await generateReferralCode(userId);
  }
  return code;
};

const FriendInviteModal = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { user } = useAuthStatus();
  const [inviteCode, setInviteCode] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  const fetchReferralCode = async () => {
    if (user) {
      setLoading(true);
      setErrorMsg("");
      const code = await fetchOrGenerateReferralCode(user.id);
      if (!code) setErrorMsg("Could not get your invite code. Try again.");
      setInviteCode(code);
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (open && user) {
      fetchReferralCode();
    }
    // eslint-disable-next-line
  }, [open, user]);

  const handleCopy = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      toast({
        title: "Copied Invite Code!",
        description: "Share this with your friends so you both earn 50 Kelp Points!",
      });
    }
  };

  const handleRegenerate = async () => {
    if (!user) return;
    setLoading(true);
    setErrorMsg("");
    const code = await generateReferralCode(user.id);
    if (!code) setErrorMsg("Could not generate invite code");
    setInviteCode(code);
    setLoading(false);
    toast({
      title: "Invite code regenerated!",
      description: "Your new code is ready to share.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
        <div className="relative w-full max-w-xs bg-white rounded-2xl shadow-2xl p-6 mx-4 animate-fade-in border border-gray-100">
          <button
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex flex-col items-center gap-2">
            <MailPlus className="w-10 h-10 text-green-600 mb-1" />
            <h2 className="font-bold text-lg text-green-700 mb-1">
              Invite a Friend
            </h2>
            <p className="text-gray-500 text-center text-sm mb-1">
              Share your invite code. When a friend joins with it, <b>you both receive 50 Kelp Points!</b>
            </p>
            <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-xl font-mono text-lg text-green-800">
              {loading ? (
                <LoaderCircle className="animate-spin w-5 h-5 text-gray-400" />
              ) : inviteCode ? (
                <>
                  <span data-testid="invite-code">{inviteCode}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-1"
                    disabled={!inviteCode}
                    onClick={handleCopy}
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
                <span className="text-red-500">{errorMsg || "No code"}</span>
              )}
            </div>
            <Button
              className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl"
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
            <div className="mt-2 text-xs text-green-700 text-center">
              Every successful invite scores both accounts <b>50 Kelp Points!</b>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default FriendInviteModal;
