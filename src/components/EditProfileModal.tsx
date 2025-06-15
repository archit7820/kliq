
import React from "react";
import { Button } from "@/components/ui/button";

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  editForm: {
    full_name: string;
    username: string;
    location: string;
    lifestyle_tags: string[];
    avatar_url: string;
  };
  setEditForm: (fn: (curr: EditProfileModalProps["editForm"]) => EditProfileModalProps["editForm"]) => void;
  avatarUploading: boolean;
  handleAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleTagToggle: (tag: string) => void;
  errorMsg: string | null;
  onSave: () => void;
}

const TAGS = [
  "Vegetarian", "Vegan", "Cyclist", "Gardener", "Minimalist",
  "Composter", "Zero Waste", "Car Free", "Parent", "Techie",
  "Student", "Remote Worker"
];

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  open,
  onClose,
  editForm,
  setEditForm,
  avatarUploading,
  handleAvatarUpload,
  handleTagToggle,
  errorMsg,
  onSave
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
      <div
        className={`
          bg-white dark:bg-zinc-900 w-full sm:max-w-lg
          h-dvh max-h-dvh sm:h-auto sm:max-h-[90vh]
          rounded-t-2xl sm:rounded-xl shadow-2xl
          p-4 sm:p-8 relative flex flex-col
          overflow-y-auto
          transition-all
          sm:mt-0 mt-auto
        `}
        style={{
          minHeight: '55vh',
          maxHeight: '95vh'
        }}
      >
        <h2 className="text-2xl font-bold mb-4 sm:mb-6 text-center">Edit Profile</h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            onSave();
          }}
          className="space-y-4 pb-24" // extra padding bottom for actions
        >
          <div>
            <label className="block font-medium mb-1">Full Name</label>
            <input
              type="text"
              value={editForm.full_name}
              onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Username</label>
            <input
              type="text"
              value={editForm.username}
              onChange={e => setEditForm(f => ({ ...f, username: e.target.value }))}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Location</label>
            <input
              type="text"
              value={editForm.location}
              onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Lifestyle Tags</label>
            <div className="flex flex-wrap gap-2">
              {TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  className={`px-3 py-1 rounded-full border transition-colors text-xs ${editForm.lifestyle_tags.includes(tag)
                    ? 'bg-blue-100 border-blue-400 text-blue-900'
                    : 'bg-gray-100 border-gray-300 text-gray-600'
                  }`}
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1">Avatar</label>
            <div className="flex items-center gap-3">
              <img src={editForm.avatar_url || "/placeholder.svg"} alt="avatar" className="w-16 h-16 rounded-full border" />
              <label className="inline-block cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={avatarUploading}
                />
                <span className="inline-flex items-center gap-1 text-blue-600 hover:underline">
                  {avatarUploading ? "Uploading..." : "Change"}
                </span>
              </label>
            </div>
          </div>
          {errorMsg && <div className="text-red-500 text-sm">{errorMsg}</div>}
          <div className="h-10" />
        </form>
        {/* Bottom bar: sticky actions for mobile */}
        <div className="fixed left-0 right-0 bottom-0 sm:static sm:bg-transparent bg-white dark:bg-zinc-900 w-full flex justify-end gap-2 px-4 py-3 border-t sm:border-0 z-40">
          <Button
            variant="outline"
            type="button"
            onClick={onClose}
            disabled={avatarUploading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onSave}
            disabled={avatarUploading}
            className="flex-1"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
