
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

interface ImpactVisualizationCardProps {
  tab: string;
  setTab: (tab: string) => void;
  chartData: any[];
  chartType: string;
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
      <CardHeader className="pb-4">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <CardTitle className="text-lg font-semibold">Impact Visualization</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateInsights}
            disabled={loadingInsight}
            className="self-start md:self-auto"
          >
            {loadingInsight ? "Generating..." : "Generate AI Insights"}
          </Button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabOptions.map(opt => (
            <Button
              key={opt.value}
              variant={tab === opt.value ? "default" : "outline"}
              size="sm"
              onClick={() => setTab(opt.value)}
              className="flex items-center gap-2 flex-shrink-0"
            >
              <opt.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{opt.label}</span>
              <span className="sm:hidden">{opt.label.charAt(0)}</span>
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full h-64 md:h-72">
          <ImpactChart data={chartData} chartType={chartType} xKey={xKey} yKey={yKey}/>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImpactVisualizationCard;
