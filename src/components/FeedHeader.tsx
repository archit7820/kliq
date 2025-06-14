
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
  Bicycle,
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
  transportation: [Bicycle, Leaf],
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
    <header className="bg-card/80 backdrop-blur-sm p-4 sticky top-0 z-40 flex justify-between items-center border-b">
      {/* Left side - Logo with dynamic icon */}
      <div className="flex items-center gap-3">
        <Link to="/home" className="flex items-center gap-2 group">
          <div className="relative">
            <h1 className="text-2xl font-bold text-primary transition-all duration-300 group-hover:scale-105">
              kelp
            </h1>
            <CurrentDynamicIcon 
              className={`absolute -top-1 -right-1 w-4 h-4 text-green-500 transition-all duration-500 ${
                sparkleAnimation ? 'animate-bounce scale-125' : ''
              }`} 
            />
          </div>
        </Link>
        
        {/* Fun mood indicator */}
        <div className="hidden sm:flex items-center gap-1">
          {currentIcons.map((Icon, index) => (
            <Icon
              key={index}
              className={`w-3 h-3 transition-all duration-300 ${
                index === iconIndex 
                  ? 'text-primary scale-110' 
                  : 'text-muted-foreground/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Right side - Interactive buttons */}
      <div className="flex items-center gap-3">
        {/* Super interactive refresh button */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleRefresh} 
          disabled={isRefetching}
          className="relative group hover:bg-green-50 transition-all duration-300"
        >
          <RefreshCw 
            className={`w-5 h-5 text-muted-foreground group-hover:text-green-600 transition-all duration-300 ${
              isRefetching ? 'animate-spin' : 'group-hover:rotate-180'
            }`} 
          />
          {sparkleAnimation && (
            <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400 animate-pulse" />
          )}
          <span className="sr-only">Refresh feed</span>
        </Button>

        {/* Animated messages button */}
        <Link to="/messages">
          <Button 
            variant="ghost" 
            size="icon"
            className="relative group hover:bg-blue-50 transition-all duration-300"
          >
            <MessageSquare className="w-5 h-5 text-muted-foreground group-hover:text-blue-600 group-hover:scale-110 transition-all duration-300" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="sr-only">Messages</span>
          </Button>
        </Link>

        {/* Enhanced profile avatar with glow effect */}
        <Link to="/profile" className="group">
          <div className="relative">
            <Avatar className="w-9 h-9 ring-2 ring-transparent group-hover:ring-primary/20 transition-all duration-300 group-hover:scale-105">
              <AvatarImage src={userProfile?.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-green-400 to-blue-500 text-white font-medium">
                {userProfile?.full_name?.charAt(0).toUpperCase() || userProfile?.username?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-card animate-pulse" />
          </div>
        </Link>
      </div>
    </header>
  );
};

export default FeedHeader;
