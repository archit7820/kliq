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
      title: "Daily IRL Mission",
      description: "Bike to work + pick up 3 pieces of litter",
      icon: <Target className="w-5 h-5 text-primary" />,
      impact: "Save 2kg CO₂ + clean environment",
      reward: "50 points",
      action: "Accept Mission",
      urgent: false
    },
    {
      id: 2,
      title: `Keep Your ${streakCount}-Day Impact Streak!`,
      description: "Log one eco-action before midnight",
      icon: <Flame className="w-5 h-5 text-orange-500" />,
      impact: "Maintain momentum & inspire others",
      reward: "25 points",
      action: "Log Action",
      urgent: true
    },
    {
      id: 3,
      title: "Plant a Tree Weekend",
      description: "Join community tree planting event",
      icon: <Users className="w-5 h-5 text-green-600" />,
      impact: "40kg CO₂/year + habitat creation",
      reward: "200 points",
      action: "Join Event",
      urgent: false
    }
  ];

  return (
    <section className="space-y-3" aria-label="Impact opportunities">
      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-500" />
        Real World Actions
      </h2>
      
      <div className="space-y-3">
        {engagementCards.map((card) => (
          <div 
            key={card.id} 
            className={`bg-card rounded-xl p-4 shadow-sm border transition-all hover:shadow-md ${
              card.urgent ? 'ring-1 ring-orange-200 bg-gradient-to-r from-orange-50/30 to-card' : ''
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
                  
                  {/* Impact Preview */}
                  {card.impact && (
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-2 mb-3">
                      <div className="text-xs font-medium text-green-800 flex items-center gap-1">
                        🌍 <span>{card.impact}</span>
                      </div>
                    </div>
                  )}
                  
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