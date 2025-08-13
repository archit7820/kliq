import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Users, Lock, Key, Globe } from "lucide-react";

interface CommunityJoinModalProps {
  community: {
    id: string;
    name: string;
    description?: string;
    privacy_type: 'public' | 'private' | 'invite_only';
    invite_code?: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

export default function CommunityJoinModal({ 
  community, 
  isOpen, 
  onClose, 
  onSuccess,
  userId 
}: CommunityJoinModalProps) {
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  const handleJoin = async () => {
    setLoading(true);
    
    try {
      let status = 'approved';
      
      // Check if invite code is required and validate it
      if (community.privacy_type === 'invite_only') {
        if (!inviteCode.trim()) {
          toast({
            title: "Invite code required",
            description: "Please enter the invite code to join this community.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        
        // Verify invite code
        const { data: communityData } = await supabase
          .from('communities')
          .select('invite_code')
          .eq('id', community.id)
          .eq('invite_code', inviteCode.toUpperCase())
          .single();
          
        if (!communityData) {
          toast({
            title: "Invalid invite code",
            description: "The invite code you entered is not valid.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
      } else if (community.privacy_type === 'private') {
        status = 'pending';
      }

      // Join the community
      const { error } = await supabase
        .from('community_memberships')
        .insert({
          user_id: userId,
          community_id: community.id,
          status
        });

      if (error) {
        toast({
          title: "Failed to join",
          description: error.message,
          variant: "destructive"
        });
      } else {
        if (status === 'pending') {
          toast({
            title: "Request sent!",
            description: "Your request to join has been sent to the community admin.",
          });
        } else {
          toast({
            title: "Welcome!",
            description: `You've successfully joined ${community.name}.`,
          });
        }
        onSuccess();
        onClose();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  const getIcon = () => {
    switch (community.privacy_type) {
      case 'public': return <Globe className="w-5 h-5 text-green-500" />;
      case 'private': return <Lock className="w-5 h-5 text-orange-500" />;
      case 'invite_only': return <Key className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (community.privacy_type) {
      case 'public': return 'Anyone can join';
      case 'private': return 'Requires admin approval';
      case 'invite_only': return 'Invite code required';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Join Community
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Community Info */}
          <div className="bg-muted/50 rounded-xl p-4">
            <h3 className="font-medium text-lg">{community.name}</h3>
            {community.description && (
              <p className="text-sm text-muted-foreground mt-1">{community.description}</p>
            )}
            
            <div className="flex items-center gap-2 mt-3 text-sm">
              {getIcon()}
              <span className="text-muted-foreground">{getStatusText()}</span>
            </div>
          </div>

          {/* Invite Code Input */}
          {community.privacy_type === 'invite_only' && (
            <div className="space-y-2">
              <Label htmlFor="inviteCode">Invite Code</Label>
              <Input
                id="inviteCode"
                placeholder="Enter invite code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="uppercase placeholder:normal-case"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleJoin} disabled={loading} className="flex-1">
              {loading ? "Joining..." : 
               community.privacy_type === 'private' ? "Request to Join" : "Join"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}