
import React from "react";
import { Button } from "@/components/ui/button";
const OFFSET_LINKS = [
  { href: "https://onetreeplanted.org/", title: "Plant a Tree" },
  { href: "https://www.cooleffect.org/", title: "Renewable Energy" },
  { href: "https://theoceancleanup.com/", title: "Ocean Cleanup" },
];

const OffsetPrompt = () => (
  <div className="flex flex-col items-center gap-3 mt-2 px-3 py-5 bg-lime-100/70 border border-lime-300 rounded-2xl shadow animate-fade-in">
    <span className="text-xl font-bold text-green-800 mb-1 text-center">Offset your footprint</span>
    <p className="text-[15px] text-green-900 text-center mb-3">Take an extra step for the planet. Offset this week's impact with one tap or try a verified project:</p>
    <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow ring-1 ring-green-700/10 active:scale-98 transition-transform duration-100 mb-1.5">
      Offset Now
    </Button>
    <div className="flex flex-col w-full gap-2 mt-1">
      {OFFSET_LINKS.map(link => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full text-sm font-semibold text-green-800 bg-white border border-green-200 hover:bg-green-100 px-4 py-2 rounded-lg text-center transition"
        >
          {link.title}
        </a>
      ))}
    </div>
  </div>
);
export default OffsetPrompt;
