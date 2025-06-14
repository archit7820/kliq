
import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Database } from '@/integrations/supabase/types';
import { Heart, MessageCircle, X } from 'lucide-react';

type Activity = Database['public']['Tables']['activities']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface ActivityCardProps {
  activity: Activity;
  profile?: Profile | null;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, profile }) => {
  const carbonFootprint = Number(activity.carbon_footprint_kg);

  const getCarbonIndicatorColor = (carbonFootprint: number) => {
    if (carbonFootprint < 0) return 'bg-green-500'; // Offset/saved
    return 'bg-red-500'; // Emission
  };

  const isOffset = carbonFootprint < 0;
  const displayValue = isOffset ? Math.abs(carbonFootprint) : carbonFootprint;

  const imageUrl = activity.image_url || `https://picsum.photos/seed/${activity.id}/800/1000`;

  const handleLike = () => {
    console.log(`Liking activity ${activity.id}`);
    // Future: Implement database update and state change for likes
  };

  const handleComment = () => {
    console.log(`Commenting on activity ${activity.id}`);
    // Future: Open a comment modal or section
  };

  const handleDismiss = () => {
    console.log(`Dismissing activity ${activity.id}`);
    // Future: Hide activity from the user's feed
  };

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden rounded-2xl shadow-lg border-0 relative">
      <img src={imageUrl} alt={activity.activity} className="w-full h-auto object-cover aspect-[4/5]" />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-3">
            {profile && (
              <Avatar className="w-12 h-12 border-2 border-white">
                <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || 'user avatar'} />
                <AvatarFallback>{profile.full_name?.charAt(0) || profile.username?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
            )}
            <div>
              <p className="font-bold text-lg">{profile?.full_name || `@${profile?.username}`}</p>
              <p className="text-sm">{activity.activity}</p>
              {activity.caption && <p className="text-xs italic mt-1">"{activity.caption}"</p>}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-right shrink-0">
             <div
              className={`w-3 h-3 rounded-full ${getCarbonIndicatorColor(carbonFootprint)}`}
              title={`Carbon Footprint: ${carbonFootprint.toFixed(1)} kg CO₂e${isOffset ? ' offset' : ''}`}
            />
            <span className="font-bold text-lg">
              {displayValue.toFixed(1)}
            </span>
            <span className="text-xs self-end">{isOffset ? 'kg offset' : 'kg'}</span>
          </div>
        </div>
      </div>
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-6 bg-black/10 backdrop-blur-sm p-2 rounded-full">
        <button onClick={handleDismiss} className="text-white/80 hover:text-white transition-colors">
          <X size={28} />
        </button>
        <button onClick={handleLike} className="text-white hover:text-red-400 transition-colors scale-125">
          <Heart size={36} fill="currentColor" />
        </button>
        <button onClick={handleComment} className="text-white/80 hover:text-white transition-colors">
          <MessageCircle size={28} />
        </button>
      </div>
    </Card>
  );
};

export default ActivityCard;
