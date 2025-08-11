import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HomeStoriesBarProps {
  profile?: any;
}

const HomeStoriesBar: React.FC<HomeStoriesBarProps> = ({ profile }) => {
  const items = [
    { id: "now", label: "Now", avatar: profile?.avatar_url || "", isNow: true },
    { id: "1", label: "Trail", avatar: "/placeholder.svg" },
    { id: "2", label: "Ride", avatar: "/placeholder.svg" },
    { id: "3", label: "Swim", avatar: "/placeholder.svg" },
    { id: "4", label: "Hike", avatar: "/placeholder.svg" },
  ];

  return (
    <div className="w-full overflow-x-auto animate-fade-in">
      <div className="flex gap-3 px-1 py-2">
        {items.map((it) => (
          <div key={it.id} className="flex flex-col items-center shrink-0">
            <div
              className={`relative p-0.5 rounded-full ring-2 ${it.isNow ? "ring-primary" : "ring-border"} hover-scale`}
            >
              <Avatar className="h-14 w-14">
                <AvatarImage src={it.avatar} alt={`${it.label} story`} />
                <AvatarFallback className="bg-muted text-muted-foreground">
                  {it.label.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {it.isNow && (
                <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs grid place-items-center shadow">
                  +
                </span>
              )}
            </div>
            <span className="mt-1 text-[10px] text-muted-foreground">{it.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeStoriesBar;
