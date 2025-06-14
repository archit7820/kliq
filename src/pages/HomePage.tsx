import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { LogOut } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const HomePage = () => {
  const { user, loading: authLoading } = useAuthStatus();
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
  
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: "Logout Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      navigate('/login');
    }
  };

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
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-green-700">Kelp Home</h1>
        <Button onClick={handleLogout} variant="ghost" size="sm" className="text-gray-600 hover:text-red-500">
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </header>
      
      <main className="flex-grow p-4 md:p-6 space-y-6 mb-16">
        <div className="bg-white p-6 rounded-lg shadow max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-1">Welcome, {user.email?.split('@')[0]}!</h2>
          <p className="text-gray-600">Explore ways to offset your carbon footprint.</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="marketplace">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="marketplace">Offset Marketplace</TabsTrigger>
              <TabsTrigger value="learn">Learn</TabsTrigger>
              <TabsTrigger value="personalized">For You</TabsTrigger>
            </TabsList>
            <TabsContent value="marketplace">
              <div className="bg-white p-6 mt-2 rounded-lg shadow">
                <h3 className="font-semibold text-lg">Marketplace</h3>
                <p className="text-gray-500 mt-2">Coming soon: A place to find and support carbon offset projects.</p>
              </div>
            </TabsContent>
            <TabsContent value="learn">
              <div className="bg-white p-6 mt-2 rounded-lg shadow">
                <h3 className="font-semibold text-lg">Learn About Offsetting</h3>
                <p className="text-gray-500 mt-2">Coming soon: Educational content about carbon footprints and offsetting.</p>
              </div>
            </TabsContent>
            <TabsContent value="personalized">
              <div className="bg-white p-6 mt-2 rounded-lg shadow">
                <h3 className="font-semibold text-lg">Personalized Suggestions</h3>
                <p className="text-gray-500 mt-2">Coming soon: Offset projects and content based on your interests.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
};

export default HomePage;
