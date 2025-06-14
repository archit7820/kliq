
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LoaderCircle } from "lucide-react";
import ActivityCard from "./ActivityCard";
import { Database } from "@/integrations/supabase/types";

type Activity = Database['public']['Tables']['activities']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

const FeedContent = ({ user }: { user: Profile | null }) => {
  const [posts, setPosts] = useState<Activity[]>([]);
  const [profiles, setProfiles] = useState<{[userId: string]: Profile}>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    // Fetch friend user ids (2-way)
    const fetchFriendIds = async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from("friends")
        .select("user1_id,user2_id")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
      if (error) {
        console.error("Error fetching friends:", error);
        return [];
      }
      if (!data) return [];
      return data.map(row =>
        row.user1_id === user.id ? row.user2_id : row.user1_id
      );
    };

    const fetchFeed = async () => {
      const { data: activities, error: activitiesError } = await supabase
        .from("activities")
        .select("*")
        .order("created_at", { ascending: false });

      if (activitiesError) {
        console.error("Error fetching activities:", activitiesError);
        setPosts([]);
        setLoading(false);
        return;
      }

      const friendIds = await fetchFriendIds();

      // Split activities into friendPosts and otherPosts, both sorted (already sorted from DB fetch)
      const friendPosts: Activity[] = [];
      const otherPosts: Activity[] = [];
      (activities || []).forEach(post => {
        if (friendIds.includes(post.user_id)) {
          friendPosts.push(post);
        } else {
          otherPosts.push(post);
        }
      });

      // Already sorted by created_at descending!
      const finalPosts = [...friendPosts, ...otherPosts];
      setPosts(finalPosts);

      // Fetch user profiles for all post authors in batch
      const userIdsToFetch = Array.from(new Set(finalPosts.map(a => a.user_id)));
      if (userIdsToFetch.length > 0) {
        const { data: userProfiles, error: profilesError } = await supabase
          .from("profiles")
          .select("*")
          .in("id", userIdsToFetch);

        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
          setProfiles({});
        } else {
          const map: {[userId: string]: Profile} = {};
          (userProfiles || []).forEach((p: Profile) => { map[p.id] = p; });
          setProfiles(map);
        }
      }
      setLoading(false);
    };

    fetchFeed();
    // Do not re-run unless user changes
    // eslint-disable-next-line
  }, [user]);

  if (!user)
    return (
      <div className="p-6 text-muted-foreground text-center text-base">
        Sign in to see your feed
      </div>
    );

  if (loading)
    return (
      <div className="flex items-center justify-center p-8">
        <LoaderCircle className="animate-spin w-8 h-8 text-primary" />
      </div>
    );

  return (
    <div className="flex flex-col gap-6">
      {posts.length === 0 ? (
        <div className="mt-5 p-6 rounded-xl bg-card border text-center text-muted-foreground">
          No activities yet. Follow friends to see their posts or log your first activity!
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
