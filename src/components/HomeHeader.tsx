
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { LogOut, Users, UserPlus, ChevronDown } from 'lucide-react';
import { useProfileWithStats } from '@/hooks/useProfileWithStats';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const HomeHeader = () => {
  const navigate = useNavigate();
  const { profile, isProfileLoading } = useProfileWithStats();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: "Logout Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      navigate('/auth');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-lg border-b">
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-foreground">Kelp</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 rounded-full px-2.5 py-1 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
            <span className="text-xs font-medium text-primary">
              {isProfileLoading ? "..." : (profile?.kelp_points ?? 0)} Kelp Points
            </span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground p-1">
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => navigate('/friends')} className="text-sm">
                <Users className="w-4 h-4 mr-2" />
                Friends
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/invite')} className="text-sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;
