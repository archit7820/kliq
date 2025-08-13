import React, { useState } from "react";
import { 
  Heart, 
  MessageCircle, 
  Share, 
  TrendingUp, 
  Award, 
  Flame,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ImpactScoreModal from "@/components/ImpactScoreModal";
import PostInteractionModal from "@/components/PostInteractionModal";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface GamePostCardProps {
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
      environmental_impact?: number;
      social_connection?: number;
      adventure_intensity?: number;
      economic_impact?: number;
      learning_growth?: number;
    } | null;
    total_impact_score?: number;
    streak?: number;
    level?: number;
    badges?: number;
  };
  onClick: () => void;
  onUpdate: (post: any) => void;
}

const categoryConfig: Record<string, { color: string; bg: string; icon: string; label: string }> = {
  "thrift_fit": { color: "text-emerald-700", bg: "bg-emerald-100", icon: "👔", label: "Thrift Fit" },
  "cycle_commute": { color: "text-blue-700", bg: "bg-blue-100", icon: "🚴", label: "Cycle Commute" },
  "sustainable_food": { color: "text-green-700", bg: "bg-green-100", icon: "🥗", label: "Sustainable Food" },
  "eco_travel": { color: "text-purple-700", bg: "bg-purple-100", icon: "🌍", label: "Eco Travel" },
  "zero_waste": { color: "text-orange-700", bg: "bg-orange-100", icon: "♻️", label: "Zero Waste" },
  "default": { color: "text-gray-700", bg: "bg-gray-100", icon: "🌱", label: "Eco Action" }
};

const GamePostCard = ({ post, onClick, onUpdate }: GamePostCardProps) => {
  const [showImpactModal, setShowImpactModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 150) + 25);
  const [showReaction, setShowReaction] = useState(false);
  const { toast } = useToast();

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    
    if (!isLiked) {
      setShowReaction(true);
      setTimeout(() => setShowReaction(false), 800);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: post.activity,
        text: post.caption,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Post link copied to clipboard.",
      });
    }
  };

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCommentsModal(true);
  };

  const handleImpactClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowImpactModal(true);
  };

  const categoryInfo = categoryConfig[post.category] || categoryConfig.default;
  const totalScore = post.total_impact_score || 0;
  const analysis = post.activity_analysis;

  return (
    <>
      <Card 
        className="border border-border rounded-2xl overflow-hidden hover-scale cursor-pointer transition-all duration-200 bg-card shadow-sm hover:shadow-md"
        onClick={onClick}
      >
        <CardContent className="p-0">
          {/* User Header - Simplified */}
          <div className="p-4 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={post.profiles?.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                      {post.profiles?.display_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center text-[10px]">
                    {post.level || 1}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-foreground">
                      {post.profiles?.display_name || "Anonymous"}
                    </p>
                    {(post.streak || 0) > 5 && (
                      <div className="flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                        <Flame className="w-3 h-3" />
                        <span className="text-xs font-medium">{post.streak}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">2h ago</p>
                </div>
              </div>

              {/* Impact Score - Compact */}
              <Button
                variant="outline"
                size="sm"
                className="h-auto px-2 py-1.5 bg-primary/5 border-primary/30 hover:bg-primary/10"
                onClick={handleImpactClick}
              >
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3 text-primary" />
                  <div className="text-center">
                    <div className="text-sm font-bold text-primary">{totalScore}</div>
                    <div className="text-[9px] text-muted-foreground leading-none">Impact</div>
                  </div>
                </div>
              </Button>
            </div>
          </div>

          {/* Category & Title - Compact */}
          <div className="px-4 pb-2">
            <div className="flex items-center gap-2 mb-1.5">
              <Badge className={cn("text-xs px-1.5 py-0.5", categoryInfo.color, categoryInfo.bg)}>
                <span className="mr-1">{categoryInfo.icon}</span>
                {categoryInfo.label}
              </Badge>
              {(post.badges || 0) > 3 && (
                <div className="flex items-center gap-1 text-xs text-amber-600">
                  <Award className="w-3 h-3" />
                  <span className="text-xs">{post.badges}</span>
                </div>
              )}
            </div>
            
            <h3 className="font-semibold text-sm text-foreground leading-tight">
              {post.activity} {post.emoji}
            </h3>
          </div>

          {/* Media - Properly Sized for Mobile */}
          {post.image_url && (
            <div className="relative">
              <img 
                src={post.image_url} 
                alt={post.activity}
                className="w-full h-48 sm:h-56 object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-4 pt-2">
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
              {post.caption}
            </p>

            {/* Impact Breakdown - Compact Icons */}
            <div className="bg-muted/20 rounded-lg p-2.5 mb-3">
              <div className="grid grid-cols-5 gap-1 text-center">
                <div>
                  <div className="text-sm font-bold text-green-600">{Math.round(analysis?.environmental_impact || 0)}</div>
                  <div className="text-[9px] text-muted-foreground">🌱</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-blue-600">{Math.round(analysis?.social_connection || 0)}</div>
                  <div className="text-[9px] text-muted-foreground">🤝</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-purple-600">{Math.round(analysis?.adventure_intensity || 0)}</div>
                  <div className="text-[9px] text-muted-foreground">⚡</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-amber-600">{Math.round(analysis?.economic_impact || 0)}</div>
                  <div className="text-[9px] text-muted-foreground">💰</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-indigo-600">{Math.round(analysis?.learning_growth || 0)}</div>
                  <div className="text-[9px] text-muted-foreground">📚</div>
                </div>
              </div>
            </div>

            {/* Action Bar - Compact & Functional */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "rounded-full px-2.5 py-1.5 h-auto",
                    isLiked && "text-red-500 bg-red-50"
                  )}
                  onClick={handleLike}
                >
                  <Heart className={cn("w-3.5 h-3.5 mr-1", isLiked && "fill-current")} />
                  <span className="text-xs font-medium">{likeCount}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full px-2.5 py-1.5 h-auto"
                  onClick={handleComment}
                >
                  <MessageCircle className="w-3.5 h-3.5 mr-1" />
                  <span className="text-xs font-medium">{Math.floor(Math.random() * 30) + 5}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full p-1.5 h-auto"
                  onClick={handleShare}
                >
                  <Share className="w-3.5 h-3.5" />
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="rounded-full p-1.5 h-auto text-muted-foreground hover:text-amber-500"
              >
                <Star className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>

        {/* Reaction Animation - Subtle */}
        {showReaction && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-4xl animate-bounce opacity-90">❤️</div>
          </div>
        )}
      </Card>

      {/* Impact Score Modal */}
      <ImpactScoreModal
        isOpen={showImpactModal}
        onClose={() => setShowImpactModal(false)}
        post={post}
      />

      {/* Comments Modal */}
      <PostInteractionModal
        isOpen={showCommentsModal}
        onClose={() => setShowCommentsModal(false)}
        post={post}
      />
    </>
  );
};

export default GamePostCard;