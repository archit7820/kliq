
import React from "react";
import FriendRequests from "@/components/FriendRequests";
import FriendsList from "@/components/FriendsList";
import EnhancedFriendSearch from "@/components/EnhancedFriendSearch";
import EmailInviteDialog from "@/components/EmailInviteDialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
        <div className="ml-auto">
          <EmailInviteDialog />
        </div>
      </header>

      <main className="flex-grow overflow-y-auto p-4 max-w-2xl mx-auto w-full">
        <Tabs defaultValue="friends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="friends" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">My Friends</span>
              <span className="sm:hidden">Friends</span>
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Requests</span>
              <span className="sm:hidden">Requests</span>
            </TabsTrigger>
            <TabsTrigger value="discover" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Discover</span>
              <span className="sm:hidden">Find</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="space-y-6">
            <FriendsList />
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <FriendRequests />
          </TabsContent>

          <TabsContent value="discover" className="space-y-6">
            <EnhancedFriendSearch />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default FriendsPage;
