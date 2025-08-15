
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, Target, Users, Gift, Zap } from "lucide-react";

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
        {engagementCards.map((card) => (
          <div 
            key={card.id} 
            className={`bg-card rounded-xl p-3 shadow-sm border transition-all hover:shadow-md touch-manipulation ${
              card.urgent ? 'border-blue-200 bg-blue-50/30' : 'border-border'
            }`}
          >
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                <div className="mt-0.5 flex-shrink-0">
                  {card.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <h3 className="font-medium text-foreground text-sm truncate">
                      {card.title}
                    </h3>
                    {card.urgent && (
                      <Badge className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 flex-shrink-0">
                        Urgent
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {card.description}
                  </p>
                  
                  {/* Impact Preview - Mobile compact */}
                  {card.impact && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-2">
                      <div className="text-xs font-medium text-green-800 flex items-center gap-1">
                        🌍 <span className="line-clamp-1">{card.impact}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <Badge className="bg-green-100 text-green-800 text-xs px-2 py-0.5">
                      <Gift className="w-3 h-3 mr-1" />
                      {card.reward}
                    </Badge>
                    <Button 
                      size="sm" 
                      className={`text-xs px-3 py-1.5 touch-manipulation ${card.urgent ? 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-500' : 'btn-primary'}`}
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
