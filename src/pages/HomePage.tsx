import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import BottomNav from '@/components/BottomNav';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import HomeHeader from '@/components/HomeHeader';
import HomeContent from '@/components/HomeContent';
import SubscriptionPaywall from "@/components/SubscriptionPaywall";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import KelpWalletBanner from "@/components/KelpWalletBanner";

const HomePage = () => {
  const { user, loading: authLoading } = useAuthStatus();
  const { subscribed, skipOrCompleteSubscription } = useSubscriptionStatus();
  const navigate = useNavigate();

  // Fetch full profile + stats + eco insights in ONE place
  const { data: profile, isLoading: profileLoading, isFetching: profileFetching } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      // Select * instead of only lifestyle_tags
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
      return data;
    },
    enabled: !!user,
    refetchOnWindowFocus: true,
    refetchInterval: 10000,
    refetchOnMount: "always",
    staleTime: 0,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (authLoading) return;
    if (profileLoading || profileFetching) return; // wait for fresh data
    if (profile && Array.isArray(profile.lifestyle_tags) && profile.lifestyle_tags.length === 0) {
      navigate('/onboarding', { replace: true });
    }
  }, [authLoading, profile, profileLoading, profileFetching, navigate]);

  if (!subscribed) {
    return <SubscriptionPaywall onSkip={skipOrCompleteSubscription} />;
  }

  if (authLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">Loading Kelp...</div>
      </div>
    );
  }
  
  if (!user) {
    return null; 
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <HomeHeader />
      {/* Pass profile as prop everywhere! */}
      <div className="max-w-xl w-full mx-auto">
        <KelpWalletBanner profile={profile} />
      </div>
      <HomeContent profile={profile} />
      <BottomNav />
    </div>
  );
};

export default HomePage;
