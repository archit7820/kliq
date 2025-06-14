import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import ActivityCard from '@/components/ActivityCard';
import BottomNav from '@/components/BottomNav';
import { LoaderCircle, RefreshCw } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import CarbonOverview from '@/components/CarbonOverview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Activity = Database['public']['Tables']['activities']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type ActivityWithProfile = Activity & { profile: Profile | null };

const FeedPage = () => {
  const { user } = useAuthStatus();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('friends');

  const fetchFeed = async (feedType: string): Promise<ActivityWithProfile[]> => {
    if (!user) return [];

    let userIds: string[] = [];

    if (feedType === 'friends') {
        const { data: friendsData, error: friendsError } = await supabase
            .from('friends')
            .select('user1_id, user2_id')
            .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
        
        if (friendsError) {
            console.error('Error fetching friends:', friendsError);
            throw friendsError;
        }

        const friendIds = friendsData.map(f => (f.user1_id === user.id ? f.user2_id : f.user1_id));
        userIds = [user.id, ...friendIds];
    }

    // For community feed, we don't filter by userIds, so it fetches all activities.
    let query = supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (feedType === 'friends') {
        query = query.in('user_id', userIds);
    }

    const { data: activitiesData, error: activitiesError } = await query;

    if (activitiesError) {
        console.error('Error fetching activities:', activitiesError);
        throw activitiesError;
    }

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
    
    return activitiesData.map(activity => ({
        ...activity,
        profile: profilesData.find(p => p.id === activity.user_id) || null,
    }));
  };

  const { data: feedItems, isLoading, isError, refetch } = useQuery<ActivityWithProfile[]>({
    queryKey: ['feed', activeTab, user?.id],
    queryFn: () => fetchFeed(activeTab),
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

  const { data: carbonOverviewData, isLoading: isLoadingCarbonOverview } = useQuery({
    queryKey: ['carbonOverview', user?.id],
    queryFn: async () => {
        if (!user) return [];
        
        // For larger scale apps, creating a database function (RPC) for aggregation would be more performant.
        const { data: activities, error } = await supabase
            .from('activities')
            .select('category, carbon_footprint_kg')
            .eq('user_id', user.id)
            .not('category', 'is', null);

        if (error) {
            console.error("Error fetching carbon overview data:", error);
            throw error;
        }

        const aggregated: { [key: string]: number } = {};
        activities.forEach(activity => {
            const category = activity.category || 'Other';
            const carbon = Number(activity.carbon_footprint_kg) || 0;
            if (aggregated[category]) {
                aggregated[category] += carbon;
            } else {
                aggregated[category] = carbon;
            }
        });
        
        return Object.entries(aggregated).map(([category, total_carbon]) => ({ category, total_carbon }));
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
        {isLoadingCarbonOverview ? (
          <div className="flex justify-center items-center p-8">
            <LoaderCircle className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : (
          <CarbonOverview data={carbonOverviewData || []} />
        )}

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
