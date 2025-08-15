
import React from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  return (
    <div className="w-full">
      {/* Your Story + Quick Actions - Mobile optimized */}
      <div className="flex items-center gap-2 mb-3">
        {/* Your Story */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="p-0.5 rounded-full bg-gradient-to-r from-primary to-green-500">
              <Avatar className="h-10 w-10 border-2 border-background">
                <AvatarImage src={profile?.avatar_url} alt="Your story" />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {profile?.username?.slice(0, 2).toUpperCase() || "ME"}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center border-2 border-background">
              <Plus className="h-2.5 w-2.5" />
            </div>
          </div>
          <span className="text-xs font-medium text-foreground mt-1">Your Story</span>
        </div>

        {/* Quick Action Button - Mobile friendly */}
        <Button 
          size="sm" 
          className="btn-primary flex-1 h-10 rounded-xl font-medium text-sm"
          aria-label="Log new activity"
          onClick={() => navigate('/log-activity')}
        >
          <Camera className="h-3.5 w-3.5 mr-1.5" />
          Log Activity
        </Button>
      </div>

      {/* IRL Activity Categories - Mobile grid */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            Real World Impact
          </h3>
          <Badge variant="secondary" className="text-xs px-2 py-0.5">
            <Clock className="h-2.5 w-2.5 mr-1" />
            Today
          </Badge>
        </div>

        {/* Activity Grid - Mobile optimized */}
        <div className="grid grid-cols-3 gap-1.5">
          {IRLActivities.slice(0, 6).map((activity) => (
            <button
              key={activity.id}
              className={`
                ${activity.color} 
                rounded-lg p-2.5 text-center transition-all duration-200 
                hover:scale-105 active:scale-95 border
                focus:outline-none focus:ring-2 focus:ring-primary/50
                touch-manipulation
              `}
              aria-label={`Log ${activity.label} activity`}
            >
              <div className="text-xl mb-1">{activity.emoji}</div>
              <div className="text-xs font-medium">{activity.label}</div>
            </button>
          ))}
        </div>

        {/* Impact Encouragement - Mobile compact */}
        <div className="bg-gradient-to-r from-primary/10 to-green-100/50 rounded-lg p-2.5 border">
          <div className="text-center">
            <div className="text-sm font-medium text-foreground mb-0.5">
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
