import React, { useState, useEffect } from "react";
import { Zap, RotateCcw, Settings, LogOut, Users, UserPlus } from "lucide-react";
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card/95 backdrop-blur-lg border-b">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-xl">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Discover</h1>
                <p className="text-xs text-muted-foreground">Swipe to explore impact</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Settings className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-popover/95 backdrop-blur-sm">
                  <DropdownMenuItem 
                    onClick={() => navigate('/friends')} 
                    className="text-sm cursor-pointer"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Friends
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate('/invite')} 
                    className="text-sm cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="text-sm cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading amazing content...</p>
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-xl font-bold mb-2">No Posts Yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to share your impact!
            </p>
            <Button onClick={handleRefresh}>
              Try Again
            </Button>
          </div>
        </div>
      ) : (
        <SwipeContainer
          posts={posts}
          onPostClick={handlePostClick}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
        />
      )}

      {/* Instructions for first-time users */}
      <div className="p-4 bg-muted/30">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-2">
            💚 Swipe right or tap ❤️ to like • ❌ Swipe left or tap ✖️ to pass
          </p>
          <p className="text-xs text-muted-foreground">
            Tap on a card to view as story
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
