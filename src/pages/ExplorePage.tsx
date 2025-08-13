import React, { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostCard from "@/components/PostCard";
import PostDetail from "@/components/PostDetail";
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
    environmental_impact: number;
    social_connection: number;
    adventure_intensity: number;
    economic_impact: number;
    learning_growth: number;
  };
}

const ExplorePage = () => {
  const { user } = useAuthStatus();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

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
        .limit(50);

      if (error) throw error;
      
      // Transform the data to match our Post interface and add mock profile data
      const transformedPosts = (data || []).map(activity => ({
        ...activity,
        profiles: {
          display_name: "User " + activity.user_id.slice(-4),
          avatar_url: undefined
        },
        activity_analysis: {
          environmental_impact: Math.random() * 100,
          social_connection: Math.random() * 100,
          adventure_intensity: Math.random() * 100,
          economic_impact: Math.random() * 100,
          learning_growth: Math.random() * 100,
        }
      }));
      
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
      case "friends":
        // TODO: Filter by friends when friend relationship is available
        filtered = posts;
        break;
      case "trending":
        filtered = posts.filter(post => (post.carbon_footprint_kg || 0) > 5);
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
    <div className="min-h-screen bg-gradient-to-br from-mint-50 to-sky-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold text-foreground">Explore</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Search className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Filter className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4 pb-3">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="friends" className="text-xs">Friends</TabsTrigger>
            <TabsTrigger value="trending" className="text-xs">Trending</TabsTrigger>
            <TabsTrigger value="category" className="text-xs">Category</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="p-4 pb-20">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card rounded-2xl p-4 shadow-sm animate-pulse">
                <div className="aspect-video bg-muted rounded-xl mb-4" />
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPosts.map(post => (
              <PostCard 
                key={post.id} 
                post={post} 
                onClick={() => handlePostClick(post)}
                onUpdate={(updatedPost) => {
                  setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
                }}
              />
            ))}

            {filteredPosts.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No posts found for this filter.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;