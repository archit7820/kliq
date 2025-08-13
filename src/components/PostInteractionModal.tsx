import React, { useState } from "react";
import { Heart, MessageCircle, Share, TrendingUp, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface PostInteractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: string;
    activity: string;
    caption: string;
    profiles?: {
      display_name?: string;
      avatar_url?: string;
    } | null;
  };
}

const mockComments = [
  {
    id: 1,
    user: "EcoWarrior",
    avatar: "/placeholder.svg",
    content: "This is so inspiring! Love seeing real impact 🌱",
    time: "2h ago",
    likes: 12
  },
  {
    id: 2,
    user: "GreenMachine",
    avatar: "/placeholder.svg", 
    content: "Amazing work! What was the most challenging part?",
    time: "4h ago",
    likes: 8
  },
  {
    id: 3,
    user: "ImpactMaker",
    avatar: "/placeholder.svg",
    content: "Keep making change happen 💚 This motivated me to do more!",
    time: "6h ago",
    likes: 15
  }
];

const PostInteractionModal = ({ isOpen, onClose, post }: PostInteractionModalProps) => {
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(mockComments);
  const [commentLikes, setCommentLikes] = useState<Record<number, { isLiked: boolean; count: number }>>({});
  const { toast } = useToast();

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const comment = {
      id: comments.length + 1,
      user: "You",
      avatar: "/placeholder.svg",
      content: newComment,
      time: "now",
      likes: 0
    };
    
    setComments(prev => [comment, ...prev]);
    setNewComment("");
    
    toast({
      title: "Comment added!",
      description: "Your comment has been posted successfully.",
    });
  };

  const handleCommentLike = (commentId: number, initialLikes: number) => {
    setCommentLikes(prev => {
      const current = prev[commentId] || { isLiked: false, count: initialLikes };
      return {
        ...prev,
        [commentId]: {
          isLiked: !current.isLiked,
          count: current.isLiked ? current.count - 1 : current.count + 1
        }
      };
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] p-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="text-left">Comments</DialogTitle>
        </DialogHeader>

        {/* Post Summary */}
        <div className="px-4 pb-3 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={post.profiles?.avatar_url} />
              <AvatarFallback>{post.profiles?.display_name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{post.profiles?.display_name || "Anonymous"}</p>
              <p className="text-xs text-muted-foreground line-clamp-1">{post.activity}</p>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto max-h-96 px-4">
          <div className="space-y-4">
            {comments.map((comment) => {
              const likeState = commentLikes[comment.id] || { isLiked: false, count: comment.likes };
              
              return (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={comment.avatar} />
                    <AvatarFallback className="text-xs">{comment.user.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-muted/50 rounded-2xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm">{comment.user}</p>
                        <p className="text-xs text-muted-foreground">{comment.time}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{comment.content}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-2 pl-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "text-xs h-auto p-1 rounded-full",
                          likeState.isLiked && "text-red-500"
                        )}
                        onClick={() => handleCommentLike(comment.id, comment.likes)}
                      >
                        <Heart className={cn("w-3 h-3 mr-1", likeState.isLiked && "fill-current")} />
                        {likeState.count}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-auto p-1"
                      >
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add Comment */}
        <div className="p-4 border-t bg-background">
          <div className="flex gap-3">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="text-xs">Y</AvatarFallback>
            </Avatar>
            <div className="flex-1 flex gap-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[36px] max-h-24 resize-none text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
              />
              <Button 
                size="sm" 
                className="flex-shrink-0 h-9 w-9 p-0"
                onClick={handleAddComment}
                disabled={!newComment.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostInteractionModal;