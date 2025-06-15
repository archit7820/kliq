
import React from "react";
import BadgesInfoDialog from "./BadgesInfoDialog";
import { Info } from "lucide-react";

const ProfileInfoButton: React.FC = () => {
  // Open state for dialog
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button
        type="button"
        className="ml-1 rounded-full p-1 bg-white/90 hover:bg-gradient-to-tl hover:from-yellow-100 hover:to-green-200 border-2 border-green-300 shadow flex items-center justify-center transition hover:scale-110 active:scale-90 group relative"
        aria-label="Milestones and Badges Info"
        tabIndex={0}
        onClick={() => setOpen(true)}
      >
        <Info className="w-5 h-5 text-green-700 group-hover:text-yellow-600 transition" />
        {/* Fun floating dots */}
        <span className="absolute top-0 right-0 animate-ping w-1.5 h-1.5 rounded-full bg-green-400 opacity-80" />
        <span className="absolute top-1 left-1 animate-jump-x w-1 h-1 rounded-full bg-yellow-400" style={{ animationDuration: "2s" }} />
        <style>{`
          @keyframes jump-x {
            0%,100% { transform: translateY(0);}
            50% { transform: translateY(-4px);}
          }
          .animate-jump-x { animation: jump-x 1.5s infinite; }
        `}</style>
      </button>
      {open && (
        <BadgesInfoDialog open={open} onOpenChange={setOpen} />
      )}
    </>
  );
};

export default ProfileInfoButton;

