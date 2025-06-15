
import React from "react";

const PersonalizedSuggestionsSection = ({ profile }: { profile: any }) => {
  return (
    <section className="bg-white p-4 rounded-2xl shadow animate-fade-in mb-4 relative overflow-hidden">
      <div className="absolute right-3 top-2 text-3xl animate-bounce select-none pointer-events-none">
        ✨
      </div>
      <h3 className="font-semibold text-lg mb-2 text-violet-900 flex items-center gap-2">
        For You
        <span className="text-2xl -ml-1">🌱</span>
      </h3>
      {profile?.lifestyle_tags && profile.lifestyle_tags.length > 0 ? (
        <div>
          <p className="text-gray-700 mb-2 sm:mb-3">
            Here are some suggestions based on your interests:
            <span className="block my-1 font-semibold text-violet-700">
              {profile.lifestyle_tags.map((tag: string, i: number) => (
                <span key={tag}>
                  <span className="hover:underline cursor-pointer transition-all animate-fade-in">{tag}</span>
                  {i !== profile.lifestyle_tags.length - 1 && ", "}
                </span>
              ))}
            </span>
          </p>
          <p className="text-gray-400 text-xs">More personalized content coming soon!</p>
        </div>
      ) : (
        <p className="text-gray-400 text-xs sm:text-sm">
          Complete your onboarding to get personalized suggestions!
        </p>
      )}
    </section>
  );
};

export default PersonalizedSuggestionsSection;

