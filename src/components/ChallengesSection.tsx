import React, { useState } from "react";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import ChallengeCreate from "@/components/ChallengeCreate";
import { Plus, Trophy, Users, Calendar, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const ChallengesSection: React.FC = () => {
  const { user } = useAuthStatus();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Fetch active challenges
  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ["all-challenges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("challenges")
        .select(`
          id, title, description, reward_kelp_points, audience_scope, 
          is_active, created_by, start_at, end_at,
          profiles:created_by(username, avatar_url)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000,
  });

  // Fetch user's participation
  const { data: userParticipation = [] } = useQuery({
    queryKey: ["user-challenges", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("challenge_participants")
        .select("challenge_id, is_completed, joined_at")
        .eq("user_id", user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Join a challenge
  const handleJoinChallenge = async (challengeId: string) => {
    if (!user || joiningId) return;
    
    setJoiningId(challengeId);
    try {
      const { error } = await supabase
        .from("challenge_participants")
        .insert({ challenge_id: challengeId, user_id: user.id });
      
      if (error) throw error;
      
      await queryClient.invalidateQueries({ queryKey: ["user-challenges"] });
      toast({ 
        title: "Challenge Joined!", 
        description: "You've successfully joined the challenge. Good luck!" 
      });
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to join challenge. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setJoiningId(null);
    }
  };

  // Check if user has joined a challenge
  const isJoined = (challengeId: string) => {
    return userParticipation.some(p => p.challenge_id === challengeId);
  };

  // Check if challenge is completed by user
  const isCompleted = (challengeId: string) => {
    const participation = userParticipation.find(p => p.challenge_id === challengeId);
    return participation?.is_completed || false;
  };

  // Get days remaining
  const getDaysRemaining = (endDate: string | null) => {
    if (!endDate) return null;
    const days = Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const officialChallenges = challenges.filter(c => c.audience_scope === 'world');
  const communityChallenges = challenges.filter(c => c.audience_scope !== 'world');
  const myChallenges = challenges.filter(c => c.created_by === user?.id);

  return (
    <div className="space-y-8">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Challenges</h2>
          <p className="text-muted-foreground">Create, join, and track your eco-challenges</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" aria-label="Create new challenge">
              <Plus className="w-4 h-4" />
              Create Challenge
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Challenge</DialogTitle>
            </DialogHeader>
            <ChallengeCreate />
          </DialogContent>
        </Dialog>
      </div>

      {/* My Challenges */}
      {myChallenges.length > 0 && (
        <section>
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            My Challenges ({myChallenges.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {myChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                isJoined={true}
                isCompleted={false}
                isOwner={true}
                onJoin={() => {}}
                onViewDetails={() => navigate(`/challenges/${challenge.id}`)}
                daysRemaining={getDaysRemaining(challenge.end_at)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Official Kelp Challenges */}
      <section>
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          Official Challenges ({officialChallenges.length})
        </h3>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
            <span className="ml-3 text-muted-foreground">Loading challenges...</span>
          </div>
        ) : officialChallenges.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {officialChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                isJoined={isJoined(challenge.id)}
                isCompleted={isCompleted(challenge.id)}
                isOwner={false}
                onJoin={() => handleJoinChallenge(challenge.id)}
                onViewDetails={() => navigate(`/challenges/${challenge.id}`)}
                isJoining={joiningId === challenge.id}
                daysRemaining={getDaysRemaining(challenge.end_at)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No official challenges available</p>
          </div>
        )}
      </section>

      {/* Community Challenges */}
      <section>
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Community Challenges ({communityChallenges.length})
        </h3>
        {communityChallenges.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {communityChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                isJoined={isJoined(challenge.id)}
                isCompleted={isCompleted(challenge.id)}
                isOwner={challenge.created_by === user?.id}
                onJoin={() => handleJoinChallenge(challenge.id)}
                onViewDetails={() => navigate(`/challenges/${challenge.id}`)}
                isJoining={joiningId === challenge.id}
                daysRemaining={getDaysRemaining(challenge.end_at)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No community challenges yet</p>
            <p className="text-sm text-muted-foreground mt-1">Be the first to create one!</p>
          </div>
        )}
      </section>
    </div>
  );
};

interface ChallengeCardProps {
  challenge: any;
  isJoined: boolean;
  isCompleted: boolean;
  isOwner: boolean;
  onJoin: () => void;
  onViewDetails: () => void;
  isJoining?: boolean;
  daysRemaining: number | null;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  isJoined,
  isCompleted,
  isOwner,
  onJoin,
  onViewDetails,
  isJoining = false,
  daysRemaining
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onViewDetails}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base line-clamp-2">{challenge.title}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              {challenge.audience_scope === 'world' ? (
                <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                  Official
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  Community
                </Badge>
              )}
              {challenge.reward_kelp_points > 0 && (
                <Badge className="text-xs bg-green-100 text-green-800">
                  {challenge.reward_kelp_points} pts
                </Badge>
              )}
            </div>
          </div>
          {daysRemaining !== null && (
            <div className="text-right">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span className="text-xs">{daysRemaining}d left</span>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {challenge.description || "Join this challenge to make a positive impact!"}
        </p>
        
        {challenge.profiles && challenge.audience_scope !== 'world' && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <span>by {challenge.profiles.username}</span>
          </div>
        )}

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {isOwner ? (
            <Badge className="bg-blue-100 text-blue-800">Your Challenge</Badge>
          ) : isCompleted ? (
            <Badge className="bg-green-100 text-green-800">Completed</Badge>
          ) : isJoined ? (
            <Badge className="bg-purple-100 text-purple-800">Joined</Badge>
          ) : (
            <Button
              size="sm"
              onClick={onJoin}
              disabled={isJoining}
              aria-label={`Join challenge: ${challenge.title}`}
            >
              {isJoining ? "Joining..." : "Join"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChallengesSection;