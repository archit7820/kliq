
import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { Database } from '@/integrations/supabase/types';
import { LoaderCircle, Send, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Comment = Database['public']['Tables']['comments']['Row'];
type CommentWithProfile = Comment & {
  profiles: Profile | null;
};

interface CommentSheetProps {
  activityId: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const CommentSheet: React.FC<CommentSheetProps> = ({ activityId, isOpen, onOpenChange }) => {
  const { user } = useAuthStatus();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');

  const handleClose = () => {
    console.log('Closing comment sheet');
    onOpenChange(false);
  };

  const { data: comments, isLoading, isError } = useQuery<CommentWithProfile[]>({
    queryKey: ['comments', activityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles(*)')
        .eq('activity_id', activityId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as CommentWithProfile[];
    },
    enabled: isOpen,
  });

  const { mutate: addComment, isPending: isAddingComment } = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('You must be logged in to comment.');
      const { data, error } = await supabase
        .from('comments')
        .insert({ activity_id: activityId, user_id: user.id, content })
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', activityId] });
      setNewComment('');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to post comment.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() && !isAddingComment) {
      addComment(newComment.trim());
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>Comments</SheetTitle>
              <SheetDescription>Join the conversation.</SheetDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 rounded-full hover:bg-muted/30 touch-manipulation active:scale-95"
              onClick={handleClose}
              type="button"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </SheetHeader>
        <div className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-4">
          {isLoading && <div className="flex justify-center items-center h-full"><LoaderCircle className="w-6 h-6 animate-spin" /></div>}
          {isError && <div className="text-red-500 text-center">Could not load comments.</div>}
          {comments && comments.length === 0 && <div className="text-gray-500 text-center pt-8">No comments yet.</div>}
          {comments && comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar>
                <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                <AvatarFallback>{comment.profiles?.full_name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">{comment.profiles?.full_name || `@${comment.profiles?.username}`}</p>
                  <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</p>
                </div>
                <p className="text-sm text-gray-800">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
        <SheetFooter>
          <form onSubmit={handleSubmit} className="w-full flex items-start gap-2 pt-4">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-grow"
              rows={2}
              disabled={!user || isAddingComment}
            />
            <Button type="submit" size="icon" disabled={!user || !newComment.trim() || isAddingComment}>
              {isAddingComment ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CommentSheet;
