
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserMinus, MoreHorizontal, MessageCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

type FriendManagementProps = {
  friendId: string;
  friendName: string;
  friendUsername: string;
  onFriendRemoved: () => void;
};

const FriendManagement: React.FC<FriendManagementProps> = ({
  friendId,
  friendName,
  friendUsername,
  onFriendRemoved
}) => {
  const { user } = useAuthStatus();
  const [open, setOpen] = useState(false);
  const [removing, setRemoving] = useState(false);

  const handleRemoveFriend = async () => {
    if (!user) return;
    
    setRemoving(true);
    try {
      // Remove friendship (works for both directions due to OR condition in query)
      const { error } = await supabase
        .from("friends")
        .delete()
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${friendId}),and(user1_id.eq.${friendId},user2_id.eq.${user.id})`);

      if (error) throw error;

      toast({
        title: "Friend Removed",
        description: `You are no longer friends with ${friendName || friendUsername}.`,
      });

      onFriendRemoved();
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove friend. Please try again.",
        variant: "destructive"
      });
    } finally {
      setRemoving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-accent h-8 w-8 sm:h-10 sm:w-10 touch-manipulation">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md mx-4 sm:mx-0">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Manage Friendship</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 sm:space-y-4">
          <div className="text-center py-2 sm:py-4">
            <p className="text-muted-foreground mb-3 sm:mb-4 text-sm">
              What would you like to do with <span className="font-medium">{friendName || friendUsername}</span>?
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:gap-3">
            <Link 
              to={`/chat/${friendId}`}
              className="w-full"
              onClick={() => setOpen(false)}
            >
              <Button variant="outline" className="w-full justify-start text-sm">
                <MessageCircle className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </Link>

            <Button
              variant="outline"
              onClick={handleRemoveFriend}
              disabled={removing}
              className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 text-sm"
            >
              {removing ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <UserMinus className="w-4 h-4 mr-2" />
                  Remove Friend
                </>
              )}
            </Button>
          </div>

          <div className="flex justify-end pt-2 sm:pt-4 border-t">
            <Button variant="ghost" onClick={() => setOpen(false)} className="text-sm">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FriendManagement;
