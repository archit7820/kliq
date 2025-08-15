
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, User, Filter, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

type Profile = {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  location: string | null;
  lifestyle_tags: string[] | null;
};

const EnhancedFriendSearch = () => {
  const { user } = useAuthStatus();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const [inviting, setInviting] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [locationFilter, setLocationFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [existingFriends, setExistingFriends] = useState<Set<string>>(new Set());
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set());

  // Load existing friends and pending requests
  useEffect(() => {
    if (!user) return;

    const loadFriendsAndRequests = async () => {
      // Get existing friends
      const { data: friends } = await supabase
        .from("friends")
        .select("user1_id, user2_id")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      const friendIds = new Set(
        friends?.map(f => f.user1_id === user.id ? f.user2_id : f.user1_id) || []
      );
      setExistingFriends(friendIds);

      // Get pending requests (sent by current user)
      const { data: requests } = await supabase
        .from("friend_requests")
        .select("receiver_id")
        .eq("sender_id", user.id)
        .eq("status", "pending");

      const pendingIds = new Set(requests?.map(r => r.receiver_id) || []);
      setPendingRequests(pendingIds);
    };

    loadFriendsAndRequests();
  }, [user]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() && !locationFilter.trim() && !tagFilter.trim()) return;
    
    setSearching(true);
    try {
      let queryBuilder = supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url, location, lifestyle_tags")
        .neq("id", user?.id || ""); // Exclude current user

      // Apply search filters
      if (query.trim()) {
        queryBuilder = queryBuilder.or(
          `username.ilike.%${query.trim()}%,full_name.ilike.%${query.trim()}%`
        );
      }

      if (locationFilter.trim()) {
        queryBuilder = queryBuilder.ilike("location", `%${locationFilter.trim()}%`);
      }

      if (tagFilter.trim()) {
        queryBuilder = queryBuilder.contains("lifestyle_tags", [tagFilter.trim()]);
      }

      const { data, error } = await queryBuilder.limit(20);

      if (error) throw error;

      // Filter out existing friends and users with pending requests
      const filteredResults = (data || []).filter(profile => 
        !existingFriends.has(profile.id) && !pendingRequests.has(profile.id)
      );

      setResults(filteredResults);
    } catch (error) {
      toast({ 
        title: "Search failed", 
        description: "Failed to search users. Please try again.",
        variant: "destructive" 
      });
    } finally {
      setSearching(false);
    }
  };

  const handleInvite = async (profile: Profile) => {
    if (!user) return;
    
    setInviting(profile.id);
    try {
      const { error } = await supabase
        .from("friend_requests")
        .insert([{ sender_id: user.id, receiver_id: profile.id, status: "pending" }]);

      if (error) throw error;

      toast({
        title: "Request Sent!",
        description: `Friend request sent to ${profile.full_name || profile.username}.`,
      });

      // Remove from results and add to pending
      setResults(prev => prev.filter(p => p.id !== profile.id));
      setPendingRequests(prev => new Set([...prev, profile.id]));
    } catch (error) {
      toast({ 
        title: "Failed", 
        description: "Failed to send friend request. Please try again.",
        variant: "destructive" 
      });
    } finally {
      setInviting(null);
    }
  };

  const clearFilters = () => {
    setQuery("");
    setLocationFilter("");
    setTagFilter("");
    setResults([]);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 space-y-4">
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by name or username..."
                className="flex-1"
              />
              <Collapsible open={filterOpen} onOpenChange={setFilterOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="w-4 h-4" />
                  </Button>
                </CollapsibleTrigger>
              </Collapsible>
            </div>

            <Collapsible open={filterOpen} onOpenChange={setFilterOpen}>
              <CollapsibleContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    type="text"
                    value={locationFilter}
                    onChange={e => setLocationFilter(e.target.value)}
                    placeholder="Filter by location..."
                  />
                  <Input
                    type="text"
                    value={tagFilter}
                    onChange={e => setTagFilter(e.target.value)}
                    placeholder="Filter by lifestyle tag..."
                  />
                </div>
                
                {(query || locationFilter || tagFilter) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </CollapsibleContent>
            </Collapsible>

            <Button
              type="submit"
              disabled={searching}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              {searching ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Search Users
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {results.map(profile => (
          <Card key={profile.id} className="hover:shadow-md transition-shadow">
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
                  {profile.location && (
                    <p className="text-xs text-gray-400 truncate">{profile.location}</p>
                  )}
                  {profile.lifestyle_tags && profile.lifestyle_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {profile.lifestyle_tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {profile.lifestyle_tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{profile.lifestyle_tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
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
                      Add
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {results.length === 0 && (query || locationFilter || tagFilter) && !searching && (
          <Card className="border-dashed border-2 border-gray-200">
            <CardContent className="p-8 text-center">
              <Search className="w-8 h-8 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-sm text-gray-500">Try adjusting your search criteria</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EnhancedFriendSearch;
