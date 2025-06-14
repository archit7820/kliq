
import React from 'react';
import { Database } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RefreshCw, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface FeedHeaderProps {
  userProfile: Profile | null | undefined;
  onRefresh: () => void;
  isRefetching: boolean;
}

const FeedHeader: React.FC<FeedHeaderProps> = ({ userProfile, onRefresh, isRefetching }) => {
  return (
    <header className="bg-white p-4 sticky top-0 z-10 flex justify-between items-center border-b">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Welcome to kelp!</h1>
        {userProfile && <p className="text-xl text-gray-500">{userProfile.full_name || userProfile.username}</p>}
      </div>
      <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onRefresh} disabled={isRefetching}>
              <RefreshCw className={`w-5 h-5 text-gray-600 ${isRefetching ? 'animate-spin' : ''}`} />
          </Button>
          <Link to="/messages">
            <Button variant="ghost" size="icon">
                <MessageSquare className="w-5 h-5 text-gray-600" />
            </Button>
          </Link>
          <Avatar>
              <AvatarImage src={userProfile?.avatar_url || undefined} />
              <AvatarFallback>{userProfile?.full_name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
      </div>
    </header>
  );
};

export default FeedHeader;
