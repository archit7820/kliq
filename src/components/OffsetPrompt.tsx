
import React from "react";
import { Button } from "@/components/ui/button";
const OFFSET_LINKS = [
  { href: "https://onetreeplanted.org/", title: "Plant a Tree 🌳" },
  { href: "https://theoceancleanup.com/donate/", title: "Ocean Cleanup 🌊" },
  { href: "https://www.cooleffect.org/", title: "Renewable Energy ⚡" },
];

const OffsetPrompt = () => (
  <div className="flex flex-col items-center gap-3 mt-2 px-4 py-6 bg-gradient-to-b from-green-50 via-lime-100 to-white border border-green-200 rounded-2xl shadow animate-fade-in w-full">
    <span className="text-xl font-bold text-lime-900 mb-1 text-center tracking-tight">
      Offset your footprint
    </span>
    <p className="text-[15px] text-green-900 text-center mb-3 px-2">
      Take an extra step for the planet. Offset this week's impact with one tap<br />
      or try a verified public project:
    </p>
    <Button className="w-full bg-gradient-to-r from-lime-500 via-green-600 to-emerald-500 hover:from-green-500 hover:to-lime-600 text-white font-bold rounded-xl shadow ring-2 ring-green-300/20 active:scale-98 transition-transform duration-100 mb-1.5 text-lg py-3">
      Offset Now
    </Button>
    <div className="flex flex-col w-full gap-2 mt-1">
      {OFFSET_LINKS.map(link => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full text-xs md:text-sm font-semibold text-green-800 bg-white border border-green-200 hover:bg-lime-100 px-4 py-2 rounded-lg text-center transition"
        >
          {link.title}
        </a>
      ))}
    </div>
  </div>
);

export default OffsetPrompt;
