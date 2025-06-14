
import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Database } from '@/integrations/supabase/types';
import { Heart, MessageCircle, MoreHorizontal, Leaf } from 'lucide-react';
import CommentSheet from './CommentSheet';
import { Button } from './ui/button';
import { formatDistanceToNow } from 'date-fns';

type Activity = Database['public']['Tables']['activities']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface ActivityCardProps {
  activity: Activity;
  profile?: Profile | null;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, profile }) => {
  const [isCommentSheetOpen, setIsCommentSheetOpen] = useState(false);
  const carbonFootprint = Number(activity.carbon_footprint_kg);
  const isOffset = carbonFootprint < 0;
  const displayValue = isOffset ? Math.abs(carbonFootprint) : carbonFootprint;

  const imageUrl = activity.image_url || `https://picsum.photos/seed/${activity.id}/800/1000`;

  const handleLike = () => {
    console.log(`Liking activity ${activity.id}`);
    // Future: Implement database update and state change for likes
  };

  const handleComment = () => {
    setIsCommentSheetOpen(true);
  };

  const timeAgo = activity.created_at ? formatDistanceToNow(new Date(activity.created_at), { addSuffix: true }) : '';

  return (
    <>
      <Card className="w-full mx-auto overflow-hidden rounded-xl shadow-sm border">
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {profile && (
              <Avatar className="w-10 h-10 border">
                <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || 'user avatar'} />
                <AvatarFallback>{profile.full_name?.charAt(0) || profile.username?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
            )}
            <div>
              <p className="font-semibold text-sm">{profile?.full_name || `@${profile?.username}`}</p>
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        {activity.image_url && (
            <div className="bg-gray-100">
                <img src={imageUrl} alt={activity.activity} className="w-full h-auto object-cover aspect-[4/5]" />
            </div>
        )}

        <CardContent className="p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button onClick={handleLike} variant="ghost" size="icon" className="text-foreground hover:text-red-500">
                        <Heart size={22} />
                    </Button>
                    <Button onClick={handleComment} variant="ghost" size="icon" className="text-foreground hover:text-primary">
                        <MessageCircle size={22} />
                    </Button>
                </div>
                <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${isOffset ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    title={`Carbon Footprint: ${carbonFootprint.toFixed(1)} kg CO₂e${isOffset ? ' offset' : ''}`}
                >
                    <Leaf size={16} />
                    <span>
                    {displayValue.toFixed(1)} {isOffset ? 'kg offset' : 'kg CO₂e'}
                    </span>
                </div>
            </div>
            
            {activity.caption && <p className="text-sm mt-3"><span className="font-semibold">{profile?.username}</span> {activity.caption}</p>}
            <button onClick={handleComment} className="text-sm text-muted-foreground mt-2">View all comments</button>
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

export default ActivityCard;
