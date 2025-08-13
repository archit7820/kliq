import React, { useState } from "react";
import { ArrowLeft, Heart, MessageCircle, Share, TrendingUp, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ImpactScoreModal from "@/components/ImpactScoreModal";
import { cn } from "@/lib/utils";

interface PostDetailProps {
  post: {
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
  };
  onClose: () => void;
  onUpdate: (post: any) => void;
}

const categoryColors: Record<string, string> = {
  "thrift_fit": "bg-mint-100 text-mint-800 border-mint-200",
  "cycle_commute": "bg-sky-100 text-sky-800 border-sky-200",
  "sustainable_food": "bg-green-100 text-green-800 border-green-200",
  "eco_travel": "bg-blue-100 text-blue-800 border-blue-200",
  "zero_waste": "bg-purple-100 text-purple-800 border-purple-200",
  "default": "bg-muted text-muted-foreground border-border"
};

const mockComments = [
  {
    id: 1,
    user: "Sarah Chen",
    avatar: "/placeholder.svg",
    content: "This is so inspiring! I need to start doing more activities like this 🌱",
    time: "2h ago"
  },
  {
    id: 2,
    user: "Mike Johnson",
    avatar: "/placeholder.svg",
    content: "Great impact score! What was the most challenging part?",
    time: "4h ago"
  },
  {
    id: 3,
    user: "Emma Wilson",
    avatar: "/placeholder.svg",
    content: "Love seeing people make real change in their communities 💚",
    time: "6h ago"
  }
];

const PostDetail = ({ post, onClose, onUpdate }: PostDetailProps) => {
  const [showImpactModal, setShowImpactModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 50) + 5);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(mockComments);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.activity,
        text: post.caption,
        url: window.location.href
      });
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const comment = {
      id: comments.length + 1,
      user: "You",
      avatar: "/placeholder.svg",
      content: newComment,
      time: "now"
    };
    
    setComments(prev => [comment, ...prev]);
    setNewComment("");
  };

  const categoryColorClass = categoryColors[post.category] || categoryColors.default;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">Post Details</h1>
        </div>
      </div>

      <div className="pb-20">
        {/* Media */}
        {(post.image_url || post.video_url) && (
          <div className="relative aspect-video">
            {post.image_url && (
              <img 
                src={post.image_url} 
                alt={post.activity}
                className="w-full h-full object-cover"
              />
            )}
            {post.video_url && (
              <video 
                src={post.video_url}
                className="w-full h-full object-cover"
                controls
              />
            )}
            
            {/* Category Tag */}
            <div className="absolute top-4 left-4">
              <Badge className={cn("text-sm font-medium border", categoryColorClass)}>
                {post.category.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        )}

        <div className="p-4 space-y-6">
          {/* User Info & Impact Score */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={post.profiles?.avatar_url} />
                <AvatarFallback>
                  {post.profiles?.display_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">
                  {post.profiles?.display_name || "Anonymous"}
                </p>
                <p className="text-sm text-muted-foreground">2 hours ago</p>
              </div>
            </div>

            <Button
              variant="outline"
              className="bg-primary/10 border-primary/20 hover:bg-primary/20"
              onClick={() => setShowImpactModal(true)}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              <span className="font-semibold">{Math.round((post.carbon_footprint_kg || 0) * 10)}</span>
            </Button>
          </div>

          {/* Content */}
          <div>
            <h1 className="text-xl font-bold text-foreground mb-3">
              {post.activity}
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              {post.caption}
            </p>
            {post.explanation && (
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                {post.explanation}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between py-3 border-t border-b">
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                className={cn(
                  "gap-2 px-4",
                  isLiked && "text-red-500"
                )}
                onClick={handleLike}
              >
                <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
                <span>{likeCount}</span>
              </Button>

              <Button variant="ghost" className="gap-2 px-4">
                <MessageCircle className="w-5 h-5" />
                <span>{comments.length}</span>
              </Button>
            </div>

            <Button variant="ghost" onClick={handleShare}>
              <Share className="w-5 h-5" />
            </Button>
          </div>

          {/* Add Comment */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>Y</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[40px] resize-none"
                />
                <Button 
                  size="icon" 
                  className="flex-shrink-0"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-4">
            <h3 className="font-semibold">Comments</h3>
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={comment.avatar} />
                  <AvatarFallback>{comment.user.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">{comment.user}</p>
                    <p className="text-xs text-muted-foreground">{comment.time}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Impact Score Modal */}
      <ImpactScoreModal
        isOpen={showImpactModal}
        onClose={() => setShowImpactModal(false)}
        post={post}
      />
    </div>
  );
};

export default PostDetail;