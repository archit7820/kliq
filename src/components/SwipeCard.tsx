
import React, { useState } from "react";
import { Heart, MessageCircle, Share, X, Zap, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import ImpactScoreBreakdown from "@/components/ImpactScoreBreakdown";

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

  // Calculate impact score from carbon footprint
  const impactScore = Math.round(Math.abs(post.carbon_footprint_kg || 0) * 10 + 50);

  return (
    <div 
      className="relative w-full h-full bg-card rounded-3xl shadow-lg overflow-hidden cursor-pointer flex flex-col"
      onClick={onTap}
      style={style}
    >
      {/* Background Image/Video - Takes 70% of height on mobile */}
      <div className="relative h-[70%] overflow-hidden rounded-t-3xl">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />

        {/* Top content overlay */}
        <div className="absolute top-0 left-0 right-0 p-3 z-10">
          <div className="flex items-center justify-between">
            {/* Category Tag */}
            <Badge className={cn("text-xs font-medium border backdrop-blur-sm", categoryColorClass)}>
              {displayCategory}
            </Badge>

            {/* Impact Score Chip */}
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
              <TrendingUp className="w-3 h-3 text-white" />
              <span className="text-xs font-bold text-white">
                {impactScore}
              </span>
            </div>
          </div>
        </div>

        {/* User info overlay at bottom of image */}
        <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
          <div className="flex items-center gap-2">
            <Avatar className="w-7 h-7 ring-2 ring-white/30">
              <AvatarImage src={post.profiles?.avatar_url} />
              <AvatarFallback className="text-xs bg-primary/20">
                {post.profiles?.display_name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-white text-sm">
                {post.profiles?.display_name || "Anonymous"}
              </p>
              <p className="text-white/80 text-xs">2h ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area - Takes 30% of height */}
      <div className="h-[30%] p-3 bg-card flex flex-col">
        {/* Activity Title - Compact */}
        <div className="mb-2">
          <h3 className="font-bold text-foreground text-base leading-tight line-clamp-1">
            {post.activity || "Activity"}
          </h3>
          <p className="text-muted-foreground text-xs line-clamp-1 mt-1">
            {post.caption || "No description available"}
          </p>
        </div>

        {/* Impact Score Breakdown - Compact Mobile Version */}
        <div className="flex-1 mb-3" onClick={(e) => e.stopPropagation()}>
          <ImpactScoreBreakdown
            dimensions={post.activity_analysis || {
              adventure_intensity: Math.floor(Math.random() * 40) + 60,
              social_connection: Math.floor(Math.random() * 50) + 50,
              environmental_impact: Math.floor(Math.random() * 60) + 40,
              economic_impact: Math.floor(Math.random() * 70) + 30,
              learning_growth: Math.floor(Math.random() * 80) + 20,
            }}
            impactScore={impactScore}
            compact={true}
          />
        </div>

        {/* Action buttons - Smaller and more compact */}
        <div className="flex items-center justify-center gap-4" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 rounded-full bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm border border-red-500/30"
            onClick={handlePass}
          >
            <X className="w-4 h-4 text-red-400" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 rounded-full bg-muted/20 hover:bg-muted/30 backdrop-blur-sm"
            onClick={handleShare}
          >
            <Share className="w-3 h-3 text-muted-foreground" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-10 w-10 rounded-full backdrop-blur-sm border",
              "bg-green-500/20 hover:bg-green-500/30 border-green-500/30"
            )}
            onClick={handleLike}
          >
            <Heart className={cn("w-4 h-4 text-green-400", isLiked && "fill-current")} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SwipeCard;
