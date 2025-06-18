
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, UserPlus, User, Sparkles, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Profile = {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
};

const FriendSearch = () => {
  const { user } = useAuthStatus();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const [inviting, setInviting] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, username, avatar_url")
      .ilike("username", `%${query.trim()}%`);

    if (error) {
      toast({ title: "Error searching", description: error.message, variant: "destructive" });
    }
    setResults(data || []);
    setSearching(false);
  };

  const handleInvite = async (profile: Profile) => {
    if (!user) return;
    setInviting(profile.id);
    // Here you'd usually call an API to send a request
    const { data, error } = await supabase.from("friend_requests").insert([
      { sender_id: user.id, receiver_id: profile.id, status: "pending" }
    ]);
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Request Sent!",
        description: `Sent friend invite to @${profile.username}.`,
        variant: "default"
      });
      setResults(res => res.filter(p => p.id !== profile.id));
    }
    setInviting(null);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Search className="w-5 h-5 text-purple-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Find Friends</h2>
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Zap className="w-4 h-4" />
          <span>AI-powered discovery</span>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <form className="flex gap-3" onSubmit={handleSearch}>
            <Input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by username..."
              className="flex-1 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
            />
            <Button
              type="submit"
              disabled={searching}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6"
            >
              {searching ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {searching && (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-2 text-purple-600">
                <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                <span>Searching for users...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {!searching && results.length === 0 && query && (
          <Card className="border-dashed border-2 border-gray-200">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-sm text-gray-500">Try searching with a different username</p>
            </CardContent>
          </Card>
        )}

        {!searching && results.length === 0 && !query && (
          <Card className="border-dashed border-2 border-gray-200">
            <CardContent className="p-8 text-center">
              <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">AI-Powered Friend Discovery</h3>
              <p className="text-sm text-gray-500 mb-4">Search for friends by username to get started</p>
              <div className="text-xs text-gray-400">Smart suggestions coming soon!</div>
            </CardContent>
          </Card>
        )}

        {results.map(profile => (
          <Card key={profile.id} className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="avatar"
                    className="w-12 h-12 rounded-full border-2 border-gray-100 object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {profile.full_name || profile.username || "User"}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">@{profile.username}</p>
                </div>
                <Button
                  onClick={() => handleInvite(profile)}
                  disabled={inviting === profile.id}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {inviting === profile.id ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-1" />
                      Invite
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default FriendSearch;
