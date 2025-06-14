
import React from "react";
import { Button } from "@/components/ui/button";

const OffsetPrompt = () => (
  <div className="flex flex-col items-center gap-2 mt-2 px-4 py-4 bg-lime-100 border border-lime-200 rounded-xl shadow-sm">
    <span className="text-lg font-bold text-lime-700">Offset your footprint</span>
    <p className="text-sm text-lime-800 mb-2 text-center">Take an extra step for the planet. Offset this week's impact with one tap!</p>
    <Button className="w-full bg-lime-600 hover:bg-lime-700 text-white font-bold rounded">Offset Now</Button>
  </div>
);

export default OffsetPrompt;
