
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import ActivityCard from '@/components/ActivityCard';
import BottomNav from '@/components/BottomNav';
import { LoaderCircle, Users } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Activity = Database['public']['Tables']['activities']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type ActivityWithProfile = Activity & { profile: Profile | null };

const FeedPage = () => {
  const { user } = useAuthStatus();

  const fetchFeed = async (): Promise<ActivityWithProfile[]> => {
    if (!user) return [];

    // 1. Fetch friends
    const { data: friendsData, error: friendsError } = await supabase
      .from('friends')
      .select('user1_id, user2_id')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
    
    if (friendsError) {
      console.error('Error fetching friends:', friendsError);
      throw friendsError;
    }

    const friendIds = friendsData.map(f => (f.user1_id === user.id ? f.user2_id : f.user1_id));
    const userIds = [user.id, ...friendIds];

    // 2. Fetch activities from user and friends
    const { data: activitiesData, error: activitiesError } = await supabase
      .from('activities')
      .select('*')
      .in('user_id', userIds)
      .order('created_at', { ascending: false })
      .limit(50);

    if (activitiesError) {
      console.error('Error fetching activities:', activitiesError);
      throw activitiesError;
    }

    // 3. Fetch profiles of activity authors
    const authorIds = [...new Set(activitiesData.map(a => a.user_id))];
    if (authorIds.length === 0) return [];
    
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', authorIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }
    
    // 4. Combine activities with profiles
    return activitiesData.map(activity => ({
      ...activity,
      profile: profilesData.find(p => p.id === activity.user_id) || null,
    }));
  };

  const { data: feedItems, isLoading, isError } = useQuery<ActivityWithProfile[]>({
    queryKey: ['feed', user?.id],
    queryFn: fetchFeed,
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-green-700 flex items-center gap-2">
          <Users className="w-6 h-6" />
          Activity Feed
        </h1>
      </header>

      <main className="flex-grow p-4 md:p-6 space-y-6 mb-16">
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
        {feedItems && feedItems.length > 0 ? (
          <div className="space-y-6">
            {feedItems.map(item => (
              <ActivityCard key={item.id} activity={item} profile={item.profile} />
            ))}
          </div>
        ) : (
          !isLoading && <div className="bg-white p-6 rounded-lg shadow text-center max-w-lg mx-auto">
            <p className="text-gray-500">The feed is empty. Log an activity or add friends to see updates!</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default FeedPage;
