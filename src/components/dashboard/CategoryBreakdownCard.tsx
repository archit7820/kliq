
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Leaf } from "lucide-react";

interface CategoryBreakdownCardProps {
  breakdown: Record<string, number>;
}

const CategoryBreakdownCard: React.FC<CategoryBreakdownCardProps> = ({ breakdown }) => {
  if (!breakdown || Object.keys(breakdown).length === 0) {
    return null;
  }

  // Sort categories by impact (highest first)
  const sortedCategories = Object.entries(breakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6); // Show top 6 categories on mobile

  return (
    <Card>
      <CardHeader className="pb-3 p-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Leaf className="w-4 h-4 text-green-600" />
          Category Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="grid grid-cols-2 gap-2">
          {sortedCategories.map(([category, value]) => (
            <div key={category} className="p-2 rounded-lg border bg-gradient-to-br from-muted/30 to-muted/10 hover:from-muted/40 hover:to-muted/20 transition-colors">
              <div className="text-xs font-medium capitalize mb-1 text-foreground">
                {category}
              </div>
              <div className="text-sm font-bold text-primary">
                {typeof value === 'number' ? value.toFixed(1) : value} kg
              </div>
              <div className="text-xs text-muted-foreground">CO₂e saved</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryBreakdownCard;
