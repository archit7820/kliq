
import React from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
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
  const isNetNegative = totalFootprint < 0;

  return (
    <Card className="w-full bg-white shadow-lg rounded-2xl border border-gray-200 overflow-hidden">
        <div className={`p-6 ${isNetNegative ? 'bg-gradient-to-br from-teal-50 to-green-100' : 'bg-gradient-to-br from-rose-50 to-orange-100'}`}>
            <div className="flex justify-between items-center mb-4">
                <CardTitle className="text-lg font-semibold text-gray-800">Carbon Balance</CardTitle>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${isNetNegative ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                    {isNetNegative ? 'Net Negative' : 'Net Positive'}
                </span>
            </div>
            <div className="text-center">
                <p className={`text-5xl font-bold ${isNetNegative ? 'text-green-600' : 'text-red-500'}`}>{Math.abs(totalFootprint).toFixed(2)}</p>
                <p className="text-sm font-medium text-gray-600">kg CO₂e</p>
                <p className="text-xs text-gray-500 mt-1">This month's balance</p>
            </div>
        </div>

      <CardContent className="p-4">
        <p className="text-sm font-semibold text-gray-700 mb-3 text-center">Breakdown by Category</p>
        <div className="grid grid-cols-3 gap-3">
          {data && data.length > 0 ? (
            data.sort((a,b) => b.total_carbon - a.total_carbon).map(({ category, total_carbon }) => {
              const Icon = categoryIcons[category] || HelpCircle;
              const colors = categoryColors[category] || categoryColors.Other;
              return (
                <div key={category} className={`p-3 rounded-xl flex flex-col items-center justify-center text-center ${colors}`}>
                  <Icon className="w-6 h-6 mb-1.5" />
                  <p className="font-semibold text-sm">{category}</p>
                  <p className="text-xs font-medium">{total_carbon.toFixed(1)} kg</p>
                </div>
              );
            })
          ) : (
            <p className="col-span-3 text-center text-sm text-gray-500 py-4">Log an activity to see your breakdown.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CarbonOverview;

