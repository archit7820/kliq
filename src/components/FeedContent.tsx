
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { LoaderCircle } from "lucide-react";

// Mobile-first improvements and feed logic
const FeedContent = ({ user }: { user: any }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Helper function: get user friends IDs
    const fetchFriendIds = async () => {
      const { data, error } = await supabase
        .from("friends")
        .select("*")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
      const ids =
        data?.map((f) =>
          f.user1_id === user.id ? f.user2_id : f.user1_id
        ) || [];
      return ids;
    };

    const fetchFeed = async () => {
      setLoading(true);
      // Load all activities
      const { data: activities } = await supabase
        .from("activities")
        .select("*")
        .order("created_at", { ascending: false }); // Most recent first

      const friendIds = await fetchFriendIds();

      // Sort: friend posts first, then others—recency within each group
      const friendPosts = [];
      const otherPosts = [];

      for (const post of activities || []) {
        if (friendIds.includes(post.user_id)) {
          friendPosts.push(post);
        } else {
          otherPosts.push(post);
        }
      }

      setPosts([...friendPosts, ...otherPosts]);
      setLoading(false);
    };

    fetchFeed();
    // eslint-disable-next-line
  }, [user]);

  if (!user)
    return <div className="p-6 text-gray-400 text-center">Sign in to see your feed</div>;

  if (loading)
    return (
      <div className="flex items-center justify-center p-8">
        <LoaderCircle className="animate-spin w-8 h-8 text-green-400" />
      </div>
    );

  return (
    <div className="flex flex-col gap-5">
      {posts.length === 0 ? (
        <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-green-50 to-blue-50 text-center text-gray-400 border">
          No activities yet. Add your first!
        </div>
      ) : (
        posts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-2xl p-4 shadow-lg border flex flex-col sm:flex-row gap-4"
          >
            {/* Render post details mobile-first */}
            <div>
              <div className="font-semibold text-green-800">
                {post.activity}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(post.created_at).toLocaleString()}
              </div>
              <div className="text-gray-500 mt-2">{post.caption}</div>
              <div className="text-green-400 mt-1 text-xs">{post.category}</div>
            </div>
            {/* You can optionally add buttons for like/comment here */}
          </div>
        ))
      )}
    </div>
  );
};

export default FeedContent;
