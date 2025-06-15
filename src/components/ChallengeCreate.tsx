
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuthStatus } from "@/hooks/useAuthStatus";

const ChallengeCreate = () => {
  const { user } = useAuthStatus();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reward, setReward] = useState(0);
  const [audienceScope, setAudienceScope] = useState("world");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("You must be logged in");
      const { error } = await supabase.from("challenges").insert({
        title,
        description,
        reward_kelp_points: reward,
        audience_scope: audienceScope,
        created_by: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setTitle("");
      setDescription("");
      setReward(0);
      setAudienceScope("world");
      setError("");
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
    },
    onError: (err: any) => {
      setError(err.message || "Failed to create challenge");
    },
  });

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg px-8 py-8 space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-green-900 mb-2">Create a Challenge</h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="space-y-5"
        >
          <div>
            <Label htmlFor="challenge-title">Title</Label>
            <Input
              id="challenge-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Walk 5,000 steps"
              required
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">Give your challenge an inspiring, action-oriented title.</p>
          </div>
          <div>
            <Label htmlFor="challenge-description">Description</Label>
            <Textarea
              id="challenge-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe what participants need to do, rules, or extra info."
              className="mt-1 min-h-[60px]"
            />
          </div>
          <div>
            <Label htmlFor="challenge-reward">Kelp Points Reward</Label>
            <Input
              id="challenge-reward"
              type="number"
              value={reward}
              onChange={e => setReward(Number(e.target.value))}
              placeholder="Reward amount"
              min={0}
              className="mt-1 max-w-[130px]"
            />
            <p className="text-xs text-muted-foreground mt-1">Suggest how many points this challenge is worth.</p>
          </div>
          <div>
            <Label className="mb-1">Who can participate?</Label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="audienceScope"
                  value="world"
                  checked={audienceScope === "world"}
                  onChange={() => setAudienceScope("world")}
                  className="accent-green-700 h-4 w-4"
                />
                <span className="text-sm">Everyone</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="audienceScope"
                  value="community"
                  checked={audienceScope === "community"}
                  onChange={() => setAudienceScope("community")}
                  className="accent-yellow-600 h-4 w-4"
                />
                <span className="text-sm">Community</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="audienceScope"
                  value="friends"
                  checked={audienceScope === "friends"}
                  onChange={() => setAudienceScope("friends")}
                  className="accent-blue-600 h-4 w-4"
                />
                <span className="text-sm">Friends only</span>
              </label>
            </div>
          </div>
          {error && (
            <div className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm">{error}</div>
          )}
          <div className="text-center pt-2">
            <Button
              type="submit"
              className="bg-green-700 hover:bg-green-800 text-white text-base px-8 py-2 rounded-md shadow hover-scale"
              disabled={mutation.isLoading}
            >
              {mutation.isLoading ? "Creating..." : "Create Challenge"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChallengeCreate;
