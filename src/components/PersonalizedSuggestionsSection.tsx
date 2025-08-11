
import React from "react";

const PersonalizedSuggestionsSection = ({ profile }: { profile: any }) => {
  return (
    <section className="glass-card p-4 rounded-2xl border animate-fade-in mb-4">
      <h3 className="font-semibold text-base text-foreground mb-1">For You</h3>
      {profile?.lifestyle_tags && profile.lifestyle_tags.length > 0 ? (
        <div>
          <p className="text-foreground/80 mb-2 sm:mb-3">
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
          <p className="text-muted-foreground text-xs">More personalized content coming soon!</p>
        </div>
      ) : (
        <p className="text-muted-foreground text-xs sm:text-sm">
          Complete your onboarding to get personalized suggestions!
        </p>
      )}
    </section>
  );
};

export default PersonalizedSuggestionsSection;

