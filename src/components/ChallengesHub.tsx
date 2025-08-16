
import React, { useState } from "react";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ChallengeStatusCard from "@/components/ChallengeStatusCard";
import CommunityChallengeCard from "@/components/CommunityChallengeCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ChallengeCreate from "@/components/ChallengeCreate";
import { Users, Trophy, Plus, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ChallengesHub: React.FC = () => {
  const { user } = useAuthStatus();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const { data: kelpChallenges = [], isLoading: loadingKelp } = useQuery({
    queryKey: ["kelp-week-challenges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("challenges")
        .select("id, title, description, reward_kelp_points, audience_scope, is_active, created_by")
        .eq("audience_scope", "world")
        .eq("is_active", true)
        .limit(10);
      if (error) return [];
      return data || [];
    },
    refetchInterval: 10000,
  });

  const { data: communityChallenges = [], isLoading: loadingCommunity } = useQuery({
    queryKey: ["community-challenges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("challenges")
        .select("id, title, description, reward_kelp_points, audience_scope, is_active, created_by")
        .neq("audience_scope", "world")
        .eq("is_active", true)
        .limit(20);
      if (error) return [];
      return data || [];
    },
    refetchInterval: 10000,
  });

  // Fetch community-specific challenges from the community_challenges table
  const { data: activeCommunitySpecificChallenges = [], isLoading: loadingCommunitySpecific } = useQuery({
    queryKey: ["active-community-challenges", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("community_challenges")
        .select(`
          *,
          communities!inner(name, id),
          profiles!community_challenges_created_by_fkey(username, avatar_url),
          community_challenge_participants(user_id, is_completed)
        `)
        .eq("is_active", true)
        .eq("communities.id", "community_challenges.community_id")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching community challenges:", error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user,
    refetchInterval: 5000,
  });

  const { data: myParticipation = [] } = useQuery({
    queryKey: ["user-challenges", user?.id],
    queryFn: async () => {
      if (!user) return [] as any[];
      const { data, error } = await supabase
        .from("challenge_participants")
        .select("challenge_id, is_completed")
        .eq("user_id", user.id);
      if (error) return [];
      return data || [];
    },
    enabled: !!user,
  });

  const handleJoin = async (challengeId: string) => {
    if (!user || joiningId) return;
    setJoiningId(challengeId);
    await supabase.from("challenge_participants").insert({ challenge_id: challengeId, user_id: user.id });
    await qc.invalidateQueries({ queryKey: ["user-challenges"] });
    setJoiningId(null);
  };

  const handleJoinCommunityChallenge = async (challengeId: string) => {
    if (!user || joiningId) return;
    setJoiningId(challengeId);
    
    const { error } = await supabase
      .from("community_challenge_participants")
      .insert({ challenge_id: challengeId, user_id: user.id });
    
    if (!error) {
      await qc.invalidateQueries({ queryKey: ["active-community-challenges"] });
    }
    setJoiningId(null);
  };

  const renderList = (list: any[]) => (
    <div className="flex flex-col gap-2">
      {list.map((ch: any) => {
        const participation = (myParticipation || []).find((p: any) => p.challenge_id === ch.id);
        return (
          <div key={ch.id} onClick={() => navigate(`/challenges/${ch.id}`)} className="cursor-pointer">
            <ChallengeStatusCard
              title={ch.title}
              description={ch.description}
              reward={ch.reward_kelp_points}
              joined={!!participation}
              completed={!!participation && participation.is_completed}
              joining={joiningId === ch.id}
              onJoin={() => handleJoin(ch.id)}
            />
          </div>
        );
      })}
    </div>
  );

  const renderCommunitySpecificChallenges = (list: any[]) => (
    <div className="flex flex-col gap-3">
      {list.map((challenge: any) => {
        const userParticipating = challenge.community_challenge_participants?.some(
          (p: any) => p.user_id === user?.id
        );
        
        return (
          <CommunityChallengeCard
            key={challenge.id}
            challenge={{
              id: challenge.id,
              title: challenge.title,
              description: challenge.description,
              challenge_type: challenge.challenge_type,
              reward_points: challenge.reward_points,
              start_date: challenge.start_date,
              end_date: challenge.end_date,
              max_participants: challenge.max_participants,
              created_by: challenge.created_by,
              participant_count: challenge.community_challenge_participants?.length || 0,
              user_participating: userParticipating
            }}
            creator={{
              username: challenge.profiles?.username,
              avatar_url: challenge.profiles?.avatar_url
            }}
            onJoin={() => handleJoinCommunityChallenge(challenge.id)}
            onView={() => navigate(`/communities/${challenge.community_id}`)}
            isLoading={joiningId === challenge.id}
          />
        );
      })}
    </div>
  );

  return (
    <div className="w-full space-y-4 px-3">
      {/* Mobile-Optimized Kelp Challenges */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-yellow-100 rounded-lg flex-shrink-0">
            <Trophy className="w-4 h-4 text-yellow-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-gray-800 truncate">Weekly Kelp Challenges</h3>
            <p className="text-xs text-gray-600 truncate">Official eco-challenges for impact</p>
          </div>
        </div>
        
        <div className="space-y-2">
          {loadingKelp ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
              <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : kelpChallenges.length > 0 ? (
            renderList(kelpChallenges)
          ) : (
            <div className="text-center py-6 text-gray-500">
              <Trophy className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm">New challenges coming soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Active Community Challenges */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-green-100 rounded-lg flex-shrink-0">
            <Target className="w-4 h-4 text-green-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-gray-800 truncate">Active Community Challenges</h3>
            <p className="text-xs text-gray-600 truncate">From communities you can join</p>
          </div>
        </div>
        
        <div className="space-y-2">
          {loadingCommunitySpecific ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
              <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : activeCommunitySpecificChallenges.length > 0 ? (
            renderCommunitySpecificChallenges(activeCommunitySpecificChallenges)
          ) : (
            <div className="text-center py-6 text-gray-500">
              <Target className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm">No active community challenges at the moment</p>
              <p className="text-xs text-gray-400 mt-1">Join communities to see their challenges!</p>
            </div>
          )}
        </div>
      </section>

      {/* Mobile-Optimized Community Challenges */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 rounded-lg flex-shrink-0">
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-gray-800 truncate">General Community Challenges</h3>
            <p className="text-xs text-gray-600 truncate">Created by users like you</p>
          </div>
        </div>
        
        <div className="space-y-2">
          {loadingCommunity ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
              <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : communityChallenges.length > 0 ? (
            renderList(communityChallenges)
          ) : (
            <div className="text-center py-6 text-gray-500">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm">Be the first to create a community challenge!</p>
            </div>
          )}
        </div>
      </section>

      {/* Mobile-Optimized Floating Action Button */}
      <Dialog>
        <DialogTrigger asChild>
          <button
            className="fixed bottom-24 right-4 z-40 bg-primary hover:bg-primary/90 text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-lg active:scale-95 transition-all"
            aria-label="Create New Challenge"
          >
            <Plus className="w-5 h-5" />
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="text-base">Create New Challenge</DialogTitle>
          </DialogHeader>
          <ChallengeCreate />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChallengesHub;
