
import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Database } from '@/integrations/supabase/types';
import { MoreHorizontal, Leaf, MapPin, Clock } from 'lucide-react';
import CommentSheet from './CommentSheet';
import PostInteractions from './PostInteractions';
import { Button } from './ui/button';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Activity = Database['public']['Tables']['activities']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface EnhancedActivityCardProps {
  activity: Activity;
  profile?: Profile | null;
  currentUserId?: string | null;
  showLocation?: boolean;
}

const colors = [
  "from-green-200 to-green-100",
  "from-blue-200 to-green-100",
  "from-yellow-200 to-pink-100",
  "from-fuchsia-200 to-indigo-100",
  "from-indigo-100 to-teal-100",
];

const EnhancedActivityCard: React.FC<EnhancedActivityCardProps> = ({ 
  activity, 
  profile, 
  currentUserId,
  showLocation = true 
}) => {
  const [isCommentSheetOpen, setIsCommentSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const carbonFootprint = Number(activity.carbon_footprint_kg);
  const isOffset = carbonFootprint < 0;
  const displayValue = isOffset ? Math.abs(carbonFootprint) : carbonFootprint;

  const imageUrl = activity.image_url || `https://picsum.photos/seed/${activity.id}/800/1000`;
  const timeAgo = activity.created_at ? formatDistanceToNow(new Date(activity.created_at), { addSuffix: true }) : '';
  const gradient = colors[(activity.id.charCodeAt(0) + activity.id.charCodeAt(activity.id.length - 1)) % colors.length];
  const isOwner = currentUserId === activity.user_id;

  const handleComment = () => {
    setIsCommentSheetOpen(true);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this activity? This cannot be undone.")) return;
    setLoading(true);
    const { error } = await supabase
      .from("activities")
      .delete()
      .eq("id", activity.id);
    setLoading(false);
    if (error) {
      toast.error("Failed to delete activity", { description: error.message });
    } else {
      toast.success("Activity deleted!");
    }
  };

  return (
    <>
      <Card className={`w-full mx-auto overflow-hidden rounded-2xl shadow-lg border-0 bg-gradient-to-br ${gradient} backdrop-blur-md`}>
        <CardHeader className="flex flex-row items-center justify-between p-4 bg-white/70 backdrop-blur-sm rounded-t-2xl">
          <div className="flex items-center gap-3">
            {profile && (
              <Avatar className="w-11 h-11 border-2 border-primary/20 bg-green-50">
                <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || 'user avatar'} />
                <AvatarFallback className="bg-gradient-to-br from-green-100 to-blue-100 text-green-700 font-semibold">
                  {profile.full_name?.charAt(0) || profile.username?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-sm text-primary">
                  {profile?.full_name || `@${profile?.username}` || 'User'}
                </p>
                {activity.category && (
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    {activity.category}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {timeAgo}
                </div>
                {showLocation && profile?.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {profile.location}
                  </div>
                )}
              </div>
            </div>
          </div>
          {isOwner ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-8 h-8" disabled={loading}>
                  <MoreHorizontal className="w-4 h-4 text-primary" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white shadow rounded-xl py-1 w-48">
                <DropdownMenuItem
                  className="px-4 py-2 hover:bg-red-100 text-red-700 cursor-pointer"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <MoreHorizontal className="w-4 h-4 text-primary" />
            </Button>
          )}
        </CardHeader>

        {activity.image_url && (
          <div className="bg-gray-100">
            <img 
              src={imageUrl} 
              alt={activity.activity} 
              className="w-full h-auto object-cover aspect-[4/5] rounded-none" 
            />
          </div>
        )}

        <CardContent className="p-4 bg-white/70 backdrop-blur-xl rounded-b-2xl">
          <div className="flex items-center justify-between mb-3">
            <PostInteractions
              activityId={activity.id}
              onComment={handleComment}
              initialLikes={Math.floor(Math.random() * 20)} // TODO: Get real like count
            />
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold ${
                isOffset
                  ? 'bg-gradient-to-r from-green-300 via-green-200 to-lime-200 text-green-900'
                  : 'bg-gradient-to-r from-pink-200 via-red-200 to-orange-100 text-red-900'
              } drop-shadow`}
              title={`Carbon Footprint: ${carbonFootprint.toFixed(1)} kg CO₂e${isOffset ? ' offset' : ''}`}
            >
              <Leaf size={16} />
              <span>
                {displayValue.toFixed(1)} {isOffset ? 'kg offset' : 'kg CO₂e'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-base text-gray-800">
              {activity.emoji} {activity.activity}
            </h3>
            {activity.caption && (
              <p className="text-sm text-gray-700 leading-relaxed">
                {activity.caption}
              </p>
            )}
            {activity.explanation && (
              <p className="text-xs text-muted-foreground italic">
                {activity.explanation}
              </p>
            )}
          </div>

          <button 
            onClick={handleComment} 
            className="text-xs text-muted-foreground mt-3 underline hover:text-primary transition-colors"
          >
            View comments
          </button>
        </CardContent>
      </Card>
      
      <CommentSheet
        activityId={activity.id}
        isOpen={isCommentSheetOpen}
        onOpenChange={setIsCommentSheetOpen}
      />
    </>
  );
};

export default EnhancedActivityCard;
