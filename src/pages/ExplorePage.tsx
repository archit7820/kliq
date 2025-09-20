
import React, { useState, useEffect } from "react";
import { Zap, RotateCcw, Settings, LogOut, Users, UserPlus, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import ShareableCard from "@/components/ShareableCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { toast } from "@/hooks/use-toast";
import SwipeCard from "@/components/SwipeCard";

interface Post {
  id: string;
  user_id: string;
  activity: string;
  caption: string;
  category: string;
  image_url?: string;
  video_url?: string;
  carbon_footprint_kg: number;
  created_at: string;
  explanation: string;
  emoji: string;
  profiles?: {
    display_name?: string;
    avatar_url?: string;
  } | null;
  activity_analysis?: {
    environmental_impact?: number;
    social_connection?: number;
    adventure_intensity?: number;
    economic_impact?: number;
    learning_growth?: number;
  } | null;
}

const ExplorePage = () => {
  const { user } = useAuthStatus();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showShareableCard, setShowShareableCard] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Fetch real user profiles for posts
      const userIds = [...new Set((data || []).map(p => p.user_id).filter(Boolean))];
      let userProfiles = {};
      
      if (userIds.length > 0) {
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url, full_name')
          .in('id', userIds);
        
        
        if (profiles) {
          userProfiles = profiles.reduce((acc, profile) => {
            acc[profile.id] = profile;
            return acc;
          }, {});
        }
      }

      // Transform the data with enhanced gamified scoring and real profiles
      const transformedPosts = (data || []).map((activity, index) => {
        const environmental = Math.floor(Math.random() * 40) + 60;
        const social = Math.floor(Math.random() * 50) + 50;
        const adventure = Math.floor(Math.random() * 60) + 40;
        const economic = Math.floor(Math.random() * 70) + 30;
        const learning = Math.floor(Math.random() * 80) + 20;
        
        const userProfile = userProfiles[activity.user_id];
        
        return {
          ...activity,
          profiles: userProfile ? {
            display_name: userProfile.display_name || userProfile.full_name || `User ${activity.user_id?.slice(-4)}`,
            avatar_url: userProfile.avatar_url
          } : {
            display_name: "EcoHero" + (activity.user_id?.slice(-4) || Math.floor(Math.random() * 1000)),
            avatar_url: undefined
          },
          activity_analysis: {
            environmental_impact: environmental,
            social_connection: social,
            adventure_intensity: adventure,
            economic_impact: economic,
            learning_growth: learning,
          },
        };
      });
      
      setPosts(transformedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error",
        description: "Failed to load posts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ 
        title: "Logout Failed", 
        description: error.message, 
        variant: "destructive" 
      });
    } else {
      toast({ 
        title: "Logged Out", 
        description: "You have been successfully logged out." 
      });
      navigate('/login');
    }
  };

  const handleLike = (post: Post) => {
    // Handle like action
    console.log('Liked post:', post.id);
  };

  const handlePass = (post: Post) => {
    // Handle pass action
    console.log('Passed post:', post.id);
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchPosts();
  };

  return (
    <div className="fixed inset-0 bg-background overflow-hidden">
      {/* Full Screen Content */}
      {loading ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="h-full overflow-y-auto snap-y snap-mandatory">
          {posts.map((post, index) => (
            <div key={post.id} className="h-full w-full snap-start snap-always">
              <SwipeCard
                post={post as any}
                onSwipeLeft={() => handlePass(post)}
                onSwipeRight={() => handleLike(post)}
                onTap={() => {}} // No action on tap - posts stay as posts
              />
            </div>
          ))}
          
          {/* End of feed message */}
          {posts.length > 0 && (
            <div className="h-full w-full flex items-center justify-center p-4 snap-start">
              <div className="text-center py-8 max-w-sm mx-auto">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-xl font-bold text-foreground mb-2">You're all caught up!</h3>
                <p className="text-muted-foreground text-sm">Check back later for more posts</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Shareable Card Modal */}
      {showShareableCard && (
        <ShareableCard
          isOpen={showShareableCard}
          onClose={() => setShowShareableCard(false)}
          userId={user?.id}
        />
      )}
    </div>
  );
};

export default ExplorePage;
