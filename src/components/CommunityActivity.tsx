import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Trophy, Users } from "lucide-react";

const mockActivities = [
  {
    id: 1,
    user: { name: "Sarah Chen", avatar: "/placeholder.svg", username: "sarahc" },
    action: "completed challenge",
    target: "Walk 10,000 steps daily",
    timestamp: "2 hours ago",
    points: 50,
    type: "challenge"
  },
  {
    id: 2,
    user: { name: "Mike Rodriguez", avatar: "/placeholder.svg", username: "mikeR" },
    action: "joined community",
    target: "Local Cyclists",
    timestamp: "4 hours ago",
    type: "community"
  },
  {
    id: 3,
    user: { name: "Emma Johnson", avatar: "/placeholder.svg", username: "emmaJ" },
    action: "earned badge",
    target: "Eco Champion",
    timestamp: "1 day ago",
    type: "badge"
  }
];

const CommunityActivity: React.FC = () => {
  return (
    <section className="bg-card rounded-2xl p-4 shadow-sm border" aria-label="Community activity feed">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Community Activity
        </h2>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          View All
        </Button>
      </div>
      
      <div className="space-y-3">
        {mockActivities.map((activity) => (
          <div 
            key={activity.id} 
            className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
            role="button"
            tabIndex={0}
            aria-label={`${activity.user.name} ${activity.action} ${activity.target}`}
          >
            <Avatar className="w-8 h-8 ring-2 ring-background">
              <AvatarImage src={activity.user.avatar} alt={`${activity.user.name} avatar`} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {activity.user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-foreground text-sm truncate">
                  {activity.user.name}
                </span>
                <span className="text-muted-foreground text-sm">{activity.action}</span>
                {activity.type === "challenge" && <Trophy className="w-3 h-3 text-yellow-600" />}
                {activity.type === "badge" && <Badge variant="secondary" className="text-xs py-0">Badge</Badge>}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary truncate">
                  {activity.target}
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  {activity.timestamp}
                </span>
              </div>
              
              {activity.points && (
                <div className="mt-1">
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    +{activity.points} points
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <Heart className="w-3 h-3" />
                <span className="sr-only">Like activity</span>
              </Button>
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <MessageCircle className="w-3 h-3" />
                <span className="sr-only">Comment on activity</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <Button variant="outline" size="sm" className="w-full">
          Load More Activity
        </Button>
      </div>
    </section>
  );
};

export default CommunityActivity;