import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LoaderCircle } from "lucide-react";
import EnhancedActivityCard from "./EnhancedActivityCard";
import FeedFilters from "./FeedFilters";
import { Database } from "@/integrations/supabase/types";

type Activity = Database['public']['Tables']['activities']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

const FeedContent = ({ user }: { user: Profile | null }) => {
  const [allPosts, setAllPosts] = useState<Activity[]>([]);
  const [posts, setPosts] = useState<Activity[]>([]);
  const [profiles, setProfiles] = useState<{ [userId: string]: Profile }>({});
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [showFriendsOnly, setShowFriendsOnly] = useState(false);
  const [friendIds, setFriendIds] = useState<string[]>([]);

  // Fetch all activities & author profiles, and friend ids (once per user login)
  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const fetchEverything = async () => {
      // Get friend user ids
      const { data: friendsData } = await supabase
        .from("friends")
        .select("user1_id,user2_id")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
      let ids: string[] = [];
      if (friendsData) {
        ids = friendsData.map(row =>
          row.user1_id === user.id ? row.user2_id : row.user1_id
        );
        setFriendIds(ids);
      }

      // Fetch all posts/activities (desc)
      const { data: activities, error } = await supabase
        .from("activities")
        .select("*")
        .order("created_at", { ascending: false });

      setAllPosts(activities || []);

      // Get all authors (batch)
      const userIds = Array.from(new Set((activities || []).map(a => a.user_id)));
      if (userIds.length > 0) {
        const { data: userProfiles } = await supabase
          .from("profiles")
          .select("*")
          .in("id", userIds);
        const map: { [id: string]: Profile } = {};
        (userProfiles || []).forEach(p => { map[p.id] = p; });
        setProfiles(map);
      }
      setLoading(false);
    };
    fetchEverything();
  }, [user]);

  // Filtering logic: keep always in sync with state
  useEffect(() => {
    if (!user) return setPosts([]);
    let filtered: Activity[] = [...allPosts];

    // Friends-only
    if (showFriendsOnly && friendIds.length > 0) {
      filtered = filtered.filter(post => friendIds.includes(post.user_id));
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(post => (post.category?.toLowerCase() === selectedCategory.toLowerCase()));
    }

    // Location filter (by author's profile.location)
    if (selectedLocation) {
      filtered = filtered.filter(post => {
        const author = profiles[post.user_id];
        return author?.location === selectedLocation;
      });
    }

    setPosts(filtered);
  }, [allPosts, selectedCategory, selectedLocation, showFriendsOnly, profiles, user, friendIds]);

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
