
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, Target, Users, Gift, Zap, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useQueryClient, useQuery } from "@tanstack/react-query";

interface GamifiedEngagementCardsProps {
  profile?: any;
}

const GamifiedEngagementCards: React.FC<GamifiedEngagementCardsProps> = ({ profile }) => {
  const streakCount = profile?.streak_count ?? 0;
  const navigate = useNavigate();
  const { user } = useAuthStatus();
  const queryClient = useQueryClient();

  // Fetch recent activities to check current state
  const { data: recentActivities } = useQuery({
    queryKey: ["recent-activities", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("activities")
        .select("activity, category, created_at")
        .eq("user_id", user.id)
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
        .order("created_at", { ascending: false });
      if (error) return [];
      return data || [];
    },
    enabled: !!user,
  });

  // Check if specific actions have been completed
  const hasMissionAccepted = recentActivities?.some(a => 
    a.activity.includes("Daily IRL Mission") && a.category === "mission-log"
  );
  const hasTreeEventJoined = recentActivities?.some(a => 
    a.activity.includes("Plant a Tree Weekend") && a.category === "community-event"
  );
  const hasTodayActivity = recentActivities?.some(a => {
    const activityDate = new Date(a.created_at).toDateString();
    const today = new Date().toDateString();
    return activityDate === today;
  });

  // Handle Accept Mission action
  const handleAcceptMission = async () => {
    if (!user) {
      toast.error("Please log in to accept missions");
      return;
    }

    try {
      const { error } = await supabase.from("activities").insert({
        user_id: user.id,
        activity: "Daily IRL Mission: Bike to work + pick up 3 pieces of litter",
        carbon_footprint_kg: -2.0,
        explanation: "Biked to work instead of driving and picked up litter to help the environment",
        emoji: "🚴‍♂️",
        category: "mission-log"
      });

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["activities"] });
      toast.success("Mission accepted! 🚀 Complete your real-world action and log it.");
    } catch (error) {
      toast.error("Failed to accept mission. Please try again.");
    }
  };

  // Handle Log Action
  const handleLogAction = () => {
    navigate("/log-activity");
  };

  // Handle Join Event
  const handleJoinEvent = async () => {
    if (!user) {
      toast.error("Please log in to join events");
      return;
    }

    try {
      const { error } = await supabase.from("activities").insert({
        user_id: user.id,
        activity: "Joined Plant a Tree Weekend community event",
        carbon_footprint_kg: -40.0,
        explanation: "Participating in community tree planting event to create habitat and offset CO₂",
        emoji: "🌱",
        category: "community-event"
      });

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["activities"] });
      toast.success("Event joined! 🌱 Check your community for event details.");
    } catch (error) {
      toast.error("Failed to join event. Please try again.");
    }
  };

  const getActionHandler = (action: string) => {
    switch (action) {
      case "Accept Mission":
        return handleAcceptMission;
      case "Log Action":
        return handleLogAction;
      case "Join Event":
        return handleJoinEvent;
      default:
        return () => {};
    }
  };
  
  const engagementCards = [
    {
      id: 1,
      title: "Daily IRL Mission",
      description: "Bike to work + pick up 3 pieces of litter",
      icon: <Target className="w-4 h-4 text-primary" />,
      impact: "Save 2kg CO₂ + clean environment",
      reward: "50 points",
      action: "Accept Mission",
      urgent: false
    },
    {
      id: 2,
      title: `Keep Your ${streakCount}-Day Impact Streak!`,
      description: "Log one eco-action before midnight",
      icon: <Flame className="w-4 h-4 text-blue-600" />,
      impact: "Maintain momentum & inspire others",
      reward: "25 points",
      action: "Log Action",
      urgent: true
    },
    {
      id: 3,
      title: "Plant a Tree Weekend",
      description: "Join community tree planting event",
      icon: <Users className="w-4 h-4 text-green-600" />,
      impact: "40kg CO₂/year + habitat creation",
      reward: "200 points",
      action: "Join Event",
      urgent: false
    }
  ];

  return (
    <section className="space-y-2.5" aria-label="Impact opportunities">
      <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
        <Zap className="w-4 h-4 text-blue-600" />
        Real World Actions
      </h2>
      
      <div className="space-y-2.5">
        {engagementCards.map((card) => {
          // Check completion status for each card
          const isCompleted = 
            (card.id === 1 && hasMissionAccepted) ||
            (card.id === 2 && hasTodayActivity) ||
            (card.id === 3 && hasTreeEventJoined);
          
          const buttonText = isCompleted ? "Completed!" : card.action;
          const buttonIcon = isCompleted ? <Check className="w-3 h-3 mr-1" /> : null;
          
          return (
            <div 
              key={card.id} 
              className={`bg-card rounded-xl p-3 shadow-sm border transition-all hover:shadow-md touch-manipulation ${
                card.urgent ? 'border-blue-200 bg-blue-50/30' : 'border-border'
              } ${isCompleted ? 'bg-green-50/30 border-green-200' : ''}`}
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <div className="mt-0.5 flex-shrink-0">
                    {isCompleted ? <Check className="w-4 h-4 text-green-600" /> : card.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <h3 className="font-medium text-foreground text-sm truncate">
                        {card.title}
                      </h3>
                      {card.urgent && !isCompleted && (
                        <Badge className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 flex-shrink-0">
                          Urgent
                        </Badge>
                      )}
                      {isCompleted && (
                        <Badge className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 flex-shrink-0">
                          Done
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {isCompleted ? "Great job! You've completed this action." : card.description}
                    </p>
                    
                    {/* Impact Preview - Mobile compact */}
                    {card.impact && !isCompleted && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-2">
                        <div className="text-xs font-medium text-green-800 flex items-center gap-1">
                          🌍 <span className="line-clamp-1">{card.impact}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <Badge className={`text-xs px-2 py-0.5 ${isCompleted ? 'bg-green-100 text-green-800' : 'bg-green-100 text-green-800'}`}>
                        {isCompleted ? (
                          <>
                            <Check className="w-3 h-3 mr-1" />
                            Earned
                          </>
                        ) : (
                          <>
                            <Gift className="w-3 h-3 mr-1" />
                            {card.reward}
                          </>
                        )}
                      </Badge>
                      <Button 
                        size="sm" 
                        onClick={isCompleted ? undefined : getActionHandler(card.action)}
                        disabled={isCompleted}
                        className={`text-xs px-3 py-1.5 touch-manipulation ${
                          isCompleted 
                            ? 'bg-green-100 text-green-800 border border-green-200 cursor-not-allowed' 
                            : card.urgent 
                              ? 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-500' 
                              : 'btn-primary'
                        }`}
                        aria-label={`${buttonText} for ${card.title}`}
                      >
                        {buttonIcon}
                        {buttonText}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default GamifiedEngagementCards;
