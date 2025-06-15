
import React from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

type EcoInsightsListProps = {
  insights: { id: string; insight: string; created_at: string }[];
};

const EcoInsightsList: React.FC<EcoInsightsListProps> = ({ insights }) => (
  <Card className="mb-6">
    <div className="bg-gradient-to-r from-green-50 to-yellow-50 p-4 border-b">
      <CardTitle className="text-lg flex items-center gap-2">
        🌱 Eco Insights
      </CardTitle>
    </div>
    <CardContent className="p-4">
      {insights.length === 0 && (
        <div className="text-gray-400 text-sm">
          No eco insights yet. Log an activity or join challenges to get tips!
        </div>
      )}
      <ul>
        {insights.map(i =>
          <li key={i.id} className="mb-1 text-green-700 font-medium">
            {i.insight}
            <span className="block text-xs text-gray-400">{new Date(i.created_at).toLocaleDateString()}</span>
          </li>
        )}
      </ul>
    </CardContent>
  </Card>
);

export default EcoInsightsList;
