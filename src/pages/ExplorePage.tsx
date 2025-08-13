import React, { useState, useEffect } from "react";
import { Search, Filter, TrendingUp, Flame, Crown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import GamePostCard from "@/components/GamePostCard";
import PostDetail from "@/components/PostDetail";
import ImpactLeaderboard from "@/components/ImpactLeaderboard";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStatus } from "@/hooks/useAuthStatus";

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
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [activeTab, setActiveTab] = useState("trending");
  const [loading, setLoading] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [posts, activeTab]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      
      // Transform the data with enhanced gamified scoring
      const transformedPosts = (data || []).map(activity => {
        const environmental = Math.floor(Math.random() * 40) + 60; // 60-100
        const social = Math.floor(Math.random() * 50) + 50; // 50-100
        const adventure = Math.floor(Math.random() * 60) + 40; // 40-100
        const economic = Math.floor(Math.random() * 70) + 30; // 30-100
        const learning = Math.floor(Math.random() * 80) + 20; // 20-100
        
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
          total_impact_score: Math.floor((environmental + social + adventure + economic + learning) / 5),
          streak: Math.floor(Math.random() * 15) + 1,
          level: Math.floor(Math.random() * 20) + 1,
          badges: Math.floor(Math.random() * 8) + 1
        };
      });
      
      setPosts(transformedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterPosts = () => {
    let filtered = posts;

    switch (activeTab) {
      case "trending":
        filtered = posts
          .filter(post => (post as any).total_impact_score > 75)
          .sort((a, b) => (b as any).total_impact_score - (a as any).total_impact_score);
        break;
      case "friends":
        filtered = posts.slice(0, 20); // Mock friends filter
        break;
      case "achievements":
        filtered = posts.filter(post => (post as any).badges > 5);
        break;
      default:
        filtered = posts;
    }

    setFilteredPosts(filtered);
  };

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
  };

  const handleCloseDetail = () => {
    setSelectedPost(null);
  };

  if (selectedPost) {
    return (
      <PostDetail 
        post={selectedPost} 
        onClose={handleCloseDetail}
        onUpdate={(updatedPost) => {
          setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
          setSelectedPost(updatedPost);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header */}
      <div className="sticky top-0 z-10 bg-background border-b-2 border-primary/20">
        <div className="p-4">
          {/* Top Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-xl">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Impact Hub</h1>
                <p className="text-sm text-muted-foreground">Real actions, real change</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full border-2 hover:bg-primary hover:text-primary-foreground transition-all"
                onClick={() => setShowLeaderboard(!showLeaderboard)}
              >
                <Crown className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full border-2">
                <Search className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full border-2">
                <Filter className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Stats Bar - Simplified for Mobile */}
          <div className="flex items-center justify-between mb-4 p-3 bg-muted/20 rounded-xl">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium">{filteredPosts.length} Active</span>
            </div>
            <div className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-500" />
              <span className="text-xs font-medium">47 days</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-blue-500" />
              <span className="text-xs font-medium">+2.1K Impact</span>
            </div>
          </div>

          {/* Enhanced Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 bg-muted/30 p-1">
              <TabsTrigger 
                value="trending" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold"
              >
                🔥 Trending
              </TabsTrigger>
              <TabsTrigger 
                value="all"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold"
              >
                🌍 All
              </TabsTrigger>
              <TabsTrigger 
                value="friends"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold"
              >
                👥 Friends
              </TabsTrigger>
              <TabsTrigger 
                value="achievements"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold"
              >
                🏆 Elite
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Leaderboard */}
      {showLeaderboard && (
        <div className="p-4 border-b bg-muted/20">
          <ImpactLeaderboard />
        </div>
      )}

      {/* Content */}
      <div className="p-4 pb-20">
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card rounded-3xl p-6 border-2 border-muted animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-muted rounded-2xl" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
                <div className="aspect-video bg-muted rounded-2xl mb-4" />
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map(post => (
              <GamePostCard 
                key={post.id} 
                post={post as any}
                onClick={() => handlePostClick(post)}
                onUpdate={(updatedPost) => {
                  setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
                }}
              />
            ))}

            {filteredPosts.length === 0 && !loading && (
              <div className="text-center py-8 bg-muted/10 rounded-2xl">
                <div className="text-4xl mb-3">🌱</div>
                <h3 className="text-lg font-bold mb-2">No Impact Posts Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Be the first to share your real-world action!</p>
                <Button className="rounded-full px-6">Log Your Impact</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;