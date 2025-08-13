
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
      <header className="bg-card px-4 py-3 border-b sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-muted-foreground" />
          <h1 className="font-semibold text-lg text-foreground">Communities</h1>
        </div>
        <Button
          variant="default"
          size="default"
          onClick={() => navigate("/communities/create")}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 animate-fade-in border-2 border-emerald-500 hover:border-emerald-600"
          aria-label="Create a new community"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create
        </Button>
      </header>
      <main className="flex-1 p-3 space-y-4 max-w-md w-full mx-auto">
        <CommunityList user={user} />
        <div className="h-px bg-border" />
        <CommunityDiscover />
      </main>
    </div>
  );
};

export default CommunitiesPage;
