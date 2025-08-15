
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile-optimized header */}
      <header className="bg-card shadow-sm border-b sticky top-0 z-20">
        <div className="flex items-center justify-between p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)} 
              className="hover:bg-accent h-8 w-8 sm:h-10 sm:w-10"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h1 className="text-lg sm:text-2xl font-bold text-foreground">Friends</h1>
            </div>
          </div>
          <div className="hidden sm:block">
            <EmailInviteDialog />
          </div>
        </div>
      </header>

      {/* Mobile-first main content */}
      <main className="flex-1 p-3 sm:p-4 pb-20 sm:pb-6">
        <div className="max-w-2xl mx-auto w-full">
          <Tabs defaultValue="friends" className="space-y-4 sm:space-y-6">
            {/* Mobile-optimized tabs */}
            <TabsList className="grid w-full grid-cols-3 h-10 sm:h-11 bg-muted p-1">
              <TabsTrigger 
                value="friends" 
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium"
              >
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline sm:inline">Friends</span>
                <span className="xs:hidden sm:hidden">All</span>
              </TabsTrigger>
              <TabsTrigger 
                value="requests" 
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium"
              >
                <UserPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline sm:inline">Requests</span>
                <span className="xs:hidden sm:hidden">Req</span>
              </TabsTrigger>
              <TabsTrigger 
                value="discover" 
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium"
              >
                <UserPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline sm:inline">Discover</span>
                <span className="xs:hidden sm:hidden">Find</span>
              </TabsTrigger>
            </TabsList>

            {/* Mobile invite button */}
            <div className="sm:hidden">
              <EmailInviteDialog />
            </div>

            <TabsContent value="friends" className="mt-4 sm:mt-6">
              <FriendsList />
            </TabsContent>

            <TabsContent value="requests" className="mt-4 sm:mt-6">
              <FriendRequests />
            </TabsContent>

            <TabsContent value="discover" className="mt-4 sm:mt-6">
              <EnhancedFriendSearch />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default FriendsPage;
