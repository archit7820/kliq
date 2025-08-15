
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ImpactChart from "../ImpactChart";
import { Calendar, BarChart3, TrendingUp } from "lucide-react";

const tabOptions = [
  { value: "week", label: "Week", icon: Calendar },
  { value: "month", label: "Month", icon: BarChart3 },
  { value: "year", label: "Year", icon: TrendingUp }
];

type ChartType = "area" | "bar" | "line";

interface ImpactVisualizationCardProps {
  tab: string;
  setTab: (tab: string) => void;
  chartData: any[];
  chartType: ChartType;
  xKey: string;
  yKey: string;
  handleGenerateInsights: () => void;
  loadingInsight: boolean;
}

const ImpactVisualizationCard: React.FC<ImpactVisualizationCardProps> = ({
  tab,
  setTab,
  chartData,
  chartType,
  xKey,
  yKey,
  handleGenerateInsights,
  loadingInsight
}) => {
  return (
    <Card>
      <CardHeader className="pb-3 p-3">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Impact Visualization</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateInsights}
              disabled={loadingInsight}
              className="text-xs px-2 py-1"
            >
              {loadingInsight ? "Generating..." : "Generate AI Insights"}
            </Button>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {tabOptions.map(opt => (
              <Button
                key={opt.value}
                variant={tab === opt.value ? "default" : "outline"}
                size="sm"
                onClick={() => setTab(opt.value)}
                className="flex items-center gap-1 flex-shrink-0 text-xs px-2 py-1"
              >
                <opt.icon className="w-3 h-3" />
                <span className="hidden xs:inline">{opt.label}</span>
                <span className="xs:hidden">{opt.label.charAt(0)}</span>
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="w-full h-48">
          <ImpactChart data={chartData} chartType={chartType} xKey={xKey} yKey={yKey}/>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImpactVisualizationCard;
