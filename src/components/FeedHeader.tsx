
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
    <header className="bg-card/80 backdrop-blur-sm p-4 sticky top-0 z-40 flex justify-between items-center border-b">
      <Link to="/home">
        <h1 className="text-2xl font-bold text-primary">kelp</h1>
      </Link>
      <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onRefresh} disabled={isRefetching}>
              <RefreshCw className={`w-5 h-5 text-muted-foreground ${isRefetching ? 'animate-spin' : ''}`} />
              <span className="sr-only">Refresh feed</span>
          </Button>
          <Link to="/messages">
            <Button variant="ghost" size="icon">
                <MessageSquare className="w-5 h-5 text-muted-foreground" />
                <span className="sr-only">Messages</span>
            </Button>
          </Link>
          <Link to="/profile">
            <Avatar className="w-9 h-9">
                <AvatarImage src={userProfile?.avatar_url || undefined} />
                <AvatarFallback>{userProfile?.full_name?.charAt(0).toUpperCase() || userProfile?.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
          </Link>
      </div>
    </header>
  );
};

export default FeedHeader;
