
import React from 'react';
import { useQuery, useQueryClient, useIsFetching } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import BottomNav from '@/components/BottomNav';
import { LoaderCircle } from 'lucide-react';
import CarbonOverview from '@/components/CarbonOverview';
import FeedHeader from '@/components/FeedHeader';
import FriendsBar from '@/components/FriendsBar';
import FeedContent from '@/components/FeedContent';

const FeedPage = () => {
  const { user } = useAuthStatus();
  const queryClient = useQueryClient();

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
        (activities || []).forEach(activity => {
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

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['feed'] });
    queryClient.invalidateQueries({ queryKey: ['carbonOverview'] });
    queryClient.invalidateQueries({ queryKey: ['friendsProfiles'] });
    queryClient.invalidateQueries({ queryKey: ['profile'] });
  };
  
  const isRefreshing = useIsFetching() > 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <FeedHeader userProfile={userProfile} onRefresh={handleRefresh} isRefetching={isRefreshing} />

      <main className="flex-grow p-4 md:p-6 space-y-8 mb-16">
        {isLoadingCarbonOverview ? (
          <div className="flex justify-center items-center p-8">
            <LoaderCircle className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : (
          <CarbonOverview data={carbonOverviewData || []} />
        )}

        <FriendsBar user={user} />
        
        <FeedContent user={userProfile} />
      </main>

      <BottomNav />
    </div>
  );
};

export default FeedPage;

