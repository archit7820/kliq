
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
import SwipeContainer from "@/components/SwipeContainer";
import StoryViewer from "@/components/StoryViewer";
import ShareableCard from "@/components/ShareableCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { toast } from "@/hooks/use-toast";

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
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [storyIndex, setStoryIndex] = useState(0);
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
      
      // Transform the data with enhanced gamified scoring
      const transformedPosts = (data || []).map(activity => {
        const environmental = Math.floor(Math.random() * 40) + 60;
        const social = Math.floor(Math.random() * 50) + 50;
        const adventure = Math.floor(Math.random() * 60) + 40;
        const economic = Math.floor(Math.random() * 70) + 30;
        const learning = Math.floor(Math.random() * 80) + 20;
        
        return {
          ...activity,
          profiles: {
            display_name: "ImpactMaker" + activity.user_id.slice(-4),
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

  const handlePostClick = (post: Post) => {
    const index = posts.findIndex(p => p.id === post.id);
    setStoryIndex(index);
    setSelectedPost(post);
  };

  const handleSwipeLeft = (post: Post) => {
    console.log("Passed on:", post.activity);
    toast({
      title: "Passed",
      description: `Skipped "${post.activity}"`,
    });
  };

  const handleSwipeRight = (post: Post) => {
    console.log("Liked:", post.activity);
    toast({
      title: "Liked! 💚",
      description: `You liked "${post.activity}"`,
    });
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchPosts();
  };

  if (selectedPost) {
    return (
      <StoryViewer
        posts={posts}
        initialIndex={storyIndex}
        onClose={() => setSelectedPost(null)}
        onUpdate={(updatedPost) => {
          setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
        }}
      />
    );
  }

  return (
    <div className="h-screen bg-background overflow-hidden" style={{ touchAction: 'none' }}>
      {/* Full Screen Content */}
      {loading ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <SwipeContainer
          posts={posts}
          onPostClick={handlePostClick}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
        />
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
