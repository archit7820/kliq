import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

type Props = {
  profile: {
    avatar_url?: string | null;
    full_name?: string | null;
    username?: string | null;
  } | null;
  onEdit: () => void;
};

const ProfileHeaderSimple: React.FC<Props> = ({ profile, onEdit }) => {
  const name = profile?.full_name || (profile?.username ? `@${profile.username}` : "");
  return (
    <section className="w-full rounded-2xl border bg-card p-5 flex flex-col items-center text-center">
      <Avatar className="h-24 w-24 ring-2 ring-border">
        <AvatarImage src={profile?.avatar_url || undefined} alt={name || 'User avatar'} />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
      <h2 className="mt-3 text-xl font-semibold tracking-tight text-foreground">{name}</h2>
      {profile?.username && profile?.full_name && (
        <p className="text-xs text-muted-foreground">@{profile.username}</p>
      )}
      <Button variant="outline" size="sm" className="mt-3" onClick={onEdit}>
        Edit Profile
      </Button>
    </section>
  );
};

export default ProfileHeaderSimple;
