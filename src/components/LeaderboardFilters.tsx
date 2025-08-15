
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
    <div className="w-full space-y-3">
      {/* Mobile-First Scope Filter */}
      <div>
        <label className="block text-xs font-medium mb-2 text-muted-foreground" id="scope-filter-label">
          Filter by Scope
        </label>
        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-labelledby="scope-filter-label">
          {(["global", "national", "local", "friends"] as const).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={scope === s ? "default" : "outline"}
              className={`transition-all text-xs h-7 px-2 ${scope === s ? "shadow-sm" : ""}`}
              onClick={() => onScopeChange(s)}
              role="radio"
              aria-checked={scope === s}
              aria-label={`Filter by ${s} leaderboard`}
            >
              <span className="flex items-center gap-1">
                {s === "global" && (
                  <>
                    <span className="text-xs">🌍</span>
                    <span className="hidden xs:inline">Global</span>
                  </>
                )}
                {s === "national" && (
                  <>
                    <span className="text-xs">🏛️</span>
                    <span className="hidden xs:inline">National</span>
                  </>
                )}
                {s === "local" && (
                  <>
                    <span className="text-xs">📍</span>
                    <span className="hidden xs:inline">Local</span>
                  </>
                )}
                {s === "friends" && (
                  <>
                    <span className="text-xs">👥</span>
                    <span className="hidden xs:inline">Friends</span>
                  </>
                )}
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Mobile-First Category Filter */}
      <div>
        <label className="block text-xs font-medium mb-2 text-muted-foreground" id="category-filter-label">
          Filter by Category
        </label>
        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-labelledby="category-filter-label">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`px-2 py-1 rounded-md text-xs border transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 touch-manipulation ${
                  active
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background border-border text-foreground hover:bg-muted hover:border-muted-foreground"
                }`}
                role="radio"
                aria-checked={active}
                aria-label={`Filter by ${cat} category`}
              >
                <span className="flex items-center gap-1">
                  {cat === "All" && "🌟"}
                  {cat === "Cycling" && "🚴"}
                  {cat === "Thrift" && "♻️"}
                  {cat === "Food" && "🥗"}
                  {cat === "Travel" && "✈️"}
                  {cat === "Energy" && "⚡"}
                  {cat === "Transit" && "🚇"}
                  <span className="hidden xs:inline">{cat}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardFilters;
