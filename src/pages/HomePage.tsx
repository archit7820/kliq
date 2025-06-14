
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { LogOut } from 'lucide-react';

const HomePage = () => {
  const { user, loading, session } = useAuthStatus();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: "Logout Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      navigate('/login'); // Ensure navigation happens after state updates
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">Loading Kelp...</div>
      </div>
    );
  }
  
  if (!user) {
    // This case should ideally be handled by the useEffect redirect,
    // but as a fallback or if navigation is slow:
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
      
      <main className="flex-grow p-6 space-y-6 mb-16"> {/* mb-16 for bottom nav space */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Welcome, {user.email}!</h2>
          <p className="text-gray-600">This is your Kelp home dashboard. More features coming soon!</p>
        </div>

        {/* Placeholder for Weekly carbon impact summary */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Weekly Impact</h3>
          <p className="text-gray-500">Your carbon impact summary will appear here.</p>
          {/* Placeholder for graph */}
          <div className="mt-4 h-40 bg-gray-200 rounded flex items-center justify-center text-gray-400">
            Trend Graph Placeholder
          </div>
        </div>

        {/* Placeholder for Activity breakdown */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Activity Breakdown</h3>
          <p className="text-gray-500">Details about your activities (travel, food, etc.) will be shown here.</p>
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
};

export default HomePage;
