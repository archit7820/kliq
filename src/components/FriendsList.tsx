
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { User, Mail, UsersRound } from "lucide-react";

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
      <h2 className="font-extrabold text-xl mb-4 flex items-center gap-2 text-green-700">
        <UsersRound className="w-5 h-5" />
        Your Friends
      </h2>
      <div className="space-y-3">
        {loading && <div className="text-gray-300 animate-pulse">Loading...</div>}
        {!loading && friends.length === 0 && (
          <div className="text-gray-400 text-sm flex items-center gap-2 bg-gradient-to-r from-green-50 to-blue-50 border border-dashed border-green-200 rounded-xl py-6 justify-center">
            <User className="w-8 h-8 text-green-200" />
            No friends yet. Invite or add some!
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
        {friends.map((f) => (
          <div key={f.id} className="bg-white/80 rounded-2xl shadow-lg px-5 py-4 flex items-center gap-4 border border-green-50 hover:shadow-xl hover:scale-[1.014] transition duration-150 ease-in-out">
            {f.profile?.avatar_url
              ? <img src={f.profile.avatar_url} alt="avatar" className="w-12 h-12 rounded-full border-2 border-green-300 shadow-sm object-cover" />
              : <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-500 border-2 border-green-100">
                  <User className="w-7 h-7" />
                </div>
            }
            <div className="flex-1 min-w-0">
              <span className="block font-bold truncate text-green-800 text-base">
                {f.profile?.full_name || f.profile?.username || "User"}
              </span>
              <span className="block text-xs text-gray-400 truncate">@{f.profile?.username}</span>
            </div>
            <Mail className="w-5 h-5 text-green-400 opacity-80 hover:text-green-600 transition" title="Message (coming soon)" />
          </div>
        ))}
        </div>
      </div>
    </section>
  );
};

export default FriendsList;
