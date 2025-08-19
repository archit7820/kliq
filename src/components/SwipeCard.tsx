
import React, { useState } from "react";
import { Heart, MessageCircle, Share, X, Zap, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SwipeCardProps {
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
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onTap: () => void;
  style?: React.CSSProperties;
}

const categoryColors: Record<string, string> = {
  "thrift_fit": "bg-mint-100 text-mint-800 border-mint-200",
  "cycle_commute": "bg-sky-100 text-sky-800 border-sky-200",
  "sustainable_food": "bg-green-100 text-green-800 border-green-200",
  "eco_travel": "bg-blue-100 text-blue-800 border-blue-200",
  "zero_waste": "bg-purple-100 text-purple-800 border-purple-200",
  "default": "bg-muted text-muted-foreground border-border"
};

const SwipeCard = ({ post, onSwipeLeft, onSwipeRight, onTap, style }: SwipeCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 50) + 5);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    onSwipeRight();
  };

  const handlePass = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSwipeLeft();
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

  // Safe category handling with null checks
  const safeCategory = post.category || "default";
  const categoryColorClass = categoryColors[safeCategory] || categoryColors.default;
  const displayCategory = safeCategory.replace('_', ' ');

  return (
    <div 
      className="relative w-full h-full bg-card rounded-3xl shadow-lg overflow-hidden cursor-pointer"
      onClick={onTap}
      style={style}
    >
      {/* Background Image/Video */}
      <div className="absolute inset-0">
        {post.image_url && (
          <img 
            src={post.image_url} 
            alt={post.activity || "Activity"}
            className="w-full h-full object-cover"
          />
        )}
        {post.video_url && (
          <video 
            src={post.video_url}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
          />
        )}
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      </div>

      {/* Top content */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10">
        <div className="flex items-center justify-between">
          {/* Category Tag */}
          <Badge className={cn("text-xs font-medium border backdrop-blur-sm", categoryColorClass)}>
            {displayCategory}
          </Badge>

          {/* Impact Score */}
          <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-full px-3 py-1">
            <TrendingUp className="w-3 h-3 text-white" />
            <span className="text-xs font-semibold text-white">
              {Math.round((post.carbon_footprint_kg || 0) * 10)}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
        {/* User info */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="w-10 h-10 ring-2 ring-white/20">
            <AvatarImage src={post.profiles?.avatar_url} />
            <AvatarFallback className="text-xs bg-primary/20">
              {post.profiles?.display_name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold text-white text-sm">
              {post.profiles?.display_name || "Anonymous"}
            </p>
            <p className="text-white/70 text-xs">2h ago</p>
          </div>
        </div>

        {/* Content */}
        <div className="mb-6">
          <h3 className="font-bold text-white text-lg mb-2 line-clamp-2">
            {post.activity || "Activity"}
          </h3>
          <p className="text-white/90 text-sm line-clamp-3">
            {post.caption || "No description available"}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-8">
          <Button
            variant="ghost"
            size="lg"
            className="h-14 w-14 rounded-full bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm border border-red-500/30"
            onClick={handlePass}
          >
            <X className="w-6 h-6 text-red-400" />
          </Button>

          <Button
            variant="ghost"
            size="lg"
            className="h-12 w-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm"
            onClick={handleShare}
          >
            <Share className="w-5 h-5 text-white" />
          </Button>

          <Button
            variant="ghost"
            size="lg"
            className={cn(
              "h-14 w-14 rounded-full backdrop-blur-sm border",
              "bg-green-500/20 hover:bg-green-500/30 border-green-500/30"
            )}
            onClick={handleLike}
          >
            <Heart className={cn("w-6 h-6 text-green-400", isLiked && "fill-current")} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SwipeCard;
