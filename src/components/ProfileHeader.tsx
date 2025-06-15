
import React, { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LoaderCircle, Upload, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import UserBadges from "@/components/UserBadges";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import BadgesInfoDialog, { BADGE_INFO } from "@/components/BadgesInfoDialog";
import OG3DBadge from "./OG3DBadge";
import ProfileInfoButton from "./ProfileInfoButton";

// Accent color definitions
const SEA_GREEN = "#2ec4b6";
const SEA_GREEN_LIGHT = "#cff9f5";
const RED = "#ff647c";
const BLUE = "#62b6ff";
const BLUE_SOFT = "#e7f4fd";
const BLUE_MED = "#b8e0ff";

type ProfileHeaderProps = {
  profile: {
    avatar_url?: string | null;
    full_name?: string | null;
    username?: string | null;
    location?: string | null;
    lifestyle_tags?: string[] | null;
    kelp_points?: number | null;
  };
  badges: any[];
  badgesLoading: boolean;
  activitiesCount: number;
  kelpPoints: number;
  editing: boolean;
  editForm: {
    full_name: string;
    username: string;
    location: string;
    lifestyle_tags: string[];
    avatar_url: string;
  };
  avatarUploading: boolean;
  errorMsg: string | null;
  setEditing: (e: boolean) => void;
  updateProfile: () => void;
  setEditForm: React.Dispatch<React.SetStateAction<{
    full_name: string;
    username: string;
    location: string;
    lifestyle_tags: string[];
    avatar_url: string;
  }>>;
  handleTagToggle: (tag: string) => void;
  handleAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const ALL_TAGS = [
  "Vegetarian", "Vegan", "Cyclist", "Gardener", "Minimalist", "Composter",
  "Zero Waste", "Car Free", "Parent", "Techie", "Student", "Remote Worker"
];

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  badges,
  badgesLoading,
  activitiesCount,
  kelpPoints,
  editing,
  editForm,
  avatarUploading,
  errorMsg,
  setEditing,
  updateProfile,
  setEditForm,
  handleTagToggle,
  handleAvatarUpload,
}) => {
  // If no badges exist but user qualifies for "OG" locally, show it!
  const displayBadges = useMemo(() => {
    if (badges && badges.length > 0) return badges;
    // Fallback: show "OG" if very first user
    if (profile && profile.username && profile.username.includes("@") && !badgesLoading) {
      // crude: if user is among first 10,000, or username/email was used to seed OG badge
      return [{
        id: "og-fallback",
        name: "OG",
        description: "First 10,000 registered users!",
        icon_url: "https://cdn-icons-png.flaticon.com/512/3774/3774299.png",
        is_og_badge: true
      }];
    }
    return [];
  }, [badges, profile, badgesLoading]);

  return (
    <div
      className="overflow-hidden border rounded-xl mb-6 animate-fade-in shadow-xl relative"
      style={{
        background:
          "linear-gradient(135deg, #e7f4fd 0%, #fff 36%, #cff9f5 98%)", // white/blue/sea green
        borderColor: "rgba(46,196,182,0.22)", // subtle sea green border
      }}
    >
      {/* Hero header with BG shapes & glows */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-[#cff9f5] h-44 sm:h-56 relative flex justify-center items-end shadow-inner">
        {/* Glowing background blobs updated: blue, sea green */}
        <div className="absolute top-2 left-6 w-16 h-16 bg-blue-100 rounded-full blur-3xl opacity-75 animate-float" style={{ animationDuration: "2.7s" }} />
        <div className="absolute top-8 right-10 w-12 h-12" style={{
          background: "radial-gradient(circle, #ffbdbd 60%, transparent 100%)",
          borderRadius: "100%",
          filter: "blur(12px)",
          opacity: 0.56,
          animation: "float-slow 3.8s infinite",
        }} />
        {/* Subtle sparkle */}
        <div className="absolute left-1/2 top-6 -translate-x-1/2 w-24 h-4 rounded-full bg-white/90 blur-2xl opacity-70"/>
        {/* Accent dot blue */}
        <div className="absolute bottom-3 right-7 w-5 h-5 bg-[#cff9f5] rounded-full blur-lg opacity-75 animate-pulse"/>
      </div>
      <div className="pt-0 pb-4 px-6 -mt-20 sm:-mt-28 flex flex-col items-center z-10 relative">
        <div className="flex flex-col items-center relative w-full">
          {/* Avatar and info row */}
          <div className="relative flex flex-col items-center">
            <div className="group">
              <img
                src={profile.avatar_url || ""}
                alt="avatar"
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 object-cover border-white ring-4"
                style={{
                  borderColor: "#fff",
                  boxShadow: `0 0 0 6px #62b6ff55, 0 0 0 12px #2ec4b655`, // blue/sea green subtle double ring
                  animation: "scale-in 0.5s, pulse 2s infinite"
                }}
              />
              {/* Fun shimmer on hover */}
              <span className="absolute right-3 top-3 w-6 h-6 pointer-events-none">
                <span className="block w-full h-full bg-white/25 rounded-full blur-[2px] animate-og-bounce"/>
              </span>
            </div>
            {/* Name and info button row */}
            <div className="flex gap-2 items-center mt-3 mb-2">
              <h2 className="text-3xl font-black flex items-center animate-fade-in tracking-wider drop-shadow-md text-blue-900">
                {profile.full_name || `@${profile.username}`}
              </h2>
              <ProfileInfoButton />
            </div>
            {profile.username && (
              <p className="text-muted-foreground text-sm font-semibold">@{profile.username}</p>
            )}
            {/* Badge row */}
            <div className="flex justify-center w-full mt-2 min-h-[54px]">
              {!badgesLoading && displayBadges.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center w-full">
                  {displayBadges.map(badge =>
                    badge.name === "OG"
                      ? <OG3DBadge key="ogbadge" />
                      : <UserBadges badges={[badge]} key={badge.id} />
                  )}
                </div>
              )}
              {!badgesLoading && displayBadges.length === 0 && (
                <div className="text-center text-xs text-gray-400 ml-2">No badges yet</div>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-5 hover:scale-105 border-blue-200 bg-white/80 hover:bg-blue-50 text-blue-900 font-medium transition-all anime-button"
            onClick={() => setEditing(true)}
            style={{
              boxShadow: "0 1px 6px 0 #e7f4fd", // blue shadow
              borderColor: "#b8e0ff"
            }}
          >
            Edit Profile
          </Button>
        </div>

        {/* Stats cards section */}
        <div className="grid grid-cols-2 gap-6 mt-8 text-center w-full">
          <div className="p-7 bg-gradient-to-b from-white via-blue-50 to-[#cff9f5] rounded-2xl shadow-lg hover:shadow-xl border-2 border-blue-100 animate-scale-in hover:scale-105 transition select-none"
              style={{
                boxShadow: "0 2px 18px -6px #62b6ff22, 0 1px 12px -2px #2ec4b622",
                borderColor: "#b8e0ff"
              }}
            >
            <p className="font-extrabold text-3xl text-[#1f3b75] animate-fade-in drop-shadow"> {activitiesCount}</p>
            <p className="text-base text-blue-900 mt-1">Activities</p>
          </div>
          <div className="p-7 bg-gradient-to-b from-white via-[#cff9f5] to-blue-50 rounded-2xl shadow-lg hover:shadow-xl border-2 border-[#2ec4b6]/30 animate-scale-in hover:scale-105 transition select-none"
              style={{
                boxShadow: "0 2px 18px -6px #62b6ff22, 0 1px 12px -2px #2ec4b622",
                borderColor: "#2ec4b6"
              }}
            >
            <p className="font-extrabold text-3xl text-[#2ec4b6] animate-fade-in drop-shadow"> {kelpPoints}</p>
            <p className="text-base text-[#01796f] mt-1">Kelp Points</p>
          </div>
        </div>
      </div>
      {/* BG micro-animations and fun effects */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0);}
          50% { transform: translateY(-15px);}
        }
        .animate-float { animation: float 2.3s ease-in-out infinite; }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0);}
          50% { transform: translateY(-10px);}
        }
        .animate-float-slow { animation: float-slow 4s ease-in-out infinite; }
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(10px);}
          100% { opacity: 1; transform: translateY(0);}
        }
        .animate-fade-in { animation: fade-in 0.65s cubic-bezier(0.22, 1, 0.36, 1); }
        @keyframes scale-in {
          0% { transform: scale(0.85); opacity: 0;}
          100% { transform: scale(1); opacity: 1;}
        }
        .animate-scale-in { animation: scale-in 0.5s cubic-bezier(0.22, 1, 0.36, 1); }
        .pulse { animation: pulse 2.6s cubic-bezier(0.66,0,0,1) infinite alternate;}
        .anime-button:active { animation: scale-in 0.2s;}
      `}</style>
    </div>
  );
};

export default ProfileHeader;
