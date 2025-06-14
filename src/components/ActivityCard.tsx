
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Database } from '@/integrations/supabase/types';
import { formatDistanceToNow } from 'date-fns';

type Activity = Database['public']['Tables']['activities']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface ActivityCardProps {
  activity: Activity;
  profile?: Profile | null;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, profile }) => {
  const getCarbonIndicatorColor = (carbonFootprint: number) => {
    if (carbonFootprint < 1) return 'bg-green-500'; // Low
    if (carbonFootprint < 5) return 'bg-yellow-500'; // Medium
    if (carbonFootprint < 10) return 'bg-orange-500'; // High
    return 'bg-red-500'; // Very High
  };

  const carbonFootprint = Number(activity.carbon_footprint_kg);

  return (
    <Card className="w-full max-w-lg mx-auto overflow-hidden shadow-md">
       <CardHeader>
        {profile && (
            <div className="flex items-center gap-3 mb-4">
              <Avatar>
                <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || 'user avatar'} />
                <AvatarFallback>{profile.full_name?.charAt(0) || profile.username?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-800">{profile.full_name || `@${profile.username}`}</p>
                <p className="text-xs text-gray-500">
                    Logged {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          )}
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <span className="text-2xl">{activity.emoji}</span>
              {activity.activity}
            </CardTitle>
            {!profile && <CardDescription className="text-xs text-gray-500 mt-1">
              Logged {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
            </CardDescription>}
          </div>
          <div className="flex items-center gap-2 text-right shrink-0">
            <div
              className={`w-4 h-4 rounded-full ${getCarbonIndicatorColor(carbonFootprint)}`}
              title={`Carbon Footprint: ${carbonFootprint} kg CO₂e`}
            />
            <span className="font-bold text-lg text-gray-800">
              {carbonFootprint.toFixed(2)}
            </span>
            <span className="text-xs text-gray-500 self-end">kg CO₂e</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {activity.caption && <p className="text-gray-700">{activity.caption}</p>}
        {activity.explanation && <p className="text-sm text-gray-500 italic mt-2">"{activity.explanation}"</p>}
      </CardContent>
    </Card>
  );
};

export default ActivityCard;
