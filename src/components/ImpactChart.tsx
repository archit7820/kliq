
import React from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Props: data, chartType, xKey, yKey
type ChartType = "area" | "bar" | "line";
type ImpactChartProps = {
  data: any[];
  chartType: ChartType;
  xKey: string;
  yKey: string;
};

const ImpactChart: React.FC<ImpactChartProps> = ({ data, chartType, xKey, yKey }) => {
  if (chartType === "area") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="10%" stopColor="#22d3ee" stopOpacity={0.8}/>
              <stop offset="90%" stopColor="#bbf7d0" stopOpacity={0.2}/>
            </linearGradient>
          </defs>
          <XAxis dataKey={xKey}/>
          <YAxis tickFormatter={v => `${v}kg`} width={40}/>
          <CartesianGrid strokeDasharray="3 3"/>
          <ChartTooltip/>
          <Area type="monotone" dataKey={yKey} name="CO₂e Saved" stroke="#10B981" fill="url(#colorSavings)" strokeWidth={3} />
          <Legend/>
        </AreaChart>
      </ResponsiveContainer>
    );
  }
  if (chartType === "bar") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey={xKey}/>
          <YAxis tickFormatter={v => `${v}kg`} width={40}/>
          <CartesianGrid strokeDasharray="3 3" />
          <ChartTooltip/>
          <Bar dataKey={yKey} name="CO₂e Saved" fill="#10B981" radius={[4, 4, 0, 0]}/>
          <Legend/>
        </BarChart>
      </ResponsiveContainer>
    );
  }
  // Default to line chart
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <XAxis dataKey={xKey}/>
        <YAxis tickFormatter={v => `${v}kg`} width={40}/>
        <CartesianGrid strokeDasharray="3 3" />
        <ChartTooltip/>
        <Line type="monotone" dataKey={yKey} name="CO₂e Saved" stroke="#38bdf8" strokeWidth={3} dot={{ stroke: "#10B981", strokeWidth: 2 }} />
        <Legend/>
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ImpactChart;
