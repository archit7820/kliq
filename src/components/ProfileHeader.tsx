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
    <div className="overflow-hidden border rounded-xl mb-6 animate-fade-in shadow-lg relative" style={{ background: "linear-gradient(180deg,#e0ffe6 0%,white 80%)" }}>
      {/* Hero header with BG shapes & glows */}
      <div className="bg-gradient-to-b from-green-100 to-white h-40 sm:h-48 relative flex justify-center items-end shadow-inner">
        {/* Glowing background blobs */}
        <div className="absolute top-3 left-6 w-14 h-14 bg-green-100 rounded-full blur-3xl opacity-60 animate-float" style={{ animationDuration: "3.1s" }}/>
        <div className="absolute top-8 right-10 w-10 h-10 bg-teal-100 rounded-full blur-2xl opacity-50 animate-float-slow" style={{ animationDuration: "4s" }}/>
        {/* Subtle sparkle */}
        <div className="absolute left-1/2 top-5 -translate-x-1/2 w-20 h-3 rounded-full bg-white/60 blur-2xl opacity-60"/>
        {/* Accent dot */}
        <div className="absolute bottom-1 right-6 w-4 h-4 bg-green-200 rounded-full blur-lg opacity-40 animate-pulse"/>
      </div>
      <div className="pt-0 pb-4 px-6 -mt-20 sm:-mt-24 flex flex-col items-center z-10 relative">
        <div className="flex flex-col items-center relative w-full">
          {/* Avatar and info row */}
          <div className="relative flex flex-col items-center">
            <div className="group">
              <img
                src={profile.avatar_url || ""}
                alt="avatar"
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 object-cover border-white ring-4 ring-green-400 shadow-xl transition-transform duration-200 group-hover:scale-105 animate-scale-in pulse"
                style={{ animation: "scale-in 0.5s, pulse 2s infinite" }}
              />
              {/* Fun shimmer on hover */}
              <span className="absolute right-3 top-3 w-6 h-6 pointer-events-none">
                <span className="block w-full h-full bg-white/25 rounded-full blur-[2px] animate-og-bounce"/>
              </span>
            </div>
            {/* Name and info button row */}
            <div className="flex gap-2 items-center mt-3 mb-2">
              <h2 className="text-3xl font-black flex items-center animate-fade-in tracking-wide drop-shadow-sm">{profile.full_name || `@${profile.username}`}</h2>
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
            className="mt-5 hover:scale-105 hover:bg-primary/10 hover:text-primary transition-all anime-button"
            onClick={() => setEditing(true)}
          >
            Edit Profile
          </Button>
        </div>

        {/* Stats cards section */}
        <div className="grid grid-cols-2 gap-6 mt-8 text-center w-full">
          <div className="p-7 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition select-none border-2 border-green-100 animate-scale-in hover:scale-105">
            <p className="font-bold text-3xl text-green-700 animate-fade-in">{activitiesCount}</p>
            <p className="text-base text-gray-500 mt-1">Activities</p>
          </div>
          <div className="p-7 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition select-none border-2 border-green-100 animate-scale-in hover:scale-105">
            <p className="font-bold text-3xl text-green-700 animate-fade-in">{kelpPoints}</p>
            <p className="text-base text-gray-500 mt-1">Kelp Points</p>
          </div>
        </div>
      </div>
      {/* BG micro-animations and fun effects */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0);}
          50% { transform: translateY(-12px);}
        }
        .animate-float { animation: float 2.3s ease-in-out infinite; }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0);}
          50% { transform: translateY(-8px);}
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
