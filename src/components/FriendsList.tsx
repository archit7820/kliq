
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { User, MessageCircle, Users, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import FriendManagement from "./FriendManagement";

type Friend = {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  profile?: { full_name: string | null; username: string | null; avatar_url: string | null };
};

const DEFAULT_PROFILE = {
  full_name: null,
  username: null,
  avatar_url: null,
};

const FriendsList = () => {
  const { user } = useAuthStatus();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);

  // Real-time: friends list subscription
  useEffect(() => {
    if (!user) return;

    // Subscribe to friends table changes where current user is either user1 or user2
    const channel1 = supabase
      .channel(`friends-user1-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friends",
          filter: `user1_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("FriendsList: real-time event for user1_id", payload);
          fetchFriends();
        }
      )
      .subscribe();

    const channel2 = supabase
      .channel(`friends-user2-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friends",
          filter: `user2_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("FriendsList: real-time event for user2_id", payload);
          fetchFriends();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel1);
      supabase.removeChannel(channel2);
    };
    // eslint-disable-next-line
  }, [user]);

  const fetchFriends = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("friends")
      .select("*")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

    if (error) {
      setFriends([]);
      setLoading(false);
      return;
    }
    const friendIds = (data || []).map(
      f => f.user1_id === user.id ? f.user2_id : f.user1_id
    );
    if (!friendIds.length) {
      setFriends([]);
      setLoading(false);
      return;
    }
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, username, avatar_url")
      .in("id", friendIds);
    const friendsWithProfile = (data || []).map(f => {
      const fid = f.user1_id === user.id ? f.user2_id : f.user1_id;
      const profile = profiles?.find((p) => p.id === fid) || DEFAULT_PROFILE;
      return { ...f, profile };
    });
    setFriends(friendsWithProfile);
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    fetchFriends();
    // eslint-disable-next-line
  }, [user]);

  const handleFriendRemoved = () => {
    fetchFriends(); // Refresh the friends list
  };

  if (!user) return null;

  return (
    <section className="space-y-3 px-1">
      {/* Mobile-optimized header */}
      <div className="flex items-center gap-2 px-1">
        <div className="p-1 bg-primary/10 rounded-lg">
          <Users className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-foreground truncate">Your Friends</h2>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Sparkles className="w-3 h-3" />
            <span>AI-enhanced connections</span>
          </div>
        </div>
      </div>

      {/* Mobile-optimized loading state */}
      {loading && (
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 animate-pulse">
              <div className="w-10 h-10 bg-muted rounded-full" />
              <div className="flex-1 space-y-1">
                <div className="h-3 bg-muted rounded w-1/3" />
                <div className="h-2 bg-muted rounded w-1/4" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mobile-optimized empty state */}
      {!loading && friends.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="p-4 text-center">
            <div className="p-2 bg-muted rounded-full w-fit mx-auto mb-3">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-1 text-sm">No friends yet</h3>
            <p className="text-xs text-muted-foreground">Start connecting with people who share your interests!</p>
          </CardContent>
        </Card>
      )}

      {/* Mobile-optimized friends grid */}
      <div className="space-y-2">
        {friends.map((f) => {
          const friendId = f.user1_id === user.id ? f.user2_id : f.user1_id;
          return (
            <Card key={f.id} className="hover:shadow-md transition-all duration-200 border-border/50">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  {/* Mobile-optimized avatar */}
                  {f.profile?.avatar_url ? (
                    <img
                      src={f.profile.avatar_url}
                      alt="avatar"
                      className="w-10 h-10 rounded-full border border-border object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  
                  {/* Mobile-optimized content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate text-sm">
                      {f.profile?.full_name || f.profile?.username || "User"}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      @{f.profile?.username}
                    </p>
                  </div>
                  
                  {/* Mobile-optimized actions */}
                  <div className="flex items-center gap-1">
                    <Link 
                      to={`/chat/${friendId}`} 
                      className="p-2 hover:bg-accent rounded-lg transition-colors touch-manipulation"
                      title="Send message"
                    >
                      <MessageCircle className="w-4 h-4 text-primary" />
                    </Link>
                    <FriendManagement
                      friendId={friendId}
                      friendName={f.profile?.full_name || ""}
                      friendUsername={f.profile?.username || ""}
                      onFriendRemoved={handleFriendRemoved}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
};

export default FriendsList;
