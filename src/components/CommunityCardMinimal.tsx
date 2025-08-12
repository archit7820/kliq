import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

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
    <article className="rounded-xl border bg-card shadow-sm p-4 flex flex-col gap-2">
      <div className="flex items-start gap-2">
        {community.is_official && (
          <Star className="w-4 h-4 text-primary" aria-hidden />
        )}
        <h3 className="text-base font-semibold leading-tight text-foreground">
          {community.name}
        </h3>
      </div>
      {community.description && (
        <p className="text-sm text-muted-foreground line-clamp-2">{community.description}</p>
      )}
      <div className="flex items-center gap-2 mt-1">
        {community.scope && (
          <Badge variant="outline" className="capitalize">{community.scope}</Badge>
        )}
        {community.category && (
          <Badge variant="secondary" className="capitalize">{community.category}</Badge>
        )}
      </div>
      <div className="mt-2 flex items-center justify-end">
        {joined ? (
          <Button size="sm" variant="secondary" onClick={() => onOpen(community.id)}>Open</Button>
        ) : (
          <Button size="sm" onClick={() => onJoin(community.id)}>Join</Button>
        )}
      </div>
    </article>
  );
}
