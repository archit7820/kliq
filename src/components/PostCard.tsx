import React, { useState } from "react";
import { Heart, MessageCircle, Share, Zap, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import ImpactScoreModal from "@/components/ImpactScoreModal";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: {
    id: string;
    user_id: string;
    activity: string;
    caption: string;
    category: string;
    image_url?: string;
    video_url?: string;
    carbon_footprint_kg: number;
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
  onClick: () => void;
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

const PostCard = ({ post, onClick, onUpdate }: PostCardProps) => {
  const [showImpactModal, setShowImpactModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 50) + 5);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

      const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: post.activity,
        text: post.caption,
        url: window.location.href
      });
    }
  };

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Open comment modal
  };

  const handleImpactClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowImpactModal(true);
  };

  const categoryColorClass = categoryColors[post.category] || categoryColors.default;

  return (
    <>
      <div 
        className="bg-card rounded-2xl shadow-sm border border-border/50 overflow-hidden hover-scale cursor-pointer"
        onClick={onClick}
      >
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
                controls={false}
                muted
              />
            )}
            
            {/* Category Tag */}
            <div className="absolute top-3 left-3">
              <Badge className={cn("text-xs font-medium border", categoryColorClass)}>
                {post.category.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        )}

        <div className="p-4">
          {/* User Row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={post.profiles?.avatar_url} />
                <AvatarFallback className="text-xs">
                  {post.profiles?.display_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm text-foreground">
                  {post.profiles?.display_name || "Anonymous"}
                </p>
                <p className="text-xs text-muted-foreground">2h ago</p>
              </div>
            </div>

            {/* Impact Score Chip */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 bg-primary/10 border-primary/20 hover:bg-primary/20"
              onClick={handleImpactClick}
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              <span className="text-xs font-semibold">{Math.round((post.carbon_footprint_kg || 0) * 10)}</span>
            </Button>
          </div>

          {/* Content */}
          <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
            {post.activity}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {post.caption}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 px-3 gap-2",
                  isLiked && "text-red-500"
                )}
                onClick={handleLike}
              >
                <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                <span className="text-xs">{likeCount}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 gap-2"
                onClick={handleComment}
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-xs">{Math.floor(Math.random() * 20) + 1}</span>
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3"
              onClick={handleShare}
            >
              <Share className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Impact Score Modal */}
      <ImpactScoreModal
        isOpen={showImpactModal}
        onClose={() => setShowImpactModal(false)}
        post={post}
      />
    </>
  );
};

export default PostCard;