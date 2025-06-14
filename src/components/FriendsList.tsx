
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { User } from "lucide-react";

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

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from("friends")
      .select("*")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .then(async ({ data, error }) => {
        if (error) return;
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
      });
  }, [user]);

  if (!user) return null;

  return (
    <section>
      <h2 className="font-semibold text-lg mb-2">Your Friends</h2>
      <div className="space-y-2">
        {loading && <div className="text-gray-400">Loading...</div>}
        {!loading && friends.length === 0 && (
          <div className="text-gray-400 text-sm">No friends yet. Add some friends!</div>
        )}
        {friends.map((f) => (
          <div key={f.id} className="bg-white rounded-md shadow px-4 py-3 flex items-center gap-3">
            {f.profile?.avatar_url
              ? <img src={f.profile.avatar_url} alt="avatar" className="w-8 h-8 rounded-full" />
              : <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
            }
            <span className="font-medium">{f.profile?.full_name || f.profile?.username || "User"}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FriendsList;

