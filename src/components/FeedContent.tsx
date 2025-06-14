
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LoaderCircle } from "lucide-react";
import ActivityCard from "./ActivityCard";
import { Database } from "@/integrations/supabase/types";

// Helper types
type Activity = Database['public']['Tables']['activities']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

const FeedContent = ({ user }: { user: Profile | null }) => {
  const [posts, setPosts] = useState<Activity[]>([]);
  const [profiles, setProfiles] = useState<{[userId: string]: Profile}>({});
  const [loading, setLoading] = useState(true);

  // Fetch all posts friend-first, recency, mobile-first style
  useEffect(() => {
    if (!user) return;
    setLoading(true);

    // Get friend user ids (2-way)
    const fetchFriendIds = async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from("friends")
        .select("user1_id,user2_id")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
      if (!data) return [];
      // Whoever is not me is my friend
      return data.map(row =>
        row.user1_id === user.id ? row.user2_id : row.user1_id
      );
    };

    const fetchFeed = async () => {
      // All activities, most recent first
      const { data: activities } = await supabase
        .from("activities")
        .select("*")
        .order("created_at", { ascending: false });

      const friendIds = await fetchFriendIds();

      // Friends first, then others (recency within)
      const friendPosts: Activity[] = [];
      const otherPosts: Activity[] = [];

      (activities || []).forEach(post => {
        if (friendIds.includes(post.user_id)) {
          friendPosts.push(post);
        } else {
          otherPosts.push(post);
        }
      });

      const finalPosts = [...friendPosts, ...otherPosts];
      setPosts(finalPosts);

      // Get user profiles for all post authors in batch
      const userIdsToFetch = Array.from(new Set(finalPosts.map(a => a.user_id)));
      if (userIdsToFetch.length > 0) {
        const { data: userProfiles } = await supabase
          .from("profiles")
          .select("*")
          .in("id", userIdsToFetch);

        const map: {[userId: string]: Profile} = {};
        (userProfiles || []).forEach((p: Profile) => { map[p.id] = p; });
        setProfiles(map);
      }
      setLoading(false);
    };

    fetchFeed();
    // eslint-disable-next-line
  }, [user]);

  if (!user)
    return (
      <div className="p-6 text-gray-400 text-center text-base">
        Sign in to see your feed
      </div>
    );

  if (loading)
    return (
      <div className="flex items-center justify-center p-8">
        <LoaderCircle className="animate-spin w-8 h-8 text-green-400" />
      </div>
    );

  return (
    <div className="flex flex-col gap-8 px-2 pb-6 sm:gap-5 sm:px-4">
      {posts.length === 0 ? (
        <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-green-50 to-blue-50 text-center text-gray-400 border">
          No activities yet. Add your first!
        </div>
      ) : (
        posts.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            profile={profiles[activity.user_id]}
          />
        ))
      )}
    </div>
  );
};

export default FeedContent;
