
import React from "react";
import { Button } from "@/components/ui/button";

const PersonalizedSuggestionsSection = ({ profile }: { profile: any }) => {
  return (
    <section className="bg-card rounded-2xl p-4 shadow-sm border animate-fade-in" aria-label="Personalized suggestions">
      <h2 className="font-semibold text-lg text-foreground mb-3">For You</h2>
      {profile?.lifestyle_tags && profile.lifestyle_tags.length > 0 ? (
        <div>
          <p className="text-foreground/80 mb-3">
            Here are some suggestions based on your interests:
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {profile.lifestyle_tags.map((tag: string) => (
              <span 
                key={tag}
                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label={`Explore ${tag} content`}
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="text-muted-foreground text-sm">More personalized content coming soon!</p>
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-muted-foreground text-sm mb-2">
            Complete your onboarding to get personalized suggestions!
          </p>
          <Button variant="outline" size="sm">
            Complete Profile
          </Button>
        </div>
      )}
    </section>
  );
};

export default PersonalizedSuggestionsSection;

