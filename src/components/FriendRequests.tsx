
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { Users, UserCheck, UserMinus, UserPlus, Bell, Sparkles } from "lucide-react";
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

    // Subscribe to friend_requests for realtime UI updates (optional)
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
    const newStatus = accept ? "accepted" : "declined";

    // First, update the friend request status
    const { error: updateError } = await supabase
      .from("friend_requests")
      .update({ status: newStatus })
      .eq("id", req.id);

    if (updateError) {
      toast({ title: "Error", description: `Failed to respond to request: ${updateError.message}`, variant: "destructive" });
      return;
    }

    // If accepted, create the friendship
    if (accept) {
      const { error: insertError } = await supabase
        .from("friends")
        .insert({ user1_id: user.id, user2_id: req.sender_id });

      if (insertError) {
        toast({ title: "Error", description: `Failed to create friendship: ${insertError.message}`, variant: "destructive" });
        return;
      }
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
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-orange-100 rounded-lg">
          <Bell className="w-5 h-5 text-orange-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Friend Requests</h2>
        {reqs.length > 0 && (
          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
            {reqs.length} pending
          </Badge>
        )}
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Sparkles className="w-4 h-4" />
          <span>Smart suggestions</span>
        </div>
      </div>

      {loading && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded" />
                <div className="w-8 h-8 bg-gray-200 rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && reqs.length === 0 && (
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="p-8 text-center">
            <div className="p-3 bg-gray-100 rounded-full w-fit mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">No pending requests</h3>
            <p className="text-sm text-gray-500">New friend requests will appear here when received.</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {reqs.map(req => (
          <Card key={req.id} className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {req.profile?.avatar_url ? (
                  <img
                    src={req.profile.avatar_url}
                    alt="avatar"
                    className="w-12 h-12 rounded-full border-2 border-gray-100 object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {req.profile?.full_name || req.profile?.username || "User"}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">@{req.profile?.username || ""}</p>
                  <p className="text-xs text-gray-400 mt-1">Wants to connect with you</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleRespond(req, true)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <UserCheck className="w-4 h-4 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRespond(req, false)}
                    className="text-gray-600 border-gray-300 hover:bg-gray-50"
                  >
                    <UserMinus className="w-4 h-4 mr-1" />
                    Decline
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
