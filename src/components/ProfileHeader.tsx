
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
      <div className="bg-primary/10 h-24 sm:h-32" />
      <div className="pt-0 p-6">
        <div className="flex flex-col items-center -mt-12 sm:-mt-16">
          {editing ? (
            <>
              <label className="relative group cursor-pointer">
                <img
                  src={editForm.avatar_url || ""}
                  alt="avatar"
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 object-cover border-background ring-2 ring-primary"
                />
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                <span className="absolute bottom-2 right-2 bg-primary text-white rounded-full p-1">
                  <Upload className="w-5 h-5" />
                </span>
                {avatarUploading && <LoaderCircle className="absolute w-5 h-5 animate-spin top-2 right-2 text-muted-foreground" />}
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
                    className={`px-3 py-1 rounded-full border ${editForm.lifestyle_tags.includes(tag) ? 'bg-green-300 text-green-900 font-semibold border-green-400' : 'bg-gray-100 text-gray-600 border-gray-200'} transition-all`}
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className="w-full flex justify-center mt-4">
                {!badgesLoading && badges && badges.length > 0 && (
                  <UserBadges badges={badges} />
                )}
              </div>
              <Button className="w-full mt-2" onClick={updateProfile}>Save Profile</Button>
              <Button variant="outline" className="w-full mt-2" onClick={() => setEditing(false)}>Cancel</Button>
              {errorMsg && (
                <div className="text-red-500 text-xs mt-2 text-center">{errorMsg}</div>
              )}
            </>
          ) : (
            <>
              <Avatar className="w-24 h-24 sm:w-32 sm:h-32 mb-2 border-4 border-background ring-2 ring-primary">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-4xl bg-secondary">
                  {profile.full_name?.charAt(0) || profile.username?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold mt-2 flex items-center gap-2">
                {profile.full_name || `@${profile.username}`}
              </h2>
              <p className="text-muted-foreground">{profile.username ? `@${profile.username}` : null}</p>
              <div className="w-full flex justify-center mt-2">
                {!badgesLoading && badges && badges.length > 0 && (
                  <UserBadges badges={badges} />
                )}
              </div>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => setEditing(true)}>
                Edit Profile
              </Button>
            </>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6 text-center">
          <div className="p-4 bg-secondary rounded-lg">
            <p className="font-bold text-2xl text-primary">{activitiesCount}</p>
            <p className="text-sm text-muted-foreground">Activities</p>
          </div>
          <div className="p-4 bg-secondary rounded-lg">
            <p className="font-bold text-2xl text-primary">{kelpPoints}</p>
            <p className="text-sm text-muted-foreground">Kelp Points</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
