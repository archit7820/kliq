
import React from "react";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import CommunityList from "@/components/CommunityList";
import { Button } from "@/components/ui/button";
import { Plus, Users, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CommunitiesPage = () => {
  const { user } = useAuthStatus();
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <header className="bg-white px-4 py-4 border-b sticky top-0 z-10 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-7 h-7 text-green-600" />
          <h1 className="font-bold text-2xl text-gray-800">Communities</h1>
        </div>
        <Button
          className="mt-2 sm:mt-0 text-xs px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md"
          onClick={() => navigate("/communities/create")}
        >
          <Plus className="inline-block w-4 h-4 mr-1" />
          Create Community
        </Button>
      </header>
      <main className="flex-1 p-4 space-y-8">
        <CommunityList user={user} />
      </main>
    </div>
  );
};

export default CommunitiesPage;
