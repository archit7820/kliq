
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { User, MessageCircle, Users, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

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

  if (!user) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Users className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Your Friends</h2>
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Sparkles className="w-4 h-4" />
          <span>AI-enhanced connections</span>
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
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && friends.length === 0 && (
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="p-8 text-center">
            <div className="p-3 bg-gray-100 rounded-full w-fit mx-auto mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">No friends yet</h3>
            <p className="text-sm text-gray-500">Start connecting with people who share your interests!</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {friends.map((f) => {
          const friendId = f.user1_id === user.id ? f.user2_id : f.user1_id;
          return (
            <Card key={f.id} className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {f.profile?.avatar_url ? (
                    <img
                      src={f.profile.avatar_url}
                      alt="avatar"
                      className="w-12 h-12 rounded-full border-2 border-gray-100 object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {f.profile?.full_name || f.profile?.username || "User"}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">@{f.profile?.username}</p>
                  </div>
                  <Link 
                    to={`/chat/${friendId}`} 
                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Send message"
                  >
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                  </Link>
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
