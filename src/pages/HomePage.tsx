
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { LogOut, LoaderCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import ActivityCard from '@/components/ActivityCard';
import { Database } from '@/integrations/supabase/types';

type Activity = Database['public']['Tables']['activities']['Row'];

const HomePage = () => {
  const { user, loading: authLoading } = useAuthStatus();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const fetchActivities = async (): Promise<Activity[]> => {
    if (!user) return [];
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching activities:", error);
      toast({ title: "Error", description: "Could not fetch your activities.", variant: "destructive" });
      return [];
    }
    return data || [];
  };

  const { data: activities, isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ['activities', user?.id],
    queryFn: fetchActivities,
    enabled: !!user,
  });

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: "Logout Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      navigate('/login');
    }
  };

  if (authLoading) {
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
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-green-700">Kelp Dashboard</h1>
        <Button onClick={handleLogout} variant="ghost" size="sm" className="text-gray-600 hover:text-red-500">
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </header>
      
      <main className="flex-grow p-4 md:p-6 space-y-6 mb-16">
        <div className="bg-white p-6 rounded-lg shadow max-w-lg mx-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-1">Welcome, {user.email?.split('@')[0]}!</h2>
          <p className="text-gray-600">Here's your latest activity feed.</p>
        </div>

        <div className="space-y-4">
          {activitiesLoading ? (
            <div className="flex justify-center items-center p-8">
              <LoaderCircle className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : activities && activities.length > 0 ? (
            <div className="space-y-6">
              {activities.map(activity => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow text-center max-w-lg mx-auto">
              <p className="text-gray-500">You haven't logged any activities yet.</p>
              <Button onClick={() => navigate('/log-activity')} className="mt-4 bg-green-600 hover:bg-green-700">
                Log Your First Activity
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
};

export default HomePage;
