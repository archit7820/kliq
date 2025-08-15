
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Users } from "lucide-react";

export type Community = {
  id: string;
  name: string;
  description?: string | null;
  is_official?: boolean | null;
  scope?: 'local' | 'national' | 'global';
  category?: string | null;
  cover_image_url?: string | null;
};

export default function CommunityCardMinimal({
  community,
  joined,
  onOpen,
  onJoin,
}: {
  community: Community;
  joined: boolean;
  onOpen: (id: string) => void;
  onJoin: (id: string) => void;
}) {
  return (
    <article className="rounded-lg border bg-card shadow-sm p-3 flex flex-col gap-2 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start gap-2">
        <div className="flex items-center gap-1 flex-shrink-0">
          {community.is_official && (
            <Star className="w-3 h-3 text-primary fill-primary" aria-hidden />
          )}
          <Users className="w-3 h-3 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold leading-tight text-foreground truncate">
            {community.name}
          </h3>
          {community.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
              {community.description}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between gap-2 mt-1">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {community.scope && (
            <Badge variant="outline" className="text-xs py-0 px-1.5 capitalize flex-shrink-0">
              {community.scope}
            </Badge>
          )}
          {community.category && (
            <Badge variant="secondary" className="text-xs py-0 px-1.5 capitalize flex-shrink-0">
              {community.category}
            </Badge>
          )}
        </div>
        
        <div className="flex-shrink-0">
          {joined ? (
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={() => onOpen(community.id)}
              className="text-xs px-2 py-1 h-6"
            >
              Open
            </Button>
          ) : (
            <Button 
              size="sm" 
              onClick={() => onJoin(community.id)}
              className="text-xs px-2 py-1 h-6"
            >
              Join
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
