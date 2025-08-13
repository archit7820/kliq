import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, Target, Users, Gift, Calendar, Zap } from "lucide-react";

interface GamifiedEngagementCardsProps {
  profile?: any;
}

const GamifiedEngagementCards: React.FC<GamifiedEngagementCardsProps> = ({ profile }) => {
  const streakCount = profile?.streak_count ?? 0;
  
  const engagementCards = [
    {
      id: 1,
      title: "Daily Mission",
      description: "Complete 3 eco-friendly actions today",
      icon: <Target className="w-5 h-5 text-primary" />,
      reward: "25 points",
      action: "Start Mission",
      urgent: false
    },
    {
      id: 2,
      title: `Keep Your ${streakCount}-Day Streak!`,
      description: "Post an eco-activity before midnight",
      icon: <Flame className="w-5 h-5 text-orange-500" />,
      reward: "15 points",
      action: "Post Now",
      urgent: true
    },
    {
      id: 3,
      title: "Boost a Friend",
      description: "Support a friend's post to earn bonus points",
      icon: <Users className="w-5 h-5 text-blue-500" />,
      reward: "10 points",
      action: "Find Friends",
      urgent: false
    },
    {
      id: 4,
      title: "Weekend Challenge",
      description: "Join this weekend's community challenge",
      icon: <Calendar className="w-5 h-5 text-purple-500" />,
      reward: "100 points",
      action: "Join Challenge",
      urgent: false
    }
  ];

  return (
    <section className="space-y-4" aria-label="Engagement opportunities">
      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-500" />
        Quick Actions
      </h2>
      
      <div className="grid gap-3">
        {engagementCards.map((card) => (
          <div 
            key={card.id} 
            className={`bg-card rounded-2xl p-4 shadow-sm border transition-all hover:shadow-md ${
              card.urgent ? 'ring-2 ring-orange-200 bg-gradient-to-r from-orange-50/50 to-card' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-1">
                  {card.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-foreground text-sm">
                      {card.title}
                    </h3>
                    {card.urgent && (
                      <Badge className="bg-orange-100 text-orange-800 text-xs">
                        Urgent
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {card.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      <Gift className="w-3 h-3 mr-1" />
                      {card.reward}
                    </Badge>
                    <Button 
                      size="sm" 
                      className={card.urgent ? 'btn-orange' : 'btn-primary'}
                      aria-label={`${card.action} for ${card.title}`}
                    >
                      {card.action}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default GamifiedEngagementCards;