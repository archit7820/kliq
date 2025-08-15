
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Info, Lightbulb } from "lucide-react";

interface SmartInsightsCardProps {
  insights: string;
}

const SmartInsightsCard: React.FC<SmartInsightsCardProps> = ({ insights }) => {
  return (
    <Card className="border border-blue-200/50 bg-gradient-to-br from-blue-50/50 to-cyan-50/50">
      <CardHeader className="pb-2 p-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="p-1 bg-blue-200/50 rounded-full">
            <Lightbulb className="w-3 h-3 text-blue-600" />
          </div>
          Smart Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="flex gap-2">
          <div className="flex-shrink-0 mt-0.5">
            <Info className="w-3 h-3 text-blue-500" />
          </div>
          <p className="text-xs text-blue-800 leading-relaxed">
            {insights}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartInsightsCard;
