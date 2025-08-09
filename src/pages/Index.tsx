
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const Index = () => {
  const { user, loading } = useAuthStatus();
  const navigate = useNavigate();

  const { data: profile, isLoading: profileLoading, isFetching: profileFetching } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('lifestyle_tags')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data;
    },
    enabled: !!user?.id,
    refetchOnMount: "always",
    staleTime: 0,
  });

  useEffect(() => {
    console.log('Index useEffect - user:', user, 'profile:', profile, 'loading states:', { loading, profileLoading, profileFetching });
    
    if (loading || profileLoading || profileFetching) {
      return; // Still loading or fetching fresh data, don't navigate yet
    }

    if (!user) {
      navigate('/login');
      return;
    }

    // User is authenticated, check onboarding status
    if (!profile) {
      // Profile doesn't exist or failed to load, go to onboarding
      navigate('/onboarding', { replace: true });
      return;
    }

    // Check if user has completed onboarding (has lifestyle_tags and they're not empty)
    const hasCompletedOnboarding = profile.lifestyle_tags && 
                                   Array.isArray(profile.lifestyle_tags) && 
                                   profile.lifestyle_tags.length > 0;

    if (hasCompletedOnboarding) {
      navigate('/home', { replace: true });
    } else {
      navigate('/onboarding', { replace: true });
    }
  }, [user, loading, profile, profileLoading, profileFetching, navigate]);

  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500"></div>
        <p className="ml-4 text-xl font-semibold text-gray-700">Initializing Kelp...</p>
      </div>
    );
  }

  return null;
};

export default Index;
