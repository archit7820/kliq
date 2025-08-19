
import React, { useState, useEffect } from "react";
import { X, Heart, MessageCircle, Share, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

interface StoryViewerProps {
  posts: Post[];
  initialIndex: number;
  onClose: () => void;
  onUpdate: (post: Post) => void;
}

const StoryViewer = ({ posts, initialIndex, onClose, onUpdate }: StoryViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const currentPost = posts[currentIndex];
  const totalPosts = posts.length;

  // Auto-advance story every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          if (currentIndex < totalPosts - 1) {
            setCurrentIndex(prev => prev + 1);
            return 0;
          } else {
            onClose();
            return prev;
          }
        }
        return prev + 2; // 2% per 100ms = 5 seconds total
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentIndex, totalPosts, onClose]);

  // Reset progress when changing stories
  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalPosts - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentPost.activity,
        text: currentPost.caption,
        url: window.location.href
      });
    }
  };

  if (!currentPost) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Progress bars */}
      <div className="flex gap-1 p-2">
        {posts.map((_, index) => (
          <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full bg-white transition-all duration-100",
                index < currentIndex && "w-full",
                index === currentIndex && `w-[${progress}%]`,
                index > currentIndex && "w-0"
              )}
              style={{ 
                width: index < currentIndex ? "100%" : index === currentIndex ? `${progress}%` : "0%" 
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 absolute top-4 left-0 right-0 z-10">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 ring-2 ring-white/20">
            <AvatarImage src={currentPost.profiles?.avatar_url} />
            <AvatarFallback className="text-xs">
              {currentPost.profiles?.display_name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-white text-sm">
              {currentPost.profiles?.display_name || "Anonymous"}
            </p>
            <p className="text-white/70 text-xs">2h ago</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Content area with navigation */}
      <div className="flex-1 relative flex items-center">
        {/* Left tap area */}
        <div 
          className="absolute left-0 top-0 w-1/3 h-full z-20 flex items-center justify-start pl-4"
          onClick={handlePrevious}
        >
          {currentIndex > 0 && (
            <ChevronLeft className="w-8 h-8 text-white/50" />
          )}
        </div>

        {/* Right tap area */}
        <div 
          className="absolute right-0 top-0 w-1/3 h-full z-20 flex items-center justify-end pr-4"
          onClick={handleNext}
        >
          <ChevronRight className="w-8 h-8 text-white/50" />
        </div>

        {/* Media */}
        <div className="w-full h-full relative">
          {currentPost.image_url && (
            <img 
              src={currentPost.image_url} 
              alt={currentPost.activity}
              className="w-full h-full object-cover"
            />
          )}
          {currentPost.video_url && (
            <video 
              src={currentPost.video_url}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
            />
          )}
        </div>
      </div>

      {/* Bottom content */}
      <div className="p-6 bg-gradient-to-t from-black/80 to-transparent">
        <div className="mb-4">
          <Badge className="mb-3 bg-white/20 text-white border-white/30">
            {currentPost.category.replace('_', ' ')}
          </Badge>
          <h3 className="font-bold text-white text-xl mb-2">
            {currentPost.activity}
          </h3>
          <p className="text-white/90 text-sm leading-relaxed">
            {currentPost.caption}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 gap-2"
              onClick={handleLike}
            >
              <Heart className={cn("w-5 h-5", isLiked && "fill-current text-red-400")} />
              <span className="text-sm">{Math.floor(Math.random() * 50) + 5}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">{Math.floor(Math.random() * 20) + 1}</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
            onClick={handleShare}
          >
            <Share className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StoryViewer;
