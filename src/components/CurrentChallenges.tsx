
import React, { useState } from "react";
import { Trophy, Check, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockChallenges = [
  {
    id: 1,
    title: "Bike or Walk 3x This Week",
    description: "Choose biking or walking over driving at least 3 times.",
    reward: "+10 Kelp Points",
    joined: false,
    completed: false,
  },
  {
    id: 2,
    title: "Meatless Monday",
    description: "Eat plant-based all day next Monday.",
    reward: "+5 Kelp Points",
    joined: true,
    completed: true,
  },
];

export default function CurrentChallenges() {
  const [challenges, setChallenges] = useState(mockChallenges);

  const handleJoin = (id: number) => {
    setChallenges(chs =>
      chs.map(ch =>
        ch.id === id ? { ...ch, joined: true } : ch
      )
    );
  };

  const handleMarkComplete = (id: number) => {
    setChallenges(chs =>
      chs.map(ch =>
        ch.id === id ? { ...ch, completed: true } : ch
      )
    );
  };

  return (
    <section className="mt-4">
      <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
        <Trophy className="w-5 h-5 text-yellow-500" />
        Current Challenges
      </h2>
      <div className="flex flex-col gap-3">
        {challenges.map(ch => (
          <div
            key={ch.id}
            className={`bg-purple-50 border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between shadow group transition`}
          >
            <div>
              <div className="font-semibold text-purple-900">{ch.title}</div>
              <div className="text-xs text-purple-700 mb-2">{ch.description}</div>
              <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 font-mono text-[11px] px-2 py-0.5 rounded-full">
                <Activity className="w-3 h-3" /> Reward: {ch.reward}
              </span>
            </div>
            <div className="flex flex-row gap-2 items-center mt-2 md:mt-0">
              {!ch.joined && (
                <Button
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 font-semibold rounded-xl animate-fade-in"
                  onClick={() => handleJoin(ch.id)}
                >
                  Accept Challenge
                </Button>
              )}
              {ch.joined && !ch.completed && (
                <Button
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 font-semibold rounded-xl animate-fade-in"
                  onClick={() => handleMarkComplete(ch.id)}
                >
                  Mark as Completed <Check className="ml-1 w-4 h-4"/>
                </Button>
              )}
              {ch.completed && (
                <span className="inline-flex items-center text-green-700 text-sm font-semibold">
                  <Check className="w-5 h-5 mr-1" /> Completed!
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
