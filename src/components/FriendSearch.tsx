
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { toast } from "@/components/ui/use-toast";
import { Search } from "lucide-react";

const FriendSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { user } = useAuthStatus();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setResults([]);
    if (!query.trim()) {
      setIsSearching(false);
      return;
    }
    // Search by username or email. Exclude self.
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, username, avatar_url, email:username")
      .or(`username.ilike.%${query}%,email.ilike.%${query}%,full_name.ilike.%${query}%`)
      .neq("id", user?.id);

    setIsSearching(false);
    if (error) {
      toast({ title: "Search failed", description: error.message, variant: "destructive" });
      return;
    }
    setResults(data || []);
  };

  const handleSendRequest = async (targetId: string) => {
    if (!user) return;
    const { error } = await supabase.from("friend_requests").insert([
      { sender_id: user.id, receiver_id: targetId }
    ]);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Request Sent!", description: "Friend request sent." });
    }
  };

  return (
    <section>
      <h2 className="font-semibold text-lg mb-2">Find Friends</h2>
      <form onSubmit={handleSearch} className="flex gap-2 mb-2">
        <Input
          placeholder="Search by name or email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isSearching}
        />
        <Button type="submit" disabled={isSearching || !query.trim()}>
          {isSearching ? "Searching..." : <><Search className="w-4 h-4 mr-1" />Search</>}
        </Button>
      </form>
      {results && results.length > 0 && (
        <ul className="bg-white rounded-lg shadow p-4 space-y-2">
          {results.map(r => (
            <li key={r.id} className="flex items-center gap-3 py-1">
              {r.avatar_url
                ? <img src={r.avatar_url} alt="avatar" className="w-8 h-8 rounded-full" />
                : <div className="w-8 h-8 rounded-full bg-gray-300" />}
              <div>
                <div className="font-medium">{r.full_name || r.username || r.email}</div>
                <div className="text-xs text-gray-500">{r.username ? `@${r.username}` : r.email}</div>
              </div>
              <Button
                className="ml-auto"
                size="sm"
                onClick={() => handleSendRequest(r.id)}
              >Add Friend</Button>
            </li>
          ))}
        </ul>
      )}
      {results && results.length === 0 && query.trim() && (
        <div className="text-gray-400 text-sm mt-3">No users found.</div>
      )}
    </section>
  );
};

export default FriendSearch;
