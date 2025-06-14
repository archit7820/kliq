
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
    <div className="min-h-screen bg-background flex flex-col">
      <FeedHeader userProfile={userProfile} onRefresh={handleRefresh} isRefetching={isRefreshing} />

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 mb-16">
        {isLoadingCarbonOverview ? (
          <div className="flex justify-center items-center p-8">
            <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <CarbonOverview data={carbonOverviewData || []} />
        )}

        <FriendsBar user={user} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                <FeedContent user={userProfile} />
            </div>
            <aside className="hidden md:block md:col-span-1">
                {/* Placeholder for sidebar content, like suggestions or user profile summary */}
                <div className="sticky top-24 p-4 rounded-lg bg-card border">
                    <h3 className="font-bold text-lg mb-4">Suggestions</h3>
                    <p className="text-muted-foreground">This area can be used for friend suggestions, trending topics, or other widgets.</p>
                </div>
            </aside>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default FeedPage;
