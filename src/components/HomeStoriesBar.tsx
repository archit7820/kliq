import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Camera, MapPin, Clock } from "lucide-react";

interface HomeStoriesBarProps {
  profile?: any;
}

const IRLActivities = [
  { id: "bike", label: "Bike", emoji: "🚴", color: "bg-green-100 text-green-700" },
  { id: "walk", label: "Walk", emoji: "🚶", color: "bg-blue-100 text-blue-700" },
  { id: "transit", label: "Transit", emoji: "🚌", color: "bg-purple-100 text-purple-700" },
  { id: "recycle", label: "Recycle", emoji: "♻️", color: "bg-teal-100 text-teal-700" },
  { id: "plant", label: "Plant", emoji: "🌱", color: "bg-emerald-100 text-emerald-700" },
];

const HomeStoriesBar: React.FC<HomeStoriesBarProps> = ({ profile }) => {
  return (
    <div className="w-full">
      {/* Your Story + Quick Actions */}
      <div className="flex items-center gap-3 mb-4">
        {/* Your Story */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="p-0.5 rounded-full bg-gradient-to-r from-primary to-green-500">
              <Avatar className="h-12 w-12 border-2 border-background">
                <AvatarImage src={profile?.avatar_url} alt="Your story" />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {profile?.username?.slice(0, 2).toUpperCase() || "ME"}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center border-2 border-background">
              <Plus className="h-3 w-3" />
            </div>
          </div>
          <span className="text-xs font-medium text-foreground mt-1">Your Story</span>
        </div>

        {/* Quick Action Button */}
        <Button 
          size="sm" 
          className="btn-primary flex-1 h-12 rounded-xl font-medium"
          aria-label="Log new activity"
        >
          <Camera className="h-4 w-4 mr-2" />
          Log Activity
        </Button>
      </div>

      {/* IRL Activity Categories */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Real World Impact
          </h3>
          <Badge variant="secondary" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            Today
          </Badge>
        </div>

        {/* Activity Grid */}
        <div className="grid grid-cols-3 gap-2">
          {IRLActivities.slice(0, 6).map((activity) => (
            <button
              key={activity.id}
              className={`
                ${activity.color} 
                rounded-xl p-3 text-center transition-all duration-200 
                hover:scale-105 active:scale-95 border
                focus:outline-none focus:ring-2 focus:ring-primary/50
              `}
              aria-label={`Log ${activity.label} activity`}
            >
              <div className="text-2xl mb-1">{activity.emoji}</div>
              <div className="text-xs font-medium">{activity.label}</div>
            </button>
          ))}
        </div>

        {/* Impact Encouragement */}
        <div className="bg-gradient-to-r from-primary/10 to-green-100/50 rounded-xl p-3 border">
          <div className="text-center">
            <div className="text-sm font-medium text-foreground mb-1">
              🌍 Make Today Count!
            </div>
            <div className="text-xs text-muted-foreground">
              Every action creates positive impact on our planet
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeStoriesBar;
