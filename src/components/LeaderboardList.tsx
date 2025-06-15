
import React from "react";
import TopPodium from "./TopPodium";
import LeaderboardRowGamified from "./LeaderboardRowGamified";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";

type LeaderboardListProps = {
  leaderboard: any[];
  userId?: string;
};

const LeaderboardList: React.FC<LeaderboardListProps> = ({ leaderboard, userId }) => {
  const isMobile = useIsMobile();
  const podium = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  console.log("LeaderboardList - isMobile:", isMobile, "rest.length:", rest.length);

  return (
    <div className="py-2 w-full">
      <TopPodium podium={podium} userId={userId} />
      <div className="w-full text-center mb-2 font-semibold text-gray-500 text-sm tracking-widest">
        <span className="inline-block bg-green-200 rounded-full px-3 py-0.5 shadow animate-in animate-fade-in">Leaderboard</span>
      </div>
      
      {rest.length === 0 ? (
        <div className="py-6 text-center text-gray-400">No more players... join in!</div>
      ) : isMobile ? (
        // Mobile: Horizontal Carousel layout
        <div className="w-full px-4">
          <Carousel
            opts={{
              align: "start",
              loop: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2">
              {rest.map((profile, i) => (
                <CarouselItem key={profile.id} className="pl-2 basis-[280px] sm:basis-1/2">
                  <LeaderboardRowGamified
                    profile={profile}
                    rank={i + 3}
                    userId={userId}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            {rest.length > 1 && (
              <>
                <CarouselPrevious className="left-2 h-8 w-8 bg-white/90 shadow-lg" />
                <CarouselNext className="right-2 h-8 w-8 bg-white/90 shadow-lg" />
              </>
            )}
          </Carousel>
        </div>
      ) : (
        // Desktop: Traditional list layout
        <div className="space-y-1">
          {rest.map((profile, i) => (
            <LeaderboardRowGamified
              key={profile.id}
              profile={profile}
              rank={i + 3}
              userId={userId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaderboardList;
