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
    <div className="w-full space-y-4">
      {/* Scope filter */}
      <div>
        <label className="block text-sm font-medium mb-2" id="scope-filter-label">
          Filter by Scope
        </label>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby="scope-filter-label">
          {(["global", "national", "local", "friends"] as const).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={scope === s ? "default" : "outline"}
              className={`transition-all ${scope === s ? "shadow-md" : ""}`}
              onClick={() => onScopeChange(s)}
              role="radio"
              aria-checked={scope === s}
              aria-label={`Filter by ${s} leaderboard`}
            >
              {s === "global" && "🌍 Global"}
              {s === "national" && "🏛️ National"}
              {s === "local" && "📍 Local"}
              {s === "friends" && "👥 Friends"}
            </Button>
          ))}
        </div>
      </div>

      {/* Category filter */}
      <div>
        <label className="block text-sm font-medium mb-2" id="category-filter-label">
          Filter by Category
        </label>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby="category-filter-label">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`px-3 py-1.5 rounded-md text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  active
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background border-border text-foreground hover:bg-muted hover:border-muted-foreground"
                }`}
                role="radio"
                aria-checked={active}
                aria-label={`Filter by ${cat} category`}
              >
                {cat === "All" && "🌟 "}
                {cat === "Cycling" && "🚴 "}
                {cat === "Thrift" && "♻️ "}
                {cat === "Food" && "🥗 "}
                {cat === "Travel" && "✈️ "}
                {cat === "Energy" && "⚡ "}
                {cat === "Transit" && "🚇 "}
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardFilters;
