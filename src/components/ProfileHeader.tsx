
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LoaderCircle, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import UserBadges from "@/components/UserBadges";

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
  return (
    <div className="overflow-hidden border rounded-xl mb-6">
      {/* Big colored hero header */}
      <div className="bg-green-100 h-32 sm:h-40 relative">
        {/* Optionally, could add floating confetti or shapes for fun here */}
      </div>
      <div className="pt-0 pb-3 px-6 -mt-16 sm:-mt-20 flex flex-col items-center">
        <div className="flex flex-col items-center">
          {editing ? (
            <>
              <label className="relative group cursor-pointer">
                <img
                  src={editForm.avatar_url || ""}
                  alt="avatar"
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 object-cover border-white ring-4 ring-green-400 shadow-xl transition-transform duration-200 group-hover:scale-105 animate-avatar-in"
                  style={{ animation: "fade-in 0.5s" }}
                />
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                <span className="absolute bottom-2 right-2 bg-primary text-white rounded-full p-1 shadow hover:scale-110 transition">
                  <Upload className="w-5 h-5" />
                </span>
                {avatarUploading && <LoaderCircle className="absolute w-7 h-7 animate-spin top-2 right-2 text-muted-foreground" />}
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
              <div className="w-full flex justify-center mt-4 animate-fade-in">
                {!badgesLoading && badges && badges.length > 0 && (
                  <UserBadges badges={badges} />
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
              {/* Avatar with fun ring + scale animation */}
              <div className="relative group">
                <Avatar className="w-28 h-28 sm:w-36 sm:h-36 mb-2 border-4 border-white ring-4 ring-green-400 shadow-xl transition-transform duration-200 group-hover:scale-105 animate-avatar-in" style={{ animation: "fade-in 0.5s" }}>
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="text-4xl bg-secondary">
                    {profile.full_name?.charAt(0) || profile.username?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
              <h2 className="text-3xl font-extrabold mt-2 flex items-center gap-2">
                {profile.full_name || `@${profile.username}`}
              </h2>
              {profile.username && (
                <p className="text-muted-foreground text-sm font-medium">@{profile.username}</p>
              )}
              {/* BADGES SECTION, more prominent, fun pop effect */}
              <div className="flex justify-center w-full mt-3">
                {!badgesLoading && badges && badges.length > 0 ? (
                  <div className="flex flex-wrap gap-2 justify-center w-full animate-fade-in">
                    {badges.map((badge: any) => (
                      <div
                        key={badge.id}
                        className={
                          "relative group bg-blue-50 border rounded-xl shadow p-1 px-2 flex items-center gap-1 hover:scale-110 transition-transform duration-150 cursor-pointer"
                        }
                        title={badge.description || badge.name}
                        tabIndex={0}
                        style={{ animation: "scale-in 0.3s" }}
                        aria-label={badge.name}
                      >
                        {badge.icon_url &&
                          <img src={badge.icon_url} alt={badge.name} className="w-7 h-7 rounded-full mr-1" />
                        }
                        <span className={`font-bold text-xs ${badge.is_og_badge ? "text-orange-600" : "text-blue-700"} transition-colors`}>
                          {badge.name}
                        </span>
                        {/* Tooltip on hover/focus */}
                        <span className="absolute left-1/2 -translate-x-1/2 -top-7 opacity-0 group-hover:opacity-100 pointer-events-none bg-black text-white text-xs rounded px-2 py-1 transition-opacity duration-150 z-20 whitespace-nowrap">
                          {badge.description || badge.name}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-xs text-gray-400">No badges yet</div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 hover:scale-105 hover:bg-primary/10 hover:text-primary transition-all"
                onClick={() => setEditing(true)}
              >
                Edit Profile
              </Button>
            </>
          )}
        </div>
        {/* Stats section */}
        <div className="grid grid-cols-2 gap-6 mt-8 text-center">
          <div className="p-6 bg-gray-50 rounded-2xl shadow hover:shadow-md transition select-none">
            <p className="font-bold text-3xl text-green-700 animate-fade-in">{activitiesCount}</p>
            <p className="text-base text-gray-500 mt-1">Activities</p>
          </div>
          <div className="p-6 bg-gray-50 rounded-2xl shadow hover:shadow-md transition select-none">
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
        .animate-avatar-in { animation: scale-in 0.5s cubic-bezier(0.22, 1, 0.36, 1); }
      `}</style>
    </div>
  );
};

export default ProfileHeader;
