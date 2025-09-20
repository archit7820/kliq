
import React, { useState, useRef, useCallback, useEffect } from "react";
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
  const [isAnimating, setIsAnimating] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [nextCardOffset, setNextCardOffset] = useState({ x: 0, y: 0 });
  const dragStart = useRef({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const currentPost = posts[currentIndex];
  const nextPost = posts[currentIndex + 1];
  const thirdPost = posts[currentIndex + 2];

  const handleStart = useCallback((clientX: number, clientY: number, e: any) => {
    // Prevent starting drag if already animating or if target is an interactive element
    if (isAnimating) return;
    
    const target = e.target as HTMLElement;
    const isButton = target.closest('button') || target.tagName === 'BUTTON';
    const isInteractive = target.closest('.action-buttons') || target.closest('.impact-chip');
    
    if (isButton || isInteractive) return;
    
    setIsDragging(true);
    dragStart.current = { x: clientX, y: clientY };
    setDragOffset({ x: 0, y: 0 });
  }, [isAnimating]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || isAnimating) return;

    const deltaX = clientX - dragStart.current.x;
    const deltaY = clientY - dragStart.current.y;
    
    // Only allow horizontal movement for swipe
    setDragOffset({ x: deltaX, y: deltaY * 0.3 }); // Reduce vertical movement
  }, [isDragging, isAnimating]);

  const handleEnd = useCallback(() => {
    if (!isDragging || isAnimating) return;

    const threshold = 100; // Increased threshold for better UX
    const { x } = dragOffset;

    if (Math.abs(x) > threshold) {
      setIsAnimating(true);
      
      // Determine swipe direction and set up next card entrance
      const direction = x > 0 ? 'right' : 'left';
      setSwipeDirection(direction);
      
      // Animate current card out of view
      const exitX = x > 0 ? window.innerWidth : -window.innerWidth;
      setDragOffset({ x: exitX, y: dragOffset.y });
      
      // Set up next card to come from opposite side
      const nextCardStartX = direction === 'right' ? -window.innerWidth : window.innerWidth;
      setNextCardOffset({ x: nextCardStartX, y: 0 });
      
      // Trigger callback
      if (x > 0) {
        onSwipeRight(currentPost);
      } else {
        onSwipeLeft(currentPost);
      }
      
      // Start next card animation immediately
      setTimeout(() => {
        setNextCardOffset({ x: 0, y: 0 }); // Slide next card to center
      }, 50);
      
      // Complete transition after animation
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setDragOffset({ x: 0, y: 0 });
        setNextCardOffset({ x: 0, y: 0 });
        setSwipeDirection(null);
        setIsDragging(false);
        setIsAnimating(false);
      }, 300);
    } else {
      // Snap back to center
      setDragOffset({ x: 0, y: 0 });
      setIsDragging(false);
    }
  }, [isDragging, dragOffset, currentPost, onSwipeLeft, onSwipeRight, isAnimating]);

  // Touch events (primary for mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 1) return; // Ignore multi-touch
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY, e);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length > 1) return;
    e.preventDefault();
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    handleEnd();
  };

  // Programmatic swipe functions (for buttons)
  const handleSwipeLeft = useCallback(() => {
    if (isAnimating || !currentPost) return;
    
    setIsAnimating(true);
    setSwipeDirection('left');
    
    // Animate current card out to the left
    setDragOffset({ x: -window.innerWidth, y: 0 });
    
    // Set up next card to come from the right
    setNextCardOffset({ x: window.innerWidth, y: 0 });
    
    onSwipeLeft(currentPost);
    
    // Start next card animation
    setTimeout(() => {
      setNextCardOffset({ x: 0, y: 0 }); // Slide next card to center
    }, 50);
    
    // Complete transition
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setDragOffset({ x: 0, y: 0 });
      setNextCardOffset({ x: 0, y: 0 });
      setSwipeDirection(null);
      setIsAnimating(false);
    }, 300);
  }, [currentPost, onSwipeLeft, isAnimating]);

  const handleSwipeRight = useCallback(() => {
    if (isAnimating || !currentPost) return;
    
    setIsAnimating(true);
    setSwipeDirection('right');
    
    // Animate current card out to the right
    setDragOffset({ x: window.innerWidth, y: 0 });
    
    // Set up next card to come from the left
    setNextCardOffset({ x: -window.innerWidth, y: 0 });
    
    onSwipeRight(currentPost);
    
    // Start next card animation
    setTimeout(() => {
      setNextCardOffset({ x: 0, y: 0 }); // Slide next card to center
    }, 50);
    
    // Complete transition
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setDragOffset({ x: 0, y: 0 });
      setNextCardOffset({ x: 0, y: 0 });
      setSwipeDirection(null);
      setIsAnimating(false);
    }, 300);
  }, [currentPost, onSwipeRight, isAnimating]);

  if (currentIndex >= posts.length) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center py-8 max-w-sm mx-auto">
          <div className="text-5xl mb-4">🎉</div>
          <h3 className="text-xl font-bold text-foreground mb-2">You're all caught up!</h3>
          <p className="text-muted-foreground text-sm">Check back later for more posts</p>
        </div>
      </div>
    );
  }

  // Animation styles for smooth Tinder-like behavior
  const getCardStyle = (offset: { x: number, y: number }, isTop: boolean = true, isNext: boolean = false) => {
    if (isNext) {
      // Next card that slides in from opposite direction
      const rotation = offset.x * 0.1;
      const transition = isAnimating ? 'transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'transform 0.3s ease-out';
      
      return {
        transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg)`,
        transition,
        opacity: 1,
      };
    }
    
    if (!isTop) {
      // Cards behind the top card (static)
      const scale = 0.95;
      return {
        transform: `scale(${scale})`,
        transition: 'transform 0.3s ease-out',
        opacity: 0.8,
      };
    }
    
    // Top card with swipe animation
    const rotation = offset.x * 0.1; // More subtle rotation
    const transition = isDragging || isAnimating ? 
      (isAnimating ? 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none') :
      'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    
    return {
      transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg)`,
      transition,
      opacity: 1 - Math.abs(offset.x) / 400, // Fade out as card moves
    };
  };

  const currentCardStyle = getCardStyle(dragOffset, true, false);
  const nextCardStyle = getCardStyle(nextCardOffset, false, true);
  const thirdCardStyle = getCardStyle({ x: 0, y: 0 }, false, false);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Card Stack Container */}
      <div className="relative w-full h-full">
        {/* Third card (furthest back) */}
        {thirdPost && (
          <div 
            className="absolute inset-0" 
            style={{
              ...thirdCardStyle,
              transform: `scale(0.9)`,
              opacity: 0.6,
              zIndex: 1,
            }}
          >
            <SwipeCard
              post={thirdPost as any}
              onSwipeLeft={() => {}}
              onSwipeRight={() => {}}
              onTap={() => {}}
            />
          </div>
        )}

        {/* Next card (slides in from opposite direction) */}
        {nextPost && (
          <div 
            className="absolute inset-0" 
            style={{
              ...nextCardStyle,
              zIndex: isAnimating ? 15 : 2, // Higher z-index during animation
            }}
          >
            <SwipeCard
              post={nextPost as any}
              onSwipeLeft={() => {}}
              onSwipeRight={() => {}}
              onTap={() => {}}
            />
          </div>
        )}

        {/* Current card (top, being swiped) */}
        {currentPost && (
          <div
            ref={cardRef}
            className="absolute inset-0"
            style={{
              ...currentCardStyle,
              touchAction: 'pan-y pinch-zoom',
              zIndex: 20, // Always on top during swipe
            }}
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
    </div>
  );
};

export default SwipeContainer;
