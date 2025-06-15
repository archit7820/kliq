
import React from "react";
import { Button } from "@/components/ui/button";
const OffsetPrompt = () => (
  <div className="flex flex-col items-center gap-2 mt-2 px-3 py-4 bg-lime-50 border border-lime-200 rounded-xl shadow-sm animate-fade-in">
    <span className="text-lg font-bold text-green-700">Offset your footprint</span>
    <p className="text-sm text-green-800 mb-2 text-center">Take an extra step for the planet. Offset this week's impact with one tap!</p>
    <Button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg ring-1 ring-green-700/10 active:scale-98 transition-transform duration-100">
      Offset Now
    </Button>
  </div>
);
export default OffsetPrompt;
