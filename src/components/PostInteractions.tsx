
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface PostInteractionsProps {
  activityId: string;
  onComment: () => void;
  initialLikes?: number;
  isLiked?: boolean;
}

const PostInteractions: React.FC<PostInteractionsProps> = ({
  activityId,
  onComment,
  initialLikes = 0,
  isLiked = false,
}) => {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(isLiked);

  const handleLike = () => {
    if (liked) {
      setLikes(prev => prev - 1);
    } else {
      setLikes(prev => prev + 1);
    }
    setLiked(!liked);
    // TODO: Implement actual like functionality with Supabase
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check out this eco-activity!',
          text: 'Found this interesting activity on our carbon tracking app',
          url: window.location.href,
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      toast.error('Failed to share');
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1">
        <Button
          onClick={handleLike}
          variant="ghost"
          size="sm"
          className={`text-foreground hover:scale-105 transition-transform ${
            liked ? 'text-red-500 hover:text-red-600' : 'hover:text-red-500'
          }`}
        >
          <Heart size={20} className={liked ? 'fill-current' : ''} />
          {likes > 0 && <span className="ml-1 text-sm">{likes}</span>}
        </Button>
        
        <Button
          onClick={onComment}
          variant="ghost"
          size="sm"
          className="text-foreground hover:text-primary transition-colors hover:scale-105"
        >
          <MessageCircle size={20} />
        </Button>
        
        <Button
          onClick={handleShare}
          variant="ghost"
          size="sm"
          className="text-foreground hover:text-blue-500 transition-colors hover:scale-105"
        >
          <Share2 size={20} />
        </Button>
      </div>
    </div>
  );
};

export default PostInteractions;
