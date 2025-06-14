
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, UserX, CircleCheckBig } from "lucide-react";
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
    <section>
      <h2 className="font-extrabold text-xl mb-4 flex gap-2 items-center text-green-700 tracking-tight">
        <Search className="w-5 h-5 text-green-400" /> 
        <span className="bg-gradient-to-r from-green-500 to-blue-400 bg-clip-text text-transparent">Add & Find Friends</span>
      </h2>
      <form className="flex gap-2 mb-6" onSubmit={handleSearch}>
        <Input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by username..."
          className="rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-blue-50 focus:ring-2 focus:ring-green-300 px-5 py-2 text-base placeholder:text-green-400"
        />
        <Button
          variant="outline"
          type="submit"
          disabled={searching}
          className="rounded-xl py-2 px-5 bg-gradient-to-r from-green-400 to-blue-300 text-white font-semibold shadow border-0 hover:scale-105 transition"
        >
          <Search className="w-5 h-5" />
          <span className="hidden sm:inline ml-1">Search</span>
        </Button>
      </form>
      <div className="space-y-4 min-h-[48px]">
        {searching && (
          <div className="flex items-center justify-center text-green-400 gap-2 animate-pulse">
            <Search className="w-6 h-6 animate-spin" />
            Searching...
          </div>
        )}
        {!searching && results.length === 0 && query && (
          <div className="flex flex-col items-center text-sm text-green-300 p-6">
            <UserX className="w-7 h-7 mb-1" />
            <span>No users found for <span className="font-mono text-green-500">{query}</span></span>
          </div>
        )}
        {!searching && results.length === 0 && !query && (
          <div className="flex flex-col items-center text-gray-300 p-6">
            <Search className="w-8 h-8" />
            <span>Type a username to start searching.</span>
          </div>
        )}
        <div className="flex flex-col gap-3">
          {results.map(profile => (
            <div
              key={profile.id}
              className="bg-white border-green-100 border rounded-2xl py-4 px-5 flex items-center gap-4 shadow hover:shadow-lg transition group"
            >
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="avatar"
                  className="w-11 h-11 rounded-full border-2 border-green-300 object-cover"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-green-200 to-blue-100 flex items-center justify-center text-green-600 border-2 border-green-100">
                  <UserPlus className="w-6 h-6" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span className="block font-bold text-green-700 truncate">{profile.full_name || profile.username || "User"}</span>
                <span className="block text-xs text-green-400 truncate font-mono">@{profile.username}</span>
              </div>
              <Button
                variant="outline"
                className="rounded-full px-3 bg-gradient-to-r from-green-400 via-blue-300 to-blue-400 text-white border-0 shadow hover:scale-105 font-semibold"
                onClick={() => handleInvite(profile)}
                disabled={inviting === profile.id}
              >
                {inviting === profile.id ? (
                  <CircleCheckBig className="animate-spin w-5 h-5" />
                ) : (
                  <UserPlus className="w-5 h-5" />
                )}
                <span className="hidden sm:inline ml-1">Invite</span>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FriendSearch;
