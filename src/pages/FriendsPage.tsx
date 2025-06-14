
import React from "react";
import FriendSearch from "@/components/FriendSearch";
import FriendRequests from "@/components/FriendRequests";
import FriendsList from "@/components/FriendsList";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FriendsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
      <header className="bg-white shadow-sm p-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft />
        </Button>
        <h1 className="text-xl font-bold text-green-700 pl-1">Friends</h1>
      </header>
      <main className="flex-grow overflow-y-auto p-4 space-y-8 max-w-xl mx-auto w-full">
        <FriendsList />
        <FriendRequests />
        <FriendSearch />
      </main>
    </div>
  );
};

export default FriendsPage;
