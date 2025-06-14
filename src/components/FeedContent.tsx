import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ActivityCard from '@/components/ActivityCard';
import { LoaderCircle } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from '@supabase/supabase-js';

type Activity = Database['public']['Tables']['activities']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type ActivityWithProfile = Activity & { profile: Profile | null };

interface FeedContentProps {
  user: User | null;
}

const FeedContent: React.FC<FeedContentProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState("friends");
  const [feedData, setFeedData] = useState<ActivityWithProfile[] | null>(null);

  // Optimize: Friends' posts first, then communities, mobile-first tailwind container
  const fetchFeed = async (feedType: string): Promise<ActivityWithProfile[]> => {
    if (!user) return [];

    let activities: ActivityWithProfile[] = [];
    let userIds: string[] = [];
    let friendActivities: any[] = [];
    let communityActivities: any[] = [];

    if (feedType === "friends") {
      // 1. Fetch friend IDs
      const { data: friendsData } = await supabase
        .from("friends")
        .select("user1_id, user2_id")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      const friendIds = friendsData
        ? friendsData.map(f => (f.user1_id === user.id ? f.user2_id : f.user1_id))
        : [];
      userIds = [user.id, ...friendIds];

      // 2. Fetch activities from friends (most recent first)
      const { data: friendsActs } = await supabase
        .from("activities")
        .select("*")
        .in("user_id", userIds)
        .order("created_at", { ascending: false })
        .limit(30);

      friendActivities = friendsActs || [];

      // 3. Fetch community activities (most recent first, not already in friends' posts)
      const { data: myMemberships } = await supabase
        .from("community_memberships")
        .select("community_id")
        .eq("user_id", user.id);

      const communityIds = myMemberships?.map(m => m.community_id) || [];

      const { data: commActsRecords } = await supabase
        .from("community_activities")
        .select("activity_id, community_id, posted_at")
        .in("community_id", communityIds)
        .order("posted_at", { ascending: false })
        .limit(30);

      const commActIds = commActsRecords?.map(ca => ca.activity_id) || [];

      const { data: commActs } = commActIds.length
        ? await supabase
            .from("activities")
            .select("*")
            .in("id", commActIds)
            .not("user_id", "in", `(${userIds.join(",")})`)
            .order("created_at", { ascending: false })
        : { data: [] };

      communityActivities = commActs || [];

      // 4. Combine: friends first, then community
      activities = [
        ...friendActivities,
        ...communityActivities.filter(
          act => !friendActivities.find(a => a.id === act.id)
        ),
      ];
    } else {
      // Community-only: fetch all recent community activities (for discoverability)
      const { data: commActsRecords } = await supabase
        .from("community_activities")
        .select("activity_id, community_id, posted_at")
        .order("posted_at", { ascending: false })
        .limit(50);

      const commActIds = commActsRecords?.map(ca => ca.activity_id) || [];

      const { data: acts } = commActIds.length
        ? await supabase
            .from("activities")
            .select("*")
            .in("id", commActIds)
            .order("created_at", { ascending: false })
        : { data: [] };

      activities = acts || [];
    }

    // Get unique user ids for profile pulls
    const authorIds = [
      ...new Set(activities.map(a => a.user_id)),
    ];

    const { data: profilesData } = authorIds.length
      ? await supabase
          .from("profiles")
          .select("*")
          .in("id", authorIds)
      : { data: [] };

    return activities.map(activity => ({
      ...activity,
      profile: profilesData?.find(p => p.id === activity.user_id) || null,
    }));
  };

  const { data: feedItems, isLoading, isError, refetch } = useQuery<ActivityWithProfile[]>({
    queryKey: ['feed', activeTab, user?.id],
    queryFn: () => fetchFeed(activeTab),
    enabled: !!user,
  });

  // Store feed data locally for fast realtime push
  useEffect(() => { setFeedData(feedItems || []); }, [feedItems]);

  // Real-time subscription to the activities table
  useEffect(() => {
    if (!user) return;
    let friendsUserIds: string[] = [];
    let activitySub: any = null;
    let unsub: (() => void) | null = null;

    const setupRealtime = async () => {
      if (activeTab === 'friends') {
        // Get friend ids first
        const { data: friendsData, error } = await supabase
            .from('friends')
            .select('user1_id, user2_id')
            .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

        if (error) return;
        friendsUserIds = friendsData.map(f => (f.user1_id === user.id ? f.user2_id : f.user1_id));
        const ids = [user.id, ...friendsUserIds];
        activitySub = supabase
          .channel('realtime-feed-friends-' + user.id)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'activities',
            filter: ids.map(uid => `user_id=eq.${uid}`).join(','),
          }, async (payload: any) => {
            console.log("[FeedContent][Realtime][friends] New activity:", payload.new);
            // Push the activity to the front, refetch profile if needed
            const authorId = payload.new.user_id;
            let profile = null;
            // Check if profile already in feedData
            if (feedData && feedData.find(a => a.profile?.id === authorId)) {
              profile = feedData.find(a => a.profile?.id === authorId)?.profile;
            } else {
              const { data: pf } = await supabase.from('profiles').select('*').eq('id', authorId).single();
              profile = pf;
            }
            setFeedData((curr = []) => [{ ...payload.new, profile }, ...curr]);
          })
          .subscribe();
        unsub = () => { supabase.removeChannel(activitySub); };
      } else {
        // "community" (ALL users)
        activitySub = supabase
          .channel('realtime-feed-community')
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'activities',
          }, async (payload: any) => {
            console.log("[FeedContent][Realtime][community] New activity:", payload.new);
            const authorId = payload.new.user_id;
            let profile = null;
            if (feedData && feedData.find(a => a.profile?.id === authorId)) {
              profile = feedData.find(a => a.profile?.id === authorId)?.profile;
            } else {
              const { data: pf } = await supabase.from('profiles').select('*').eq('id', authorId).single();
              profile = pf;
            }
            setFeedData((curr = []) => [{ ...payload.new, profile }, ...curr]);
          })
          .subscribe();
        unsub = () => { supabase.removeChannel(activitySub); };
      }
    };

    setupRealtime();
    return () => { if (unsub) unsub(); };
    // eslint-disable-next-line
  }, [activeTab, user?.id]);

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="friends">Friends</TabsTrigger>
              <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>
      </Tabs>

      {isLoading && (
        <div className="flex justify-center items-center p-8">
          <LoaderCircle className="w-8 h-8 animate-spin text-green-600" />
        </div>
      )}
      {isError && (
        <div className="bg-white p-6 rounded-lg shadow text-center max-w-lg mx-auto">
          <p className="text-red-500">Could not load the feed. Please try again later.</p>
        </div>
      )}
      {feedData && feedData.length > 0 ? (
        <div className="space-y-8 mt-6">
          {feedData.map(item => (
            <ActivityCard key={item.id} activity={item} profile={item.profile} />
          ))}
        </div>
      ) : (
        !isLoading && <div className="bg-white p-6 rounded-lg shadow text-center max-w-lg mx-auto mt-6">
          <p className="text-gray-500">The feed is empty. Log an activity or add friends to see updates!</p>
        </div>
      )}
    </>
  );
};

export default FeedContent;
