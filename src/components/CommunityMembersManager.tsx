
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Users } from "lucide-react";

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
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Members</h3>
      </div>

      {pending.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">Pending Requests</h4>
          <div className="space-y-2">
            {pending.map((m: any) => (
              <div key={m.id} className="flex items-center gap-3 bg-card rounded-lg border p-3">
                <img 
                  src={m.profiles?.avatar_url || "/placeholder.svg"} 
                  alt="" 
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    {m.profiles?.full_name || m.profiles?.username || "Unknown User"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={processingId === m.id && approveMutation.isPending}
                    onClick={() => approveMutation.mutate(m.id)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {(processingId === m.id && approveMutation.isPending) ? "Approving..." : "Approve"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={processingId === m.id && rejectMutation.isPending}
                    onClick={() => rejectMutation.mutate(m.id)}
                  >
                    {(processingId === m.id && rejectMutation.isPending) ? "Rejecting..." : "Reject"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-foreground">Approved Members</h4>
          <span className="text-sm text-muted-foreground">{approved.length} members</span>
        </div>
        
        {approved.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No approved members yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {approved.map((m: any) => (
              <div key={m.id} className="flex items-center gap-2 bg-card rounded-lg border p-3 hover:shadow-sm transition-shadow">
                <img 
                  src={m.profiles?.avatar_url || "/placeholder.svg"} 
                  alt="" 
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">
                    {m.profiles?.full_name || m.profiles?.username || "Unknown"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityMembersManager;
