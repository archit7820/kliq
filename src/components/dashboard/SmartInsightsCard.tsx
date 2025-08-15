
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Info, Lightbulb } from "lucide-react";

interface SmartInsightsCardProps {
  insights: string;
}

const SmartInsightsCard: React.FC<SmartInsightsCardProps> = ({ insights }) => {
  return (
    <Card className="border-2 border-blue-200/50 bg-gradient-to-br from-blue-50/50 to-cyan-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="p-1.5 bg-blue-200/50 rounded-full">
            <Lightbulb className="w-4 h-4 text-blue-600" />
          </div>
          Smart Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3">
          <div className="flex-shrink-0 mt-1">
            <Info className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-sm text-blue-800 leading-relaxed">
            {insights}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartInsightsCard;
