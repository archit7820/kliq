import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Users, Target, Award, Activity, Leaf } from "lucide-react";

interface CommunityProgressTrackerProps {
  communityId: string;
}

const CommunityProgressTracker: React.FC<CommunityProgressTrackerProps> = ({ communityId }) => {
  // Fetch community members count and their activities
  const { data: communityStats, isLoading } = useQuery({
    queryKey: ["community-stats", communityId],
    queryFn: async () => {
      // Get member count
      const { data: membersData, error: membersError } = await supabase
        .from("community_memberships")
        .select("user_id")
        .eq("community_id", communityId)
        .eq("status", "approved");

      if (membersError) throw new Error(membersError.message);

      const memberIds = membersData?.map(m => m.user_id) || [];
      const memberCount = memberIds.length;

      // Get collective carbon impact
      let totalCarbonSaved = 0;
      let totalActivities = 0;
      
      if (memberIds.length > 0) {
        const { data: activitiesData, error: activitiesError } = await supabase
          .from("activities")
          .select("carbon_footprint_kg")
          .in("user_id", memberIds)
          .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

        if (activitiesError) throw new Error(activitiesError.message);

        totalActivities = activitiesData?.length || 0;
        totalCarbonSaved = activitiesData?.reduce((sum, activity) => {
          // Negative values are carbon savings (green activities)
          return sum + Math.abs(Math.min(0, activity.carbon_footprint_kg));
        }, 0) || 0;
      }

      return {
        memberCount,
        totalCarbonSaved,
        totalActivities
      };
    }
  });

  // Fetch active challenges stats
  const { data: challengeStats } = useQuery({
    queryKey: ["community-challenge-stats", communityId],
    queryFn: async () => {
      const { data: challengesData, error } = await supabase
        .from("community_challenges")
        .select(`
          id,
          title,
          community_challenge_participants(user_id, is_completed)
        `)
        .eq("community_id", communityId)
        .eq("is_active", true);

      if (error) throw new Error(error.message);

      const activeChallenges = challengesData?.length || 0;
      let totalParticipants = 0;
      let completedChallenges = 0;

      challengesData?.forEach(challenge => {
        const participants = challenge.community_challenge_participants || [];
        totalParticipants += participants.length;
        completedChallenges += participants.filter(p => p.is_completed).length;
      });

      return {
        activeChallenges,
        totalParticipants,
        completedChallenges
      };
    }
  });

  // Mock some additional progress metrics (can be made dynamic later)
  const progressMetrics = [
    {
      label: "Weekly Goal",
      current: Math.round((communityStats?.totalCarbonSaved || 0) * 0.8),
      target: Math.round((communityStats?.totalCarbonSaved || 0) || 100),
      unit: "kg CO₂ saved",
      color: "bg-green-500"
    },
    {
      label: "Active Members",
      current: Math.round((communityStats?.memberCount || 0) * 0.7),
      target: communityStats?.memberCount || 1,
      unit: "members",
      color: "bg-blue-500"
    }
  ];

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-muted/50 rounded-lg h-24" />
      ))}
    </div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Community Progress</h3>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-xs text-green-700">Carbon Saved</p>
                <p className="text-lg font-bold text-green-800">
                  {communityStats?.totalCarbonSaved.toFixed(1) || 0} kg
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-blue-700">Active Members</p>
                <p className="text-lg font-bold text-blue-800">
                  {communityStats?.memberCount || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-xs text-purple-700">Activities</p>
                <p className="text-lg font-bold text-purple-800">
                  {communityStats?.totalActivities || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-xs text-yellow-700">Challenges</p>
                <p className="text-lg font-bold text-yellow-800">
                  {challengeStats?.activeChallenges || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bars */}
      <div className="space-y-3">
        <h4 className="font-medium text-foreground">Goals Progress</h4>
        {progressMetrics.map((metric, index) => {
          const percentage = Math.min((metric.current / metric.target) * 100, 100);
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{metric.label}</span>
                  <Badge variant="secondary" className="text-xs">
                    {metric.current}/{metric.target} {metric.unit}
                  </Badge>
                </div>
                <Progress value={percentage} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {percentage.toFixed(0)}% complete
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Challenge Completion Stats */}
      {challengeStats && challengeStats.activeChallenges > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="w-4 h-4" />
              Challenge Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Active Challenges:</span>
                <span className="font-medium">{challengeStats.activeChallenges}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Participants:</span>
                <span className="font-medium">{challengeStats.totalParticipants}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completed:</span>
                <span className="font-medium text-green-600">{challengeStats.completedChallenges}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CommunityProgressTracker;