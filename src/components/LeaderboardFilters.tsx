import React from "react";
import { Button } from "@/components/ui/button";

interface LeaderboardFiltersProps {
  scope: "global" | "national" | "local" | "friends";
  onScopeChange: (scope: "global" | "national" | "local" | "friends") => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CATEGORIES = ["All", "Cycling", "Thrift", "Food", "Travel", "Energy", "Transit"];

const LeaderboardFilters: React.FC<LeaderboardFiltersProps> = ({
  scope,
  onScopeChange,
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <div className="w-full space-y-2">
      {/* Scope filter */}
      <div className="rounded-full border bg-card/60 p-1 flex items-center gap-1 shadow">
        {(["global", "national", "local", "friends"] as const).map((s) => (
          <Button
            key={s}
            size="sm"
            variant={scope === s ? "default" : "ghost"}
            className={`rounded-full px-3 py-1 h-8 ${scope === s ? "shadow" : ""}`}
            onClick={() => onScopeChange(s)}
          >
            {s === "global" && "Global"}
            {s === "national" && "National"}
            {s === "local" && "Local"}
            {s === "friends" && "Friends"}
          </Button>
        ))}
      </div>

      {/* Category chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {CATEGORIES.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1 rounded-full text-sm border whitespace-nowrap transition ${
                active
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
              aria-pressed={active}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LeaderboardFilters;
