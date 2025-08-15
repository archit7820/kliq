
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, User, Users, Sparkles, Zap, Filter, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Profile = {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  lifestyle_tags: string[] | null;
  location: string | null;
  kelp_points: number | null;
};

const LIFESTYLE_TAGS = [
  "Vegetarian", "Vegan", "Cyclist", "Gardener", "Minimalist", "Composter",
  "Zero Waste", "Car Free", "Parent", "Techie", "Student", "Remote Worker"
];

const EnhancedFriendSearch = () => {
  const { user } = useAuthStatus();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const [inviting, setInviting] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState("");
  const [existingFriends, setExistingFriends] = useState<string[]>([]);
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);

  // Fetch existing friends and pending requests
  useEffect(() => {
    if (!user) return;

    const fetchExistingConnections = async () => {
      // Get existing friends
      const { data: friends } = await supabase
        .from("friends")
        .select("user1_id, user2_id")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      const friendIds = friends?.map(f => 
        f.user1_id === user.id ? f.user2_id : f.user1_id
      ) || [];

      // Get pending requests (both sent and received)
      const { data: requests } = await supabase
        .from("friend_requests")
        .select("sender_id, receiver_id")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq("status", "pending");

      const requestIds = requests?.map(r => 
        r.sender_id === user.id ? r.receiver_id : r.sender_id
      ) || [];

      setExistingFriends(friendIds);
      setPendingRequests(requestIds);
    };

    fetchExistingConnections();
  }, [user]);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSearching(true);

    try {
      let queryBuilder = supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url, lifestyle_tags, location, kelp_points")
        .neq("id", user?.id || "");

      // Apply text search
      if (query.trim()) {
        queryBuilder = queryBuilder.or(`username.ilike.%${query.trim()}%,full_name.ilike.%${query.trim()}%`);
      }

      // Apply lifestyle tags filter
      if (selectedTags.length > 0) {
        queryBuilder = queryBuilder.overlaps("lifestyle_tags", selectedTags);
      }

      // Apply location filter
      if (locationFilter.trim()) {
        queryBuilder = queryBuilder.ilike("location", `%${locationFilter.trim()}%`);
      }

      queryBuilder = queryBuilder.limit(20);

      const { data, error } = await queryBuilder;

      if (error) {
        toast({ title: "Error searching", description: error.message, variant: "destructive" });
        setResults([]);
      } else {
        // Filter out existing friends and pending requests
        const filteredResults = (data || []).filter(profile => 
          !existingFriends.includes(profile.id) && !pendingRequests.includes(profile.id)
        );
        setResults(filteredResults);
      }
    } catch (error) {
      toast({ title: "Search failed", description: "Please try again", variant: "destructive" });
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleInvite = async (profile: Profile) => {
    if (!user) return;
    setInviting(profile.id);

    try {
      const { error } = await supabase.from("friend_requests").insert([
        { sender_id: user.id, receiver_id: profile.id, status: "pending" }
      ]);

      if (error) {
        toast({ title: "Failed", description: error.message, variant: "destructive" });
      } else {
        toast({
          title: "Request Sent!",
          description: `Sent friend invite to @${profile.username}.`,
        });
        setResults(res => res.filter(p => p.id !== profile.id));
        setPendingRequests(prev => [...prev, profile.id]);
      }
    } catch (error) {
      toast({ title: "Failed to send request", description: "Please try again", variant: "destructive" });
    } finally {
      setInviting(null);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setLocationFilter("");
    setQuery("");
    setResults([]);
  };

  // Auto-search when filters change
  useEffect(() => {
    if (query || selectedTags.length > 0 || locationFilter) {
      const timeoutId = setTimeout(() => {
        handleSearch();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [query, selectedTags, locationFilter, existingFriends, pendingRequests]);

  return (
    <section className="space-y-3 sm:space-y-4">
      {/* Mobile-optimized header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-xl font-semibold text-foreground">Find Friends</h2>
            <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>AI-powered discovery</span>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline ml-2">Filters</span>
        </Button>
      </div>

      {/* Mobile-optimized search */}
      <Card>
        <CardContent className="p-3 sm:p-4 space-y-3">
          <form className="flex gap-2 sm:gap-3" onSubmit={handleSearch}>
            <Input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by name or username..."
              className="flex-1 text-sm"
            />
            <Button
              type="submit"
              disabled={searching}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-6 shrink-0"
            >
              {searching ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </form>

          {/* Mobile-optimized filters */}
          {showFilters && (
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Filters</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-7 px-2 text-xs"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              </div>
              
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">
                  Location
                </label>
                <Input
                  type="text"
                  value={locationFilter}
                  onChange={e => setLocationFilter(e.target.value)}
                  placeholder="Enter location..."
                  className="text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">
                  Lifestyle Tags
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {LIFESTYLE_TAGS.map(tag => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer text-xs px-2 py-1 transition-colors touch-manipulation"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile-optimized results */}
      <div className="space-y-2 sm:space-y-3">
        {/* Loading state */}
        {searching && (
          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="flex items-center justify-center gap-2 text-purple-600">
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Searching for users...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty states */}
        {!searching && results.length === 0 && (query || selectedTags.length > 0 || locationFilter) && (
          <Card className="border-dashed border-2">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="p-2 sm:p-3 bg-muted rounded-full w-fit mx-auto mb-3 sm:mb-4">
                <Search className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-foreground mb-1 sm:mb-2 text-sm sm:text-base">No users found</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        )}

        {!searching && results.length === 0 && !query && selectedTags.length === 0 && !locationFilter && (
          <Card className="border-dashed border-2">
            <CardContent className="p-6 sm:p-8 text-center">
              <div className="p-2 sm:p-3 bg-purple-100 rounded-full w-fit mx-auto mb-3 sm:mb-4">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
              </div>
              <h3 className="font-medium text-foreground mb-1 sm:mb-2 text-sm sm:text-base">AI-Powered Friend Discovery</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">Search for friends or use filters to discover like-minded people</p>
              <div className="text-xs text-muted-foreground">Smart suggestions coming soon!</div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {results.map(profile => (
          <Card key={profile.id} className="hover:shadow-md transition-all duration-200 border-border/50">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Avatar */}
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="avatar"
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-border object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                  </div>
                )}
                
                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
                  <div>
                    <h3 className="font-medium text-foreground truncate text-sm sm:text-base">
                      {profile.full_name || profile.username || "User"}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      @{profile.username}
                    </p>
                  </div>
                  
                  {/* Tags and location */}
                  <div className="space-y-1.5">
                    {profile.location && (
                      <p className="text-xs text-muted-foreground truncate">📍 {profile.location}</p>
                    )}
                    {profile.lifestyle_tags && profile.lifestyle_tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {profile.lifestyle_tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0.5">
                            {tag}
                          </Badge>
                        ))}
                        {profile.lifestyle_tags.length > 3 && (
                          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                            +{profile.lifestyle_tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action button */}
                <Button
                  onClick={() => handleInvite(profile)}
                  disabled={inviting === profile.id}
                  className="bg-purple-600 hover:bg-purple-700 text-white shrink-0 h-8 px-3 sm:h-9 sm:px-4 text-xs sm:text-sm"
                >
                  {inviting === profile.id ? (
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span className="hidden sm:inline">Invite</span>
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

export default EnhancedFriendSearch;
