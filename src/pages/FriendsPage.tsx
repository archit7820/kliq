
import React from "react";
import FriendSearch from "@/components/FriendSearch";
import FriendRequests from "@/components/FriendRequests";
import FriendsList from "@/components/FriendsList";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FriendsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
      <header className="bg-white shadow-sm border-b p-4 flex items-center gap-3 sticky top-0 z-20">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Friends</h1>
        </div>
      </header>
      <main className="flex-grow overflow-y-auto p-6 space-y-8 max-w-2xl mx-auto w-full">
        <FriendsList />
        <FriendRequests />
        <FriendSearch />
      </main>
    </div>
  );
};

export default FriendsPage;
