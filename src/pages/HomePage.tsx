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

const HomePage = () => {
  const { user, loading: authLoading } = useAuthStatus();
  const { subscribed, skipOrCompleteSubscription } = useSubscriptionStatus();
  const navigate = useNavigate();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase.from('profiles').select('lifestyle_tags').eq('id', user.id).single();
      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile && (!profile.lifestyle_tags || profile.lifestyle_tags.length === 0)) {
        navigate('/onboarding');
    }
  }, [profile, navigate]);

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
      <HomeContent profile={profile} />
      <BottomNav />
    </div>
  );
};

export default HomePage;
