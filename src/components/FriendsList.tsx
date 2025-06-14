
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { User, MessageSquare, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";

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
      <h2 className="font-extrabold text-xl mb-4 flex items-center gap-2 text-green-700 drop-shadow-sm tracking-wide">
        <UsersRound className="w-6 h-6 text-green-400" />
        <span className="bg-gradient-to-r from-green-500 to-teal-400 bg-clip-text text-transparent">Your Friends</span>
      </h2>
      <div className="space-y-3">
        {loading && (
          <div className="flex items-center gap-2 animate-pulse px-4 py-8 justify-center">
            <User className="w-8 h-8 text-green-200 animate-pulse" />
            <div className="h-4 w-28 rounded bg-green-100" />
          </div>
        )}
        {!loading && friends.length === 0 && (
          <div className="flex flex-col items-center gap-2 bg-white p-8 rounded-2xl border-2 border-dashed border-green-200 shadow-[0_6px_40px_rgba(16,167,132,.07)] animate-fade-in">
            <User className="w-12 h-12 text-green-200 mb-2" />
            <span className="text-green-400 font-semibold text-base">You have no friends yet.</span>
            <span className="text-gray-400 text-xs mb-2">Invite your first friend!</span>
          </div>
        )}
        <div className="grid gap-5 sm:grid-cols-2">
          {friends.map((f) => {
            const friendId = f.user1_id === user.id ? f.user2_id : f.user1_id;
            return (
              <div
                key={f.id}
                className="bg-gradient-to-br from-green-100/70 to-blue-100/60 rounded-3xl border border-green-200 shadow-xl px-6 py-5 flex items-center gap-4
                  hover:scale-105 hover:shadow-2xl transition-transform duration-200 ease-in-out group relative"
              >
                {f.profile?.avatar_url ? (
                  <img
                    src={f.profile.avatar_url}
                    alt="avatar"
                    className="w-14 h-14 rounded-full border-2 border-green-400 shadow-inner object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-green-200 via-blue-200 to-green-100 flex items-center justify-center text-green-500 border-2 border-green-100">
                    <User className="w-7 h-7" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="block font-bold truncate text-green-800 text-lg">
                    {f.profile?.full_name || f.profile?.username || "User"}
                  </span>
                  <span className="block text-sm text-green-400 truncate font-mono">@{f.profile?.username}</span>
                </div>
                <Link to={`/chat/${friendId}`} title="Message friend">
                  <span className="flex items-center justify-center p-2 rounded-full cursor-pointer group-hover:bg-blue-100/50 transition">
                    <MessageSquare className="w-6 h-6 text-blue-400 opacity-80 group-hover:text-blue-600 transition" />
                  </span>
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  );
};

export default FriendsList;
