
import React from "react";

/**
 * Modern, 3D OG Badge with glassy, glowing, wiggling effect.
 */
const OG3DBadge = () => {
  return (
    <div className="relative z-10 flex flex-col items-center group cursor-pointer animate-og-wobble">
      <div className="relative w-14 h-14 bg-gradient-to-br from-yellow-100 via-yellow-300 to-pink-100 rounded-full shadow-[0_4px_32px_0_rgba(253,216,53,0.14)] border-2 border-white/90 flex items-center justify-center overflow-visible">
        {/* Glass shine */}
        <span className="absolute left-3 top-2 w-7 h-4 bg-white/30 rounded-full blur-[2.5px] z-10 pointer-events-none" />
        {/* Bottom glow */}
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-7 h-3 bg-yellow-300/50 rounded-full blur-[6px] z-0 pointer-events-none" />
        {/* 3D OG Text w/shine */}
        <span className="relative z-10 font-black text-2xl text-yellow-600 drop-shadow-[0_4px_8px_rgba(245,191,0,0.16)]" style={{ letterSpacing: 3 }}>
          OG
        </span>
        {/* Sparkle accent side */}
        <span className="absolute right-0 top-2 w-2 h-2 bg-white rounded-full opacity-80 blur-[1px] animate-og-bounce" />
      </div>
      {/* Badge label */}
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-4 px-2 py-0.5 rounded-xl bg-[#FFF8E1] text-xs font-bold text-yellow-700 shadow-sm border border-yellow-200 animate-fade-in">
        OG
      </div>
      {/* 3D badge wobble */}
      <style>{`
        @keyframes og-wobble {
          0%, 100% { transform: translateY(0) rotate(-2deg);}
          10% { transform: translateY(-2px) rotate(1deg);}
          20% { transform: translateY(-3px) rotate(-4deg);}
          50% { transform: translateY(1px) rotate(3deg);}
          85% { transform: translateY(-2px) rotate(-1deg);}
        }
        .animate-og-wobble { animation: og-wobble 1.5s infinite; }
        @keyframes og-bounce {
          0%,100% {transform:translateY(0);}
          50% {transform:translateY(-3px);}
        }
        .animate-og-bounce { animation: og-bounce 1.4s infinite; }
      `}</style>
    </div>
  );
};

export default OG3DBadge;
