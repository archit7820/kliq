
import React from "react";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import CommunityList from "@/components/CommunityList";
import CommunityDiscover from "@/components/CommunityDiscover";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CommunitiesPage = () => {
  const { user } = useAuthStatus();
  const navigate = useNavigate();
  
  React.useEffect(() => {
    document.title = 'Kelp • Communities';
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Mobile-optimized header */}
      <header className="bg-card px-3 py-2.5 border-b sticky top-0 z-10 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 bg-primary/10 rounded-md flex-shrink-0">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="font-semibold text-base text-foreground truncate">Communities</h1>
            <p className="text-xs text-muted-foreground truncate">Connect & make impact together</p>
          </div>
        </div>
        <Button
          variant="default"
          size="sm"
          onClick={() => navigate("/communities/create")}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-3 py-1.5 text-xs shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 animate-fade-in border border-primary/20 flex-shrink-0"
          aria-label="Create a new community"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          <span className="hidden xs:inline">Create</span>
          <span className="xs:hidden">New</span>
        </Button>
      </header>

      {/* Mobile-optimized main content */}
      <main className="flex-1 p-2 space-y-3 max-w-md w-full mx-auto pb-safe">
        <div className="space-y-3">
          <CommunityList user={user} />
          <div className="h-px bg-border/60 my-2" />
          <CommunityDiscover />
        </div>
      </main>
    </div>
  );
};

export default CommunitiesPage;
