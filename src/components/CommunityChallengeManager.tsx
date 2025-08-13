import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Target, Calendar, Users, Trophy, Clock } from "lucide-react";
import { format } from "date-fns";

interface CommunityChallengeManagerProps {
  communityId: string;
  userId: string;
  isOwner: boolean;
}

const CommunityChallengeManager: React.FC<CommunityChallengeManagerProps> = ({
  communityId,
  userId,
  isOwner
}) => {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    title: "",
    description: "",
    challenge_type: "group",
    reward_points: 100,
    end_date: ""
  });

  // Fetch community challenges
  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ["community-challenges", communityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_challenges")
        .select(`
          *,
          community_challenge_participants(user_id, is_completed),
          profiles:created_by(full_name, username, avatar_url)
        `)
        .eq("community_id", communityId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  // Create challenge mutation
  const createChallengeMutation = useMutation({
    mutationFn: async (challengeData: typeof newChallenge) => {
      const { error } = await supabase
        .from("community_challenges")
        .insert({
          community_id: communityId,
          created_by: userId,
          ...challengeData,
          end_date: challengeData.end_date ? new Date(challengeData.end_date).toISOString() : null
        });

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({ title: "Challenge created successfully!" });
      setIsCreateDialogOpen(false);
      setNewChallenge({
        title: "",
        description: "",
        challenge_type: "group",
        reward_points: 100,
        end_date: ""
      });
      queryClient.invalidateQueries({ queryKey: ["community-challenges", communityId] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create challenge",
        description: error?.message,
        variant: "destructive"
      });
    }
  });

  // Join challenge mutation
  const joinChallengeMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      const { error } = await supabase
        .from("community_challenge_participants")
        .insert({
          challenge_id: challengeId,
          user_id: userId
        });

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({ title: "Joined challenge successfully!" });
      queryClient.invalidateQueries({ queryKey: ["community-challenges", communityId] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to join challenge",
        description: error?.message,
        variant: "destructive"
      });
    }
  });

  const handleCreateChallenge = () => {
    if (!newChallenge.title.trim()) {
      toast({
        title: "Title is required",
        variant: "destructive"
      });
      return;
    }
    createChallengeMutation.mutate(newChallenge);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "individual": return "bg-blue-100 text-blue-800";
      case "group": return "bg-green-100 text-green-800";
      case "team": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const isParticipant = (challenge: any) => {
    return challenge.community_challenge_participants?.some((p: any) => p.user_id === userId);
  };

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      {[1, 2].map(i => (
        <div key={i} className="bg-muted/50 rounded-lg h-32" />
      ))}
    </div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Challenges</h3>
        </div>
        {isOwner && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-1" />
                Create
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Challenge</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Challenge Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter challenge title"
                    value={newChallenge.title}
                    onChange={(e) => setNewChallenge(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the challenge..."
                    value={newChallenge.description}
                    onChange={(e) => setNewChallenge(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Challenge Type</Label>
                  <Select value={newChallenge.challenge_type} onValueChange={(value) => setNewChallenge(prev => ({ ...prev, challenge_type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="group">Group Challenge</SelectItem>
                      <SelectItem value="individual">Individual Challenge</SelectItem>
                      <SelectItem value="team">Team Challenge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="points">Reward Points</Label>
                  <Input
                    id="points"
                    type="number"
                    placeholder="100"
                    value={newChallenge.reward_points}
                    onChange={(e) => setNewChallenge(prev => ({ ...prev, reward_points: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date (Optional)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newChallenge.end_date}
                    onChange={(e) => setNewChallenge(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
                <Button 
                  onClick={handleCreateChallenge} 
                  className="w-full"
                  disabled={createChallengeMutation.isPending}
                >
                  {createChallengeMutation.isPending ? "Creating..." : "Create Challenge"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {challenges.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No active challenges yet.</p>
          {isOwner && <p className="text-sm">Create the first challenge to get started!</p>}
        </div>
      ) : (
        <div className="grid gap-4">
          {challenges.map((challenge: any) => (
            <Card key={challenge.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <CardTitle className="text-base font-semibold leading-tight">
                      {challenge.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      by {challenge.profiles?.full_name || challenge.profiles?.username || "Unknown"}
                    </p>
                  </div>
                  <Badge className={getTypeColor(challenge.challenge_type)}>
                    {challenge.challenge_type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {challenge.description && (
                  <p className="text-sm text-foreground">{challenge.description}</p>
                )}
                
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    {challenge.reward_points} points
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {challenge.community_challenge_participants?.length || 0} participants
                  </div>
                  {challenge.end_date && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Ends {format(new Date(challenge.end_date), 'MMM dd')}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end pt-2">
                  {isParticipant(challenge) ? (
                    <Badge variant="secondary">Joined</Badge>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => joinChallengeMutation.mutate(challenge.id)}
                      disabled={joinChallengeMutation.isPending}
                    >
                      {joinChallengeMutation.isPending ? "Joining..." : "Join Challenge"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityChallengeManager;