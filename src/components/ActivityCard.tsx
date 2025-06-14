import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Database } from '@/integrations/supabase/types';
import { Heart, MessageCircle, MoreHorizontal, Leaf } from 'lucide-react';
import CommentSheet from './CommentSheet';
import { Button } from './ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Menu, MenuButton, MenuItem, MenuList } from "@radix-ui/react-dropdown-menu";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Activity = Database['public']['Tables']['activities']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface ActivityCardProps {
  activity: Activity;
  profile?: Profile | null;
}

const colors = [
  "from-green-200 to-green-100",
  "from-blue-200 to-green-100",
  "from-yellow-200 to-pink-100",
  "from-fuchsia-200 to-indigo-100",
  "from-indigo-100 to-teal-100",
];

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, profile }) => {
  const [isCommentSheetOpen, setIsCommentSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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

  // Pick a color gradient based on activity id for variety
  const gradient = colors[(activity.id.charCodeAt(0) + activity.id.charCodeAt(activity.id.length - 1)) % colors.length];

  // If current user is owner of this activity
  const userId = supabase.auth.getUserSync()?.id;
  const isOwner = userId === activity.user_id;

  const handleArchive = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("activities")
      .update({ archived: true })
      .eq("id", activity.id);
    setLoading(false);
    if (error) {
      toast.error("Failed to archive activity", { description: error.message });
    } else {
      toast.success("Activity archived!");
      // Optionally refetch feed or trigger data refresh here.
    }
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
      // Optionally refetch feed or trigger data refresh here.
    }
  };

  return (
    <>
      <Card className={`w-full mx-auto overflow-hidden rounded-2xl shadow-lg border-0 bg-gradient-to-br ${gradient} backdrop-blur-md`}>
        <CardHeader className="flex flex-row items-center justify-between p-4 bg-white/60 backdrop-blur-sm rounded-t-2xl">
          <div className="flex items-center gap-3">
            {profile && (
              <Avatar className="w-10 h-10 border border-primary bg-green-50">
                <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || 'user avatar'} />
                <AvatarFallback>{profile.full_name?.charAt(0) || profile.username?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
            )}
            <div>
              <p className="font-semibold text-sm text-primary">
                {profile?.full_name || `@${profile?.username}` || 'User'}
              </p>
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
            </div>
          </div>
          {/* Use More options menu if owner, basic More if not */}
          {isOwner ? (
            <Menu>
              <MenuButton asChild>
                <Button variant="ghost" size="icon" className="w-8 h-8" disabled={loading}>
                  <MoreHorizontal className="w-4 h-4 text-primary" />
                </Button>
              </MenuButton>
              <MenuList className="bg-white shadow rounded-xl py-1 w-48">
                <MenuItem
                  className="px-4 py-2 hover:bg-gray-100 text-gray-800 cursor-pointer"
                  onClick={handleArchive}
                  disabled={activity.archived || loading}
                >
                  {activity.archived ? "Archived" : "Archive"}
                </MenuItem>
                <MenuItem
                  className="px-4 py-2 hover:bg-red-100 text-red-700 cursor-pointer"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  Delete
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <MoreHorizontal className="w-4 h-4 text-primary" />
            </Button>
          )}
        </CardHeader>
        
        {activity.image_url && (
          <div className="bg-gray-100">
            <img src={imageUrl} alt={activity.activity} className="w-full h-auto object-cover aspect-[4/5] rounded-none" />
          </div>
        )}

        <CardContent className="p-4 bg-white/60 backdrop-blur-xl rounded-b-2xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Button onClick={handleLike} variant="ghost" size="icon" className="text-foreground hover:text-red-500 transition hover:scale-105">
                <Heart size={22} />
              </Button>
              <Button onClick={handleComment} variant="ghost" size="icon" className="text-foreground hover:text-primary transition hover:scale-105">
                <MessageCircle size={22} />
              </Button>
            </div>
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
          {activity.caption && <p className="text-sm mt-3"><span className="font-semibold text-primary">{profile?.username ? `@${profile?.username}` : profile?.full_name}</span> {activity.caption}</p>}
          <button onClick={handleComment} className="text-xs text-muted-foreground mt-2 underline hover:text-primary">View all comments</button>
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
