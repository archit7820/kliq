
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
        created_by: user.id, // Set the correct user id field!
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
    <div className="bg-white p-6 rounded-lg shadow max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Create Challenge</h2>
      {error && (
        <div className="bg-red-100 text-red-800 p-2 rounded mb-2">{error}</div>
      )}
      <form
        onSubmit={e => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="flex flex-col gap-3"
      >
        <Input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Title"
          required
        />
        <Input
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Description"
        />
        <Input
          type="number"
          value={reward}
          onChange={e => setReward(Number(e.target.value))}
          placeholder="Reward Kelp Points"
          min={0}
        />
        <select
          value={audienceScope}
          onChange={e => setAudienceScope(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="world">World</option>
          <option value="friends">Friends</option>
          <option value="community">Community</option>
        </select>
        <Button type="submit" className="bg-green-700 text-white">
          Create Challenge
        </Button>
      </form>
    </div>
  );
};

export default ChallengeCreate;
