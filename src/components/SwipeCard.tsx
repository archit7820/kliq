
import React, { useState } from "react";
import { Heart, MessageCircle, Share, X, Zap, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import ImpactScoreBreakdown from "@/components/ImpactScoreBreakdown";
import ImpactScoreModal from "@/components/ImpactScoreModal";

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
  "thrift_fit": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "cycle_commute": "bg-sky-100 text-sky-800 border-sky-200",
  "sustainable_food": "bg-green-100 text-green-800 border-green-200",
  "eco_travel": "bg-blue-100 text-blue-800 border-blue-200",
  "zero_waste": "bg-purple-100 text-purple-800 border-purple-200",
  "default": "bg-muted text-muted-foreground border-border"
};

const SwipeCard = ({ post, onSwipeLeft, onSwipeRight, onTap, style }: SwipeCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 50) + 5);
  const [showImpactModal, setShowImpactModal] = useState(false);

  const handleLike = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    onSwipeRight();
  };

  const handlePass = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onSwipeLeft();
  };

  const handleShare = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (navigator.share) {
      navigator.share({
        title: post.activity,
        text: post.caption,
        url: window.location.href
      });
    }
  };

  const handleCardClick = (e: React.MouseEvent | React.TouchEvent) => {
    const target = e.target as HTMLElement;
    const isImageSection = target.closest('.image-section');
    const isImpactSection = target.closest('.impact-section');
    const isActionButtons = target.closest('.action-buttons');
    const isImpactChip = target.closest('.impact-chip');
    
    // Don't trigger card tap if clicking on interactive elements
    if (isImpactSection || isActionButtons || isImpactChip) {
      return;
    }
    
    if (isImageSection) {
      onTap();
    }
  };

  const handleImpactClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('Impact clicked, opening modal'); // Debug log
    setShowImpactModal(true);
  };

  const handleImpactChipClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('Impact chip clicked, opening modal'); // Debug log
    setShowImpactModal(true);
  };

  const safeCategory = post.category || "default";
  const categoryColorClass = categoryColors[safeCategory] || categoryColors.default;
  const displayCategory = safeCategory.replace('_', ' ');
  const impactScore = Math.round(Math.abs(post.carbon_footprint_kg || 0) * 10 + 50);

  return (
    <>
      <div 
        className="relative w-full h-full bg-card rounded-3xl shadow-xl overflow-hidden cursor-pointer flex flex-col border border-border/20"
        onClick={handleCardClick}
        style={style}
      >
        {/* Background Image/Video - Mobile optimized height */}
        <div className="image-section relative h-[68%] overflow-hidden rounded-t-3xl">
          {post.image_url && (
            <img 
              src={post.image_url} 
              alt={post.activity || "Activity"}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )}
          {post.video_url && (
            <video 
              src={post.video_url}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          )}
          
          {/* Enhanced gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/50" />

          {/* Top content overlay - Mobile optimized */}
          <div className="absolute top-0 left-0 right-0 p-3 z-10">
            <div className="flex items-center justify-between">
              <Badge className={cn("text-xs font-medium border backdrop-blur-md", categoryColorClass)}>
                {displayCategory}
              </Badge>

              {/* Impact Score Chip - Enhanced for mobile touch */}
              <div 
                className="impact-chip flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-3 py-2 cursor-pointer touch-manipulation active:scale-95 transition-transform"
                onClick={handleImpactChipClick}
                onTouchEnd={handleImpactChipClick}
              >
                <TrendingUp className="w-3 h-3 text-white" />
                <span className="text-xs font-bold text-white">
                  {impactScore}
                </span>
              </div>
            </div>
          </div>

          {/* User info overlay - Mobile optimized */}
          <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8 ring-2 ring-white/40">
                <AvatarImage src={post.profiles?.avatar_url} />
                <AvatarFallback className="text-xs bg-primary/30 text-white">
                  {post.profiles?.display_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-white text-sm leading-tight">
                  {post.profiles?.display_name || "Anonymous"}
                </p>
                <p className="text-white/80 text-xs">2h ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area - Mobile optimized */}
        <div className="h-[32%] p-3 bg-card flex flex-col">
          {/* Activity Title */}
          <div className="mb-2 flex-shrink-0">
            <h3 className="font-bold text-foreground text-base leading-tight line-clamp-1">
              {post.activity || "Activity"}
            </h3>
            <p className="text-muted-foreground text-xs line-clamp-1 mt-1">
              {post.caption || "No description available"}
            </p>
          </div>

          {/* Impact Score Breakdown - Compact mobile version with enhanced touch */}
          <div 
            className="impact-section flex-1 mb-2 min-h-0 cursor-pointer touch-manipulation active:scale-[0.98] transition-transform" 
            onClick={handleImpactClick}
            onTouchEnd={handleImpactClick}
          >
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
              interactive={false}
            />
          </div>

          {/* Action buttons - Mobile optimized */}
          <div className="action-buttons flex items-center justify-center gap-3 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 rounded-full bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm border border-red-500/30 touch-manipulation active:scale-95"
              onClick={handlePass}
              onTouchEnd={handlePass}
            >
              <X className="w-4 h-4 text-red-400" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 rounded-full bg-muted/20 hover:bg-muted/30 backdrop-blur-sm touch-manipulation active:scale-95"
              onClick={handleShare}
              onTouchEnd={handleShare}
            >
              <Share className="w-3 h-3 text-muted-foreground" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-10 w-10 rounded-full backdrop-blur-sm border touch-manipulation active:scale-95",
                "bg-green-500/20 hover:bg-green-500/30 border-green-500/30"
              )}
              onClick={handleLike}
              onTouchEnd={handleLike}
            >
              <Heart className={cn("w-4 h-4 text-green-400", isLiked && "fill-current")} />
            </Button>
          </div>
        </div>
      </div>

      <ImpactScoreModal
        isOpen={showImpactModal}
        onClose={() => setShowImpactModal(false)}
        post={post}
      />
    </>
  );
};

export default SwipeCard;
