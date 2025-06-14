
import React, { useState } from "react";
import { Dialog } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Copy, MailPlus, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStatus } from "@/hooks/useAuthStatus";

const FriendInviteModal = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { user } = useAuthStatus();
  const [inviteCode, setInviteCode] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (open && user && !inviteCode) {
      setLoading(true);
      supabase
        .from("profiles")
        .select("referral_code")
        .eq("id", user.id)
        .single()
        .then(({ data, error }) => {
          setInviteCode(data?.referral_code || null);
          setLoading(false);
        });
    }
  }, [open, user, inviteCode]);

  const handleCopy = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      toast({ title: "Copied!", description: "Invite code copied to clipboard." });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
        <div className="relative w-full max-w-xs bg-white rounded-2xl shadow-2xl p-6 mx-4 animate-fade-in border border-gray-100">
          <button className="absolute right-3 top-3 text-gray-400 hover:text-gray-600" onClick={() => onOpenChange(false)}>
            <X className="w-5 h-5" />
          </button>
          <div className="flex flex-col items-center gap-2">
            <MailPlus className="w-10 h-10 text-green-600 mb-1" />
            <h2 className="font-bold text-lg text-green-700 mb-1">Invite a Friend</h2>
            <p className="text-gray-500 text-center text-sm mb-1">
              Share your invite code for them to join!
            </p>
            <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-xl font-mono text-lg text-green-800">
              {loading ? (
                <span className="text-gray-400 italic">Loading…</span>
              ) : (
                <span data-testid="invite-code">{inviteCode || "No code"}</span>
              )}
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
            </div>
            <Button
              className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl"
              onClick={() => {
                if (inviteCode) {
                  navigator.clipboard.writeText(`Join me on Kelp! Use my invite code: ${inviteCode} https://kelp.lovable.app/invite`);
                  toast({ title: "Copied!", description: "Invite message copied. Paste it in any chat!" });
                }
              }}
              disabled={!inviteCode}
            >
              Share Invite
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default FriendInviteModal;
