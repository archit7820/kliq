
import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import ActivityCard from '@/components/ActivityCard';
import BottomNav from '@/components/BottomNav';
import { LoaderCircle, RefreshCw } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

type Activity = Database['public']['Tables']['activities']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type ActivityWithProfile = Activity & { profile: Profile | null };

const FeedPage = () => {
  const { user } = useAuthStatus();
  const queryClient = useQueryClient();

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

  const { data: feedItems, isLoading, isError, refetch } = useQuery<ActivityWithProfile[]>({
    queryKey: ['feed', user?.id],
    queryFn: fetchFeed,
    enabled: !!user,
  });

  const { data: userProfile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
        if (!user) return null;
        const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (error) {
            console.error("Error fetching user profile:", error);
            return null;
        }
        return data;
    },
    enabled: !!user,
  });

  const { data: friends } = useQuery({
    queryKey: ['friendsProfiles', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: friendsData, error: friendsError } = await supabase
        .from('friends')
        .select('user1_id, user2_id')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
      
      if (friendsError) throw friendsError;
      
      const friendIds = friendsData.map(f => (f.user1_id === user.id ? f.user2_id : f.user1_id));
      if (friendIds.length === 0) return [];
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', friendIds);
        
      if (profilesError) throw profilesError;
      
      return profilesData;
    },
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white p-4 sticky top-0 z-10 flex justify-between items-center border-b">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome to kelp!</h1>
          {userProfile && <p className="text-xl text-gray-500">{userProfile.full_name || userProfile.username}</p>}
        </div>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => refetch()}>
                <RefreshCw className="w-5 h-5 text-gray-600" />
            </Button>
            <Avatar>
                <AvatarImage src={userProfile?.avatar_url || undefined} />
                <AvatarFallback>{userProfile?.full_name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-6 space-y-8 mb-16">
        <div className="bg-green-100/50 p-4 rounded-xl border border-green-200">
            <h2 className="font-semibold text-green-800 mb-2">Your Estimated Carbon Footprint</h2>
            <p className="text-sm text-green-700">This section is coming soon! We'll show a breakdown of your carbon footprint by category here.</p>
        </div>

        {friends && friends.length > 0 && (
            <div>
                <h2 className="font-semibold text-gray-800 mb-3">Friends' Activity</h2>
                <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
                    {friends.map(friend => (
                        <div key={friend.id} className="flex flex-col items-center shrink-0 w-20">
                            <Avatar className="w-16 h-16 border-2 border-white shadow">
                                <AvatarImage src={friend.avatar_url || undefined} />
                                <AvatarFallback>{friend.full_name?.charAt(0) || 'F'}</AvatarFallback>
                            </Avatar>
                            <p className="text-xs mt-2 text-gray-600 w-full truncate text-center">{friend.full_name || friend.username}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}

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
          <div className="space-y-8">
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
