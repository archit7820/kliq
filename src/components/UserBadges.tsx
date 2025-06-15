
import React from "react";

type Badge = {
  id: string;
  name: string;
  description?: string;
  icon_url?: string;
  is_og_badge?: boolean;
};

const UserBadges: React.FC<{ badges: Badge[] }> = ({ badges }) => {
  if (!badges?.length) {
    return (
      <div className="text-center text-xs text-gray-400">No badges earned yet.</div>
    );
  }
  return (
    <div className="flex flex-wrap gap-3 items-center">
      {badges.map((badge) => (
        <div
          key={badge.id}
          className="flex flex-col items-center p-2 bg-blue-50 rounded-lg border shadow text-center"
          title={badge.description || badge.name}
        >
          {badge.icon_url && (
            <img src={badge.icon_url} alt={badge.name} className="w-8 h-8 mb-1" />
          )}
          <span className={"font-semibold text-xs mb-0.5" + (badge.is_og_badge ? " text-orange-600" : " text-blue-700")}>
            {badge.name}
          </span>
        </div>
      ))}
    </div>
  );
};

export default UserBadges;
