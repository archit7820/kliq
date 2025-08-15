
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { Users, UserCheck, UserMinus, Bell, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

type FriendReq = {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
  profile?: { full_name: string | null; username: string | null; avatar_url: string | null };
};

const FriendRequests = () => {
  const { user } = useAuthStatus();
  const [reqs, setReqs] = useState<FriendReq[]>([]);
  const [loading, setLoading] = useState(false);
  const [responding, setResponding] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    // Get incoming friend requests
    supabase
      .from("friend_requests")
      .select("*")
      .eq("receiver_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .then(async ({ data, error }) => {
        if (error || !data) {
          setReqs([]);
          setLoading(false);
          return;
        }
        // Fetch sender profiles
        const senderIds = data.map(r => r.sender_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, username, avatar_url")
          .in("id", senderIds);
        const reqsWithProfile = data.map(r => {
          const profile = profiles?.find(pr => pr.id === r.sender_id);
          return { ...r, profile };
        });
        setReqs(reqsWithProfile);
        setLoading(false);
      });

    // Subscribe to friend_requests for realtime UI updates
    const channel = supabase
      .channel(`friend_requests-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friend_requests",
          filter: `receiver_id=eq.${user.id}`
        },
        () => {
          // Refetch requests on update/insert/delete
          supabase
            .from("friend_requests")
            .select("*")
            .eq("receiver_id", user.id)
            .eq("status", "pending")
            .order("created_at", { ascending: false })
            .then(async ({ data, error }) => {
              if (error || !data) {
                setReqs([]);
                return;
              }
              const senderIds = data.map(r => r.sender_id);
              const { data: profiles } = await supabase
                .from("profiles")
                .select("id, full_name, username, avatar_url")
                .in("id", senderIds);
              const reqsWithProfile = data.map(r => {
                const profile = profiles?.find(pr => pr.id === r.sender_id);
                return { ...r, profile };
              });
              setReqs(reqsWithProfile);
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Accept/decline actions
  const handleRespond = async (req: FriendReq, accept: boolean) => {
    if (!user) return;
    setResponding(req.id);
    
    const newStatus = accept ? "accepted" : "declined";

    try {
      // First, update the friend request status
      const { error: updateError } = await supabase
        .from("friend_requests")
        .update({ status: newStatus })
        .eq("id", req.id);

      if (updateError) throw updateError;

      // If accepted, create the friendship
      if (accept) {
        const { error: insertError } = await supabase
          .from("friends")
          .insert({ user1_id: user.id, user2_id: req.sender_id });

        if (insertError) throw insertError;
      }

      setReqs((prev) => prev.filter(r => r.id !== req.id));
      
      // Invalidate queries for friends and friend requests to auto-refresh list and feed
      queryClient.invalidateQueries({ queryKey: ["friendsProfiles"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      
      toast({
        title: accept ? "Friend Added!" : "Request Declined",
        description: (
          accept ? `You are now friends with @${req.profile?.username || 'user'}.` : "This request was declined."
        ),
        variant: accept ? "default" : "destructive",
      });
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: `Failed to respond to request: ${error.message}`, 
        variant: "destructive" 
      });
    } finally {
      setResponding(null);
    }
  };

  return (
    <section className="space-y-3 sm:space-y-4">
      {/* Mobile-optimized header */}
      <div className="flex items-center gap-2 sm:gap-3 px-1">
        <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg">
          <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-xl font-semibold text-foreground">Friend Requests</h2>
            {reqs.length > 0 && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                {reqs.length} pending
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Smart suggestions</span>
          </div>
        </div>
      </div>

      {/* Mobile-optimized loading state */}
      {loading && (
        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 animate-pulse">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-full" />
              <div className="flex-1 space-y-1 sm:space-y-2">
                <div className="h-3 sm:h-4 bg-muted rounded w-1/3" />
                <div className="h-2 sm:h-3 bg-muted rounded w-1/4" />
              </div>
              <div className="flex gap-1 sm:gap-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-muted rounded" />
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-muted rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mobile-optimized empty state */}
      {!loading && reqs.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="p-6 sm:p-8 text-center">
            <div className="p-2 sm:p-3 bg-muted rounded-full w-fit mx-auto mb-3 sm:mb-4">
              <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-1 sm:mb-2 text-sm sm:text-base">No pending requests</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">New friend requests will appear here when received.</p>
          </CardContent>
        </Card>
      )}

      {/* Mobile-optimized requests */}
      <div className="space-y-2 sm:space-y-3">
        {reqs.map(req => (
          <Card key={req.id} className="hover:shadow-md transition-all duration-200 border-border/50">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Avatar */}
                {req.profile?.avatar_url ? (
                  <img
                    src={req.profile.avatar_url}
                    alt="avatar"
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-border object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted flex items-center justify-center">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                  </div>
                )}
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate text-sm sm:text-base">
                    {req.profile?.full_name || req.profile?.username || "User"}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">@{req.profile?.username || ""}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">Wants to connect with you</p>
                </div>
                
                {/* Actions */}
                <div className="flex gap-1 sm:gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleRespond(req, true)}
                    disabled={responding === req.id}
                    className="bg-green-600 hover:bg-green-700 text-white h-8 px-2 sm:h-9 sm:px-3 text-xs touch-manipulation"
                  >
                    {responding === req.id ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <UserCheck className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                        <span className="hidden sm:inline">Accept</span>
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRespond(req, false)}
                    disabled={responding === req.id}
                    className="text-muted-foreground border-border hover:bg-muted h-8 px-2 sm:h-9 sm:px-3 text-xs touch-manipulation"
                  >
                    <UserMinus className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                    <span className="hidden sm:inline">Decline</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default FriendRequests;
