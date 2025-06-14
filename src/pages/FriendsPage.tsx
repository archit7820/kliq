import React, { useState } from "react";
import FriendSearch from "@/components/FriendSearch";
import FriendRequests from "@/components/FriendRequests";
import FriendsList from "@/components/FriendsList";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import FriendInviteModal from "@/components/FriendInviteModal";

const FriendsPage = () => {
  const navigate = useNavigate();
  const [openInvite, setOpenInvite] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col pb-24">
      <header className="bg-white/80 shadow-md p-4 flex items-center gap-2 sticky top-0 z-20">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft />
        </Button>
        <h1 className="text-2xl font-black text-green-700 pl-1 tracking-tight select-none">Friends</h1>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto flex gap-1 items-center px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 border-green-200 rounded-xl font-semibold shadow hover:scale-105 transition"
          onClick={() => setOpenInvite(true)}
          title="Invite friend"
        >
          <UserPlus className="w-5 h-5" />
          <span className="hidden sm:inline">Invite</span>
        </Button>
      </header>
      <main className="flex-grow overflow-y-auto p-4 space-y-7 max-w-xl mx-auto w-full">
        <FriendsList />
        <FriendRequests />
        <FriendSearch />
      </main>
      {openInvite && (
        <FriendInviteModal open={openInvite} onOpenChange={setOpenInvite} />
      )}
    </div>
  );
};

export default FriendsPage;
