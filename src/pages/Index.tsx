
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const Index = () => {
  const { user, loading } = useAuthStatus();
  const navigate = useNavigate();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('lifestyle_tags')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (!loading && !profileLoading) {
      if (!user) {
        navigate('/login');
      } else if (user && profile) {
        // Check if user has completed onboarding (has lifestyle_tags)
        if (profile.lifestyle_tags && profile.lifestyle_tags.length > 0) {
          navigate('/home');
        } else {
          navigate('/onboarding');
        }
      }
    }
  }, [user, loading, profile, profileLoading, navigate]);

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
