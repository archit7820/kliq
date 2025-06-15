
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const CommunityMembersManager = ({ communityId }: { communityId: string }) => {
  const queryClient = useQueryClient();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [optimistic, setOptimistic] = useState<{ id: string, status: "approved" | "rejected" } | null>(null);

  // Get pending and approved members
  const { data: members = [], isLoading } = useQuery({
    queryKey: ["community-members", communityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_memberships")
        .select("id, user_id, status, profiles(full_name, username, avatar_url)")
        .eq("community_id", communityId);

      if (error) throw new Error(error.message);
      console.log("[CommunityMembersManager] Fetched members:", data);
      return data || [];
    }
  });

  function getMembersWithOptimistic() {
    // Merges local optimistic status with raw members
    if (!optimistic) return members;
    const result = members.map(m =>
      m.id === optimistic.id
        ? { ...m, status: optimistic.status }
        : m
    );
    console.log("[CommunityMembersManager] Members with optimistic:", result);
    return result;
  }

  const approveMutation = useMutation({
    mutationFn: async (membershipId: string) => {
      setProcessingId(membershipId);
      setOptimistic({ id: membershipId, status: "approved" });
      const { error } = await supabase
        .from("community_memberships")
        .update({ status: "approved" })
        .eq("id", membershipId);
      if (error) throw new Error(error.message);
    },
    onSettled: (_, __, membershipId) => {
      setProcessingId(null);
      setOptimistic(null);
      queryClient.invalidateQueries({ queryKey: ["community-members", communityId] });
      queryClient.invalidateQueries({ queryKey: ["allCommunities"] });
    },
    onSuccess: () => {
      toast({ title: "Member approved!" });
    },
    onError: (error) => {
      toast({ title: "Failed to approve member", description: error?.message, variant: "destructive" });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (membershipId: string) => {
      setProcessingId(membershipId);
      setOptimistic({ id: membershipId, status: "rejected" });
      const { error } = await supabase
        .from("community_memberships")
        .update({ status: "rejected" })
        .eq("id", membershipId);
      if (error) throw new Error(error.message);
    },
    onSettled: (_, __, membershipId) => {
      setProcessingId(null);
      setOptimistic(null);
      queryClient.invalidateQueries({ queryKey: ["community-members", communityId] });
      queryClient.invalidateQueries({ queryKey: ["allCommunities"] });
    },
    onSuccess: () => {
      toast({ title: "Member rejected." });
    },
    onError: (error) => {
      toast({ title: "Failed to reject member", description: error?.message, variant: "destructive" });
    }
  });

  const memberList = getMembersWithOptimistic();

  if (isLoading) return <div>Loading members...</div>;
  if (!members || members.length === 0) return <div>No members found.</div>;

  const pending = memberList.filter((m: any) => m.status === "pending");
  const approved = memberList.filter((m: any) => m.status === "approved");

  // Log filtered outputs
  console.log("[CommunityMembersManager] FINAL: memberList:", memberList);
  console.log("[CommunityMembersManager] FINAL: pending:", pending);
  console.log("[CommunityMembersManager] FINAL: approved:", approved);

  return (
    <div className="border rounded-xl bg-white shadow mt-5 p-4">
      <h3 className="text-blue-700 font-bold mb-2">Membership Requests</h3>
      {pending.length === 0 && (
        <div className="text-gray-400 text-xs mb-2">No pending requests.</div>
      )}
      <ul className="mb-5 space-y-2">
        {pending.map((m: any) => (
          <li key={m.id} className="flex items-center gap-2 bg-blue-50 rounded p-2">
            <img src={m.profiles?.avatar_url || "/placeholder.svg"} alt="" className="w-8 h-8 rounded-full" />
            <span className="font-medium">{m.profiles?.full_name || m.profiles?.username || "Unknown User"}</span>
            <Button
              size="sm"
              disabled={processingId === m.id && approveMutation.isPending}
              onClick={() => approveMutation.mutate(m.id)}
              className="ml-auto px-3 py-1 bg-green-500 hover:bg-green-600 text-white"
            >
              {(processingId === m.id && approveMutation.isPending) ? "Approving..." : "Approve"}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={processingId === m.id && rejectMutation.isPending}
              onClick={() => rejectMutation.mutate(m.id)}
              className="ml-2 px-3 py-1"
            >
              {(processingId === m.id && rejectMutation.isPending) ? "Rejecting..." : "Reject"}
            </Button>
          </li>
        ))}
      </ul>
      <h4 className="font-semibold text-blue-600 mb-2">Approved Members</h4>
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {approved.map((m: any) => (
          <li key={m.id} className="flex items-center gap-2 bg-blue-50 rounded p-2">
            <img src={m.profiles?.avatar_url || "/placeholder.svg"} alt="" className="w-7 h-7 rounded-full" />
            <span className="font-medium text-xs">{m.profiles?.full_name || m.profiles?.username}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommunityMembersManager;
