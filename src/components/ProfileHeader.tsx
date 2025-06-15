
import React, { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LoaderCircle, Upload, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import UserBadges from "@/components/UserBadges";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

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

const BADGE_INFO = [
  {
    name: "OG",
    description: "First 10,000 registered users!",
  },
  {
    name: "Eco Hero",
    description: "Earn 500+ kelp points",
  },
  {
    name: "CO₂e Saver",
    description: "Offset over 50kg CO₂e",
  },
  {
    name: "Streak Master",
    description: "7 day activity streak",
  },
  {
    name: "Challenge Champ",
    description: "Complete 3 team challenges",
  },
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
    <div className="overflow-hidden border rounded-xl mb-6 animate-fade-in shadow-lg" style={{ background: "linear-gradient(180deg,#e0ffe6 0%,white 80%)" }}>
      {/* Big colored hero header */}
      <div className="bg-green-100 h-32 sm:h-40 relative flex justify-center items-end">
        {/* Animated bubbles or shapes */}
        <div className="absolute top-4 left-8 w-8 h-8 bg-green-200 rounded-full blur animate-bounce" style={{ animationDuration: "2.2s" }} />
        <div className="absolute top-12 right-12 w-6 h-6 bg-teal-100 rounded-full blur animate-pulse" style={{ animationDuration: "3.1s" }} />
        {/* fun underline or highlight */}
      </div>
      <div className="pt-0 pb-4 px-6 -mt-16 sm:-mt-20 flex flex-col items-center z-10 relative">
        <div className="flex flex-col items-center relative w-full">
          {editing ? (
            <>
              {/* Avatar upload with hover pop and pulse */}
              <label className="relative group cursor-pointer">
                <img
                  src={editForm.avatar_url || ""}
                  alt="avatar"
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 object-cover border-white ring-4 ring-green-400 shadow-xl transition-transform duration-200 group-hover:scale-110 animate-scale-in pulse"
                  style={{ animation: "scale-in 0.5s, pulse 2s infinite" }}
                />
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                <span className="absolute bottom-2 right-2 bg-primary text-white rounded-full p-1 shadow hover:scale-110 transition">
                  <Upload className="w-5 h-5" />
                </span>
                {avatarUploading && (
                  <LoaderCircle className="absolute w-7 h-7 animate-spin top-2 right-2 text-muted-foreground" />
                )}
              </label>
              <Input
                className="mt-2"
                placeholder="Full name"
                value={editForm.full_name}
                onChange={e => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
              />
              <Input
                className="mt-2"
                placeholder="Username"
                value={editForm.username}
                onChange={e => setEditForm(prev => ({ ...prev, username: e.target.value.replace(/\W/g, '') }))}
              />
              <Input
                className="mt-2"
                placeholder="Location"
                value={editForm.location}
                onChange={e => setEditForm(prev => ({ ...prev, location: e.target.value }))}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {ALL_TAGS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    className={`px-3 py-1 rounded-full border shadow-sm hover:shadow-md focus:ring-2 ${editForm.lifestyle_tags.includes(tag) ? 'bg-green-300 text-green-900 font-semibold border-green-400' : 'bg-gray-100 text-gray-600 border-gray-200'} transition-all`}
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              {/* Badges w/ animated tooltip */}
              <div className="w-full flex justify-center mt-3 animate-fade-in">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger tabIndex={0} className="flex gap-2 items-center">
                      <span className="font-semibold text-sm">Your Badges</span>
                      <Info className="text-primary w-4 h-4 cursor-pointer hover:scale-125 transition-transform" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[280px]">
                      <div className="text-xs font-semibold mb-1">Badge Rules:</div>
                      <ul className="ml-2 list-disc text-xs">
                        {BADGE_INFO.map((b) => (
                          <li key={b.name}><b>{b.name}</b>: {b.description}</li>
                        ))}
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {!badgesLoading && displayBadges.length > 0 && (
                  <UserBadges badges={displayBadges} />
                )}
                {!badgesLoading && displayBadges.length === 0 && (
                  <div className="text-center text-xs text-gray-400 ml-2">No badges yet</div>
                )}
              </div>
              <Button className="w-full mt-2 hover:scale-105 transition-transform duration-150" onClick={updateProfile}>Save Profile</Button>
              <Button variant="outline" className="w-full mt-2 hover:scale-105 transition-transform duration-150" onClick={() => setEditing(false)}>Cancel</Button>
              {errorMsg && (
                <div className="text-red-500 text-xs mt-2 text-center">{errorMsg}</div>
              )}
            </>
          ) : (
            <>
              {/* Avatar with fun ring, bobble, and tooltip */}
              <div className="relative group animate-scale-in" style={{ animation: "scale-in 0.5s" }}>
                <Avatar className="w-28 h-28 sm:w-36 sm:h-36 mb-2 border-4 border-white ring-4 ring-green-400 shadow-xl transition-transform duration-200 group-hover:scale-110">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="text-4xl bg-secondary">
                    {profile.full_name?.charAt(0) || profile.username?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                {/* Animated "sparkle" or confetti on hover, just as an accent */}
                <span className="absolute -bottom-4 right-2 flex">
                  <span className="w-3 h-3 rounded-full bg-green-300 animate-pulse mr-1" />
                  <span className="w-2 h-2 rounded-full bg-teal-200 animate-bounce" />
                </span>
              </div>
              <div className="flex gap-2 items-center mt-2">
                <h2 className="text-3xl font-extrabold flex items-center animate-fade-in">{profile.full_name || `@${profile.username}`}</h2>
                {/* Info button for badges/milestones */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger tabIndex={0}>
                      <Info className="w-5 h-5 text-primary/90 hover:scale-125 transition-transform cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[280px]">
                      <span className="font-semibold text-xs">Milestones &amp; Badges T&amp;C:</span>
                      <ul className="list-disc ml-3 text-xs mt-2">
                        {BADGE_INFO.map((b) => (
                          <li key={b.name}>
                            <span className={b.name === "OG" ? "text-orange-600 font-bold" : ""}>{b.name}:</span> {b.description}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-2 text-[11px] text-gray-400">
                        * Badges auto-awarded. New badges coming soon!
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              {profile.username && (
                <p className="text-muted-foreground text-sm font-medium">@{profile.username}</p>
              )}
              {/* Badges section with fun pop + anims */}
              <div className="flex justify-center w-full mt-3 min-h-[44px]">
                {!badgesLoading && displayBadges.length > 0 ? (
                  <div className="flex flex-wrap gap-2 justify-center w-full animate-fade-in">
                    <UserBadges badges={displayBadges} />
                  </div>
                ) : (
                  <div className="text-center text-xs text-gray-400 animate-fade-in">No badges yet</div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 hover:scale-105 hover:bg-primary/10 hover:text-primary transition-all anime-button"
                onClick={() => setEditing(true)}
              >
                Edit Profile
              </Button>
            </>
          )}
        </div>
        {/* Stats section - rounded, animated cards */}
        <div className="grid grid-cols-2 gap-6 mt-8 text-center w-full">
          <div className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition select-none border-2 border-green-100 animate-scale-in hover:scale-105">
            <p className="font-bold text-3xl text-green-700 animate-fade-in">{activitiesCount}</p>
            <p className="text-base text-gray-500 mt-1">Activities</p>
          </div>
          <div className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition select-none border-2 border-green-100 animate-scale-in hover:scale-105">
            <p className="font-bold text-3xl text-green-700 animate-fade-in">{kelpPoints}</p>
            <p className="text-base text-gray-500 mt-1">Kelp Points</p>
          </div>
        </div>
      </div>
      {/* Animations keyframes for added fun */}
      <style>{`
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

