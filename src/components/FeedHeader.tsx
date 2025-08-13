
import React, { useState, useEffect } from 'react';
import { Database } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  RefreshCw, 
  MessageSquare, 
  Sparkles, 
  Zap, 
  Heart, 
  Star,
  Flame,
  Trophy,
  Leaf,
  Sun,
  Moon,
  Coffee,
  Bike, // <-- replaced Bicycle with Bike
  TreePine,
  Recycle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface FeedHeaderProps {
  userProfile: Profile | null | undefined;
  onRefresh: () => void;
  isRefetching: boolean;
}

// Fun icon sets based on activity categories and achievements
const dynamicIcons = {
  energy: [Zap, Sun, Flame],
  transportation: [Bike, Leaf], // <-- replaced Bicycle with Bike
  home: [TreePine, Recycle],
  food: [Coffee, Leaf],
  default: [Sparkles, Star, Heart]
};

const FeedHeader: React.FC<FeedHeaderProps> = ({ userProfile, onRefresh, isRefetching }) => {
  const [currentIcons, setCurrentIcons] = useState(dynamicIcons.default);
  const [iconIndex, setIconIndex] = useState(0);
  const [sparkleAnimation, setSparkleAnimation] = useState(false);

  // Fetch user's recent activities to determine dynamic icons
  useEffect(() => {
    const fetchRecentActivity = async () => {
      if (!userProfile?.id) return;

      const { data: recentActivities } = await supabase
        .from('activities')
        .select('category')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentActivities && recentActivities.length > 0) {
        const categories = recentActivities.map(a => a.category?.toLowerCase()).filter(Boolean);
        const mostRecentCategory = categories[0];
        
        // Set icons based on most recent activity category
        if (mostRecentCategory && dynamicIcons[mostRecentCategory as keyof typeof dynamicIcons]) {
          setCurrentIcons(dynamicIcons[mostRecentCategory as keyof typeof dynamicIcons]);
        } else if (categories.includes('transportation')) {
          setCurrentIcons(dynamicIcons.transportation);
        } else if (categories.includes('energy')) {
          setCurrentIcons(dynamicIcons.energy);
        } else if (categories.includes('home')) {
          setCurrentIcons(dynamicIcons.home);
        } else if (categories.includes('food')) {
          setCurrentIcons(dynamicIcons.food);
        }
      }
    };

    fetchRecentActivity();
  }, [userProfile?.id]);

  // Rotate through icons every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIconIndex((prev) => (prev + 1) % currentIcons.length);
      setSparkleAnimation(true);
      setTimeout(() => setSparkleAnimation(false), 600);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIcons.length]);

  const CurrentDynamicIcon = currentIcons[iconIndex];

  const handleRefresh = () => {
    onRefresh();
    setSparkleAnimation(true);
    setTimeout(() => setSparkleAnimation(false), 600);
  };

  return (
    <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-lg border-b">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-lg">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Impact Hub</h1>
            <p className="text-xs text-muted-foreground">Real actions, real change</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleRefresh} 
            disabled={isRefetching}
            className="rounded-full"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
          </Button>
          
          <Link to="/messages">
            <Button variant="ghost" size="icon" className="rounded-full">
              <MessageSquare className="w-4 h-4" />
            </Button>
          </Link>
          
          <Link to="/profile">
            <Avatar className="w-8 h-8">
              <AvatarImage src={userProfile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {userProfile?.full_name?.charAt(0).toUpperCase() || userProfile?.username?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default FeedHeader;
