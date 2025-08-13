import React, { useState } from "react";
import { 
  Heart, 
  MessageCircle, 
  Share, 
  Zap, 
  TrendingUp, 
  Award, 
  Flame,
  Star,
  Target,
  Trophy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import ImpactScoreModal from "@/components/ImpactScoreModal";
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
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 150) + 25);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showReaction, setShowReaction] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    
    if (!isLiked) {
      setShowReaction(true);
      setTimeout(() => setShowReaction(false), 1000);
    }
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
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
    onClick();
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
        className="border-2 border-border hover:border-primary/50 rounded-3xl overflow-hidden hover-scale cursor-pointer transition-all duration-300 bg-card shadow-lg hover:shadow-xl"
        onClick={onClick}
      >
        <CardContent className="p-0">
          {/* User Header with Gamification */}
          <div className="p-4 pb-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-12 h-12 border-2 border-primary/20">
                    <AvatarImage src={post.profiles?.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {post.profiles?.display_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {/* Level Badge */}
                  <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-background">
                    {post.level || 1}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-foreground">
                      {post.profiles?.display_name || "Anonymous"}
                    </p>
                    {(post.streak || 0) > 5 && (
                      <div className="flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                        <Flame className="w-3 h-3" />
                        {post.streak}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">2h ago</p>
                    {(post.badges || 0) > 3 && (
                      <div className="flex items-center gap-1 text-xs text-amber-600">
                        <Award className="w-3 h-3" />
                        <span className="font-medium">{post.badges} badges</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Impact Score - More Prominent */}
              <div className="text-center">
                <Button
                  variant="outline"
                  className="h-auto p-3 bg-primary/5 border-2 border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all"
                  onClick={handleImpactClick}
                >
                  <div className="flex flex-col items-center gap-1">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <span className="text-lg font-bold text-primary">{totalScore}</span>
                    <span className="text-xs text-muted-foreground">Impact</span>
                  </div>
                </Button>
              </div>
            </div>

            {/* Category & Title */}
            <div className="space-y-2 mb-3">
              <Badge className={cn("text-xs font-semibold border", categoryInfo.color, categoryInfo.bg)}>
                <span className="mr-1">{categoryInfo.icon}</span>
                {categoryInfo.label}
              </Badge>
              
              <h3 className="font-bold text-lg text-foreground leading-tight">
                {post.activity} {post.emoji}
              </h3>
            </div>
          </div>

          {/* Media */}
          {post.image_url && (
            <div className="relative">
              <img 
                src={post.image_url} 
                alt={post.activity}
                className="w-full aspect-video object-cover"
              />
              
              {/* Impact Dimensions Preview */}
              <div className="absolute bottom-3 left-3 right-3">
                <div className="bg-background/90 backdrop-blur rounded-2xl p-3 border">
                  <div className="grid grid-cols-5 gap-2">
                    <div className="text-center">
                      <div className="text-xs font-medium text-green-600">🌱</div>
                      <div className="text-xs font-bold">{Math.round(analysis?.environmental_impact || 0)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-medium text-blue-600">🤝</div>
                      <div className="text-xs font-bold">{Math.round(analysis?.social_connection || 0)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-medium text-purple-600">⚡</div>
                      <div className="text-xs font-bold">{Math.round(analysis?.adventure_intensity || 0)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-medium text-amber-600">💰</div>
                      <div className="text-xs font-bold">{Math.round(analysis?.economic_impact || 0)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-medium text-indigo-600">📚</div>
                      <div className="text-xs font-bold">{Math.round(analysis?.learning_growth || 0)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content & Actions */}
          <div className="p-4 pt-3">
            <p className="text-muted-foreground mb-4 leading-relaxed line-clamp-2">
              {post.caption}
            </p>

            {/* Progress Bar for Overall Impact */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">Total Impact Progress</span>
                <span className="text-xs font-bold text-primary">{totalScore}/100</span>
              </div>
              <Progress value={totalScore} className="h-2 bg-muted" />
            </div>

            {/* Enhanced Action Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "rounded-full px-4 py-2 transition-all duration-200",
                    isLiked && "text-red-500 bg-red-50"
                  )}
                  onClick={handleLike}
                >
                  <Heart className={cn("w-5 h-5 mr-2", isLiked && "fill-current")} />
                  <span className="font-semibold">{likeCount}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full px-4 py-2"
                  onClick={handleComment}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  <span className="font-semibold">{Math.floor(Math.random() * 30) + 5}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full px-3 py-2"
                  onClick={handleShare}
                >
                  <Share className="w-5 h-5" />
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "rounded-full px-3 py-2 transition-colors",
                  isBookmarked && "text-amber-500 bg-amber-50"
                )}
                onClick={handleBookmark}
              >
                <Star className={cn("w-5 h-5", isBookmarked && "fill-current")} />
              </Button>
            </div>
          </div>
        </CardContent>

        {/* Reaction Animation */}
        {showReaction && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-6xl animate-ping opacity-80">❤️</div>
          </div>
        )}
      </Card>

      {/* Impact Score Modal */}
      <ImpactScoreModal
        isOpen={showImpactModal}
        onClose={() => setShowImpactModal(false)}
        post={post}
      />
    </>
  );
};

export default GamePostCard;