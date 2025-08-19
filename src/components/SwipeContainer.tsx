
import React, { useState, useRef, useCallback } from "react";
import SwipeCard from "./SwipeCard";

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

interface SwipeContainerProps {
  posts: Post[];
  onPostClick: (post: Post) => void;
  onSwipeLeft: (post: Post) => void;
  onSwipeRight: (post: Post) => void;
}

const SwipeContainer = ({ posts, onPostClick, onSwipeLeft, onSwipeRight }: SwipeContainerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const currentPost = posts[currentIndex];
  const nextPost = posts[currentIndex + 1];

  const handleStart = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    dragStart.current = { x: clientX, y: clientY };
  }, []);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging) return;

    const deltaX = clientX - dragStart.current.x;
    const deltaY = clientY - dragStart.current.y;
    
    setDragOffset({ x: deltaX, y: deltaY });
  }, [isDragging]);

  const handleEnd = useCallback(() => {
    if (!isDragging) return;

    const threshold = 100;
    const { x } = dragOffset;

    if (Math.abs(x) > threshold) {
      // Swipe detected
      if (x > 0) {
        // Swipe right - like
        onSwipeRight(currentPost);
      } else {
        // Swipe left - pass
        onSwipeLeft(currentPost);
      }
      
      // Move to next card
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setDragOffset({ x: 0, y: 0 });
        setIsDragging(false);
      }, 200);
    } else {
      // Return to center
      setDragOffset({ x: 0, y: 0 });
      setIsDragging(false);
    }
  }, [isDragging, dragOffset, currentPost, onSwipeLeft, onSwipeRight]);

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  const handleSwipeLeft = () => {
    onSwipeLeft(currentPost);
    setCurrentIndex(prev => prev + 1);
  };

  const handleSwipeRight = () => {
    onSwipeRight(currentPost);
    setCurrentIndex(prev => prev + 1);
  };

  if (currentIndex >= posts.length) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-bold text-foreground mb-2">You're all caught up!</h3>
          <p className="text-muted-foreground">Check back later for more posts</p>
        </div>
      </div>
    );
  }

  const cardStyle = {
    transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.1}deg)`,
    transition: isDragging ? 'none' : 'transform 0.3s ease-out',
  };

  const nextCardStyle = {
    transform: `scale(${0.95 + Math.abs(dragOffset.x) * 0.0001})`,
    transition: isDragging ? 'transform 0.1s ease-out' : 'transform 0.3s ease-out',
  };

  return (
    <div className="relative flex-1 flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm h-[70vh]">
        {/* Next card (behind) */}
        {nextPost && (
          <div className="absolute inset-0 z-0" style={nextCardStyle}>
            <SwipeCard
              post={nextPost as any}
              onSwipeLeft={() => {}}
              onSwipeRight={() => {}}
              onTap={() => {}}
            />
          </div>
        )}

        {/* Current card */}
        {currentPost && (
          <div
            ref={cardRef}
            className="absolute inset-0 z-10"
            style={cardStyle}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <SwipeCard
              post={currentPost as any}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
              onTap={() => onPostClick(currentPost)}
            />
          </div>
        )}
      </div>

      {/* Progress indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="flex gap-1">
          {posts.slice(0, 10).map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index <= currentIndex ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SwipeContainer;
