
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Send, Loader2, Users } from "lucide-react";
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
        <Button className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto">
          <Mail className="w-4 h-4 mr-2" />
          <span className="sm:inline">Invite via Email</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md mx-4 sm:mx-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            Invite Friends to Kelp
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSendInvite} className="space-y-3 sm:space-y-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Friend's Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="friend@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="text-sm"
            />
          </div>
          
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="message" className="text-sm font-medium">Personal Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a personal touch to your invitation..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="text-sm resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="order-2 sm:order-1 flex-1 text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={sending || !email.trim()}
              className="order-1 sm:order-2 flex-1 bg-green-600 hover:bg-green-700 text-white text-sm"
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
