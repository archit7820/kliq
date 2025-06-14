
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plane, Utensils, Home, ShoppingCart, Bolt, HelpCircle } from 'lucide-react';

const categoryIcons: { [key: string]: React.ElementType } = {
  Travel: Plane,
  Food: Utensils,
  Home: Home,
  Shopping: ShoppingCart,
  Utilities: Bolt,
  Other: HelpCircle,
};

const categoryColors: { [key: string]: string } = {
    Travel: 'bg-blue-100 text-blue-800',
    Food: 'bg-orange-100 text-orange-800',
    Home: 'bg-green-100 text-green-800',
    Shopping: 'bg-purple-100 text-purple-800',
    Utilities: 'bg-yellow-100 text-yellow-800',
    Other: 'bg-gray-100 text-gray-800',
};


interface CarbonOverviewProps {
  data: { category: string; total_carbon: number }[];
}

const CarbonOverview: React.FC<CarbonOverviewProps> = ({ data }) => {
  const totalFootprint = data.reduce((sum, item) => sum + item.total_carbon, 0);

  return (
    <Card className="w-full bg-white shadow-lg rounded-2xl border border-gray-200">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-lg font-semibold text-gray-800">Your Footprint</CardTitle>
                <p className="text-xs text-gray-500">Total emissions this month</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalFootprint.toFixed(2)}</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {data.sort((a,b) => b.total_carbon - a.total_carbon).map(({ category, total_carbon }) => {
            const Icon = categoryIcons[category] || HelpCircle;
            const colors = categoryColors[category] || categoryColors.Other;
            return (
              <div key={category} className={`p-3 rounded-xl flex flex-col items-center justify-center text-center ${colors}`}>
                <Icon className="w-6 h-6 mb-1.5" />
                <p className="font-semibold text-sm">{category}</p>
                <p className="text-xs font-medium">{total_carbon.toFixed(1)} kg</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default CarbonOverview;
