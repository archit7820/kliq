
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Send, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStatus } from "@/hooks/useAuthStatus";

const EmailInviteDialog = () => {
  const { user } = useAuthStatus();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !email.trim()) return;
    
    setSending(true);
    try {
      // Get user's profile for invite code
      const { data: profile } = await supabase
        .from("profiles")
        .select("referral_code, full_name, username")
        .eq("id", user.id)
        .single();

      if (!profile?.referral_code) {
        toast({
          title: "Error",
          description: "Unable to generate invite code. Please try again.",
          variant: "destructive"
        });
        return;
      }

      const inviteUrl = `${window.location.origin}/signup?inviteCode=${profile.referral_code}`;
      const personalMessage = message.trim() 
        ? `\n\nPersonal message: "${message}"`
        : "";

      // For now, we'll copy to clipboard - in production you'd send via email service
      const fullMessage = `Hi! ${profile.full_name || profile.username || 'A friend'} has invited you to join Kelp, the eco-friendly social platform!

Join using this link: ${inviteUrl}${personalMessage}

Kelp helps you track your environmental impact, connect with like-minded people, and make a positive difference together. 🌱`;

      await navigator.clipboard.writeText(fullMessage);
      
      toast({
        title: "Invite Ready!",
        description: "Invite message copied to clipboard. Share it with your friend!",
      });

      setEmail("");
      setMessage("");
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to prepare invite. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <Mail className="w-4 h-4 mr-2" />
          Invite via Email
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-green-600" />
            Invite Friends to Kelp
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSendInvite} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Friend's Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="friend@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Personal Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a personal touch to your invitation..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={sending || !email.trim()}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Preparing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Invite
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmailInviteDialog;
