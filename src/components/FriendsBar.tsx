
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@supabase/supabase-js';

interface FriendsBarProps {
  user: User | null;
}

const FriendsBar: React.FC<FriendsBarProps> = ({ user }) => {
  const { data: friends } = useQuery({
    queryKey: ['friendsProfiles', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: friendsData, error: friendsError } = await supabase
        .from('friends')
        .select('user1_id, user2_id')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
      
      if (friendsError) throw friendsError;
      
      const friendIds = friendsData.map(f => (f.user1_id === user.id ? f.user2_id : f.user1_id));
      if (friendIds.length === 0) return [];
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', friendIds);
        
      if (profilesError) throw profilesError;
      
      return profilesData;
    },
    enabled: !!user,
  });

  if (!friends || friends.length === 0) {
    return null;
  }

  return (
    <div>
        <h2 className="font-semibold text-gray-800 mb-3">Friends' Activity</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
            {friends.map(friend => (
                <div key={friend.id} className="flex flex-col items-center shrink-0 w-20">
                    <Avatar className="w-16 h-16 border-2 border-white shadow">
                        <AvatarImage src={friend.avatar_url || undefined} />
                        <AvatarFallback>{friend.full_name?.charAt(0) || 'F'}</AvatarFallback>
                    </Avatar>
                    <p className="text-xs mt-2 text-gray-600 w-full truncate text-center">{friend.full_name || friend.username}</p>
                </div>
            ))}
        </div>
    </div>
  );
};

export default FriendsBar;
