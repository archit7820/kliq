
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
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Leaf className="w-5 h-5 text-green-600" />
          Category Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {sortedCategories.map(([category, value]) => (
            <div key={category} className="p-3 rounded-xl border bg-gradient-to-br from-muted/30 to-muted/10 hover:from-muted/40 hover:to-muted/20 transition-colors">
              <div className="text-sm font-medium capitalize mb-1 text-foreground">
                {category}
              </div>
              <div className="text-lg font-bold text-primary">
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
