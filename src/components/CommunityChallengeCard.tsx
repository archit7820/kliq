import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Users, Trophy, Target } from "lucide-react";
import { format } from "date-fns";

interface CommunityChallengeCardProps {
  challenge: {
    id: string;
    title: string;
    description?: string;
    challenge_type: 'group' | 'individual' | 'team';
    reward_points: number;
    start_date: string;
    end_date?: string;
    max_participants?: number;
    created_by: string;
    participant_count?: number;
    user_participating?: boolean;
  };
  creator?: {
    username?: string;
    avatar_url?: string;
  };
  onJoin?: (challengeId: string) => void;
  onView?: (challengeId: string) => void;
  isLoading?: boolean;
}

export default function CommunityChallengeCard({ 
  challenge, 
  creator, 
  onJoin, 
  onView, 
  isLoading 
}: CommunityChallengeCardProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'group': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'individual': return 'bg-green-100 text-green-800 border-green-200';
      case 'team': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'group': return <Users className="w-3 h-3" />;
      case 'individual': return <Target className="w-3 h-3" />;
      case 'team': return <Users className="w-3 h-3" />;
      default: return <Target className="w-3 h-3" />;
    }
  };

  return (
    <div className="bg-card rounded-xl border p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-base leading-tight line-clamp-2">
            {challenge.title}
          </h3>
          {challenge.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {challenge.description}
            </p>
          )}
        </div>
        
        {challenge.reward_points > 0 && (
          <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full">
            <Trophy className="w-3 h-3" />
            <span className="text-xs font-medium">{challenge.reward_points}</span>
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className={`text-xs ${getTypeColor(challenge.challenge_type)}`}>
          {getTypeIcon(challenge.challenge_type)}
          <span className="ml-1 capitalize">{challenge.challenge_type}</span>
        </Badge>
        
        {challenge.end_date && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>Until {format(new Date(challenge.end_date), 'MMM d')}</span>
          </div>
        )}
        
        {challenge.participant_count !== undefined && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="w-3 h-3" />
            <span>{challenge.participant_count}</span>
            {challenge.max_participants && <span>/{challenge.max_participants}</span>}
          </div>
        )}
      </div>

      {/* Creator */}
      {creator && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Avatar className="w-5 h-5">
            <AvatarImage src={creator.avatar_url} />
            <AvatarFallback className="text-xs">
              {creator.username?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span>Created by {creator.username}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onView?.(challenge.id)}
          className="flex-1 h-8 text-xs"
        >
          View Details
        </Button>
        
        {!challenge.user_participating && (
          <Button 
            size="sm" 
            onClick={() => onJoin?.(challenge.id)}
            disabled={isLoading || (challenge.max_participants && challenge.participant_count! >= challenge.max_participants)}
            className="flex-1 h-8 text-xs"
          >
            {isLoading ? "Joining..." : "Join Challenge"}
          </Button>
        )}
        
        {challenge.user_participating && (
          <Badge variant="secondary" className="px-3 py-1">
            Joined
          </Badge>
        )}
      </div>
    </div>
  );
}