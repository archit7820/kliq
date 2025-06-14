
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LoaderCircle } from "lucide-react";
import EnhancedActivityCard from "./EnhancedActivityCard";
import FeedFilters from "./FeedFilters";
import { Database } from "@/integrations/supabase/types";

type Activity = Database['public']['Tables']['activities']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

const FeedContent = ({ user }: { user: Profile | null }) => {
  const [posts, setPosts] = useState<Activity[]>([]);
  const [allPosts, setAllPosts] = useState<Activity[]>([]);
  const [profiles, setProfiles] = useState<{[userId: string]: Profile}>({});
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [showFriendsOnly, setShowFriendsOnly] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const fetchFeed = async () => {
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

      const { data: activities, error: activitiesError } = await supabase
        .from("activities")
        .select("*")
        .order("created_at", { ascending: false });

      if (activitiesError) {
        console.error("Error fetching activities:", activitiesError);
        setPosts([]);
        setAllPosts([]);
        setLoading(false);
        return;
      }

      const friendIds = await fetchFriendIds();

      // Store all posts for filtering
      setAllPosts(activities || []);

      // Fetch user profiles for all post authors in batch
      const userIdsToFetch = Array.from(new Set((activities || []).map(a => a.user_id)));
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
  }, [user]);

  // Apply filters whenever filter states or allPosts change
  useEffect(() => {
    if (!user) return;

    let filteredPosts = [...allPosts];

    // Apply friends filter
    if (showFriendsOnly) {
      const fetchFriendIds = async () => {
        const { data, error } = await supabase
          .from("friends")
          .select("user1_id,user2_id")
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
        
        if (!error && data) {
          const friendIds = data.map(row =>
            row.user1_id === user.id ? row.user2_id : row.user1_id
          );
          filteredPosts = filteredPosts.filter(post => friendIds.includes(post.user_id));
          applyOtherFilters(filteredPosts);
        }
      };
      fetchFriendIds();
    } else {
      applyOtherFilters(filteredPosts);
    }

    function applyOtherFilters(posts: Activity[]) {
      // Apply category filter
      if (selectedCategory) {
        posts = posts.filter(post => post.category === selectedCategory);
      }

      // Apply location filter
      if (selectedLocation) {
        posts = posts.filter(post => {
          const profile = profiles[post.user_id];
          return profile?.location === selectedLocation;
        });
      }

      setPosts(posts);
    }
  }, [allPosts, selectedCategory, selectedLocation, showFriendsOnly, user, profiles]);

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
      <FeedFilters
        selectedCategory={selectedCategory}
        selectedLocation={selectedLocation}
        showFriendsOnly={showFriendsOnly}
        onCategoryChange={setSelectedCategory}
        onLocationChange={setSelectedLocation}
        onFriendsOnlyChange={setShowFriendsOnly}
      />

      {posts.length === 0 ? (
        <div className="mt-5 p-6 rounded-xl bg-card border text-center text-muted-foreground">
          {showFriendsOnly ? 
            "No activities found from your friends with the current filters." :
            "No activities match your current filters. Try adjusting your search criteria."
          }
        </div>
      ) : (
        posts.map((activity) => (
          <EnhancedActivityCard
            key={activity.id}
            activity={activity}
            profile={profiles[activity.user_id]}
            currentUserId={user?.id}
            showLocation={!selectedLocation}
          />
        ))
      )}
    </div>
  );
};

export default FeedContent;
