
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { Users, UserCheck, UserMinus, UserPlus, HelpCircle, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

type FriendReq = {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
  profile?: { full_name: string | null; username: string | null; avatar_url: string | null };
};

const FriendRequests = () => {
  const { user } = useAuthStatus();
  const [reqs, setReqs] = useState<FriendReq[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    // Get incoming friend requests
    supabase
      .from("friend_requests")
      .select("*")
      .eq("receiver_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .then(async ({ data, error }) => {
        if (error || !data) {
          setReqs([]);
          setLoading(false);
          return;
        }
        // Fetch sender profiles
        const senderIds = data.map(r => r.sender_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, username, avatar_url")
          .in("id", senderIds);
        const reqsWithProfile = data.map(r => {
          const profile = profiles?.find(pr => pr.id === r.sender_id);
          return { ...r, profile };
        });
        setReqs(reqsWithProfile);
        setLoading(false);
      });
  }, [user]);

  // Accept/decline actions
  const handleRespond = async (req: FriendReq, accept: boolean) => {
    const newStatus = accept ? "accepted" : "declined";
    await supabase
      .from("friend_requests")
      .update({ status: newStatus })
      .eq("id", req.id);

    setReqs((prev) => prev.filter(r => r.id !== req.id));
    toast({
      title: accept ? "Friend Added!" : "Request Declined",
      description: (
        accept ? "You are now friends." : "This request was declined."
      ),
      variant: accept ? "default" : "destructive",
    });
  };

  return (
    <section>
      <h2 className="font-extrabold text-xl mb-3 flex gap-2 items-center text-blue-700 tracking-tight">
        <UserPlus className="w-6 h-6 text-blue-500" />
        <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">Friend Requests</span>
      </h2>

      <div className="space-y-3">
        {loading && (
          <div className="animate-pulse px-4 py-6 rounded-lg bg-gradient-to-r from-blue-100 via-green-100 to-green-50 flex items-center gap-3">
            <UserPlus className="w-8 h-8 text-blue-200 animate-pulse" />
            <div className="h-4 w-32 bg-blue-100 rounded" />
          </div>
        )}
        {!loading && reqs.length === 0 && (
          <div className="bg-white border-2 border-dashed border-blue-200 rounded-2xl flex flex-col gap-2 items-center p-7 mt-1 shadow-[0_6px_40px_rgba(37,99,235,0.09)] animate-fade-in">
            <Smile className="w-10 h-10 text-blue-200 mb-1" />
            <span className="text-blue-400 font-semibold">No friend requests</span>
            <span className="text-gray-400 text-xs">Share your invite or ask friends to add you!</span>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {reqs.map(req => (
            <div
              key={req.id}
              className="bg-gradient-to-br from-blue-50/80 via-green-50/80 to-white rounded-3xl shadow-lg px-6 py-4 flex items-center gap-5 border border-blue-100 hover:shadow-2xl transition group"
            >
              {req.profile?.avatar_url ? (
                <img
                  src={req.profile.avatar_url}
                  alt="avatar"
                  className="w-11 h-11 rounded-full border-2 border-blue-300 object-cover shadow"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-200 via-green-200 to-green-100 flex items-center justify-center text-blue-500 border-2 border-blue-100">
                  <Users className="w-6 h-6" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span className="block font-bold text-blue-700 truncate">
                  {req.profile?.full_name || req.profile?.username || "User"}
                </span>
                <span className="block text-xs text-blue-400 font-mono truncate">
                  @{req.profile?.username || ""}
                </span>
              </div>
              <div className="flex flex-col gap-1 items-end">
                <Badge variant="secondary" className="mb-1 bg-gradient-to-r from-blue-400 to-green-300 text-white shadow">
                  Pending
                </Badge>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    className="rounded-full border border-blue-300 bg-blue-50 hover:bg-blue-100 px-2.5 py-2"
                    onClick={() => handleRespond(req, true)}
                    title="Accept"
                  >
                    <UserCheck className="w-5 h-5 text-green-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="rounded-full border border-red-300 bg-red-50 hover:bg-red-100 px-2.5 py-2"
                    onClick={() => handleRespond(req, false)}
                    title="Decline"
                  >
                    <UserMinus className="w-5 h-5 text-red-400" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FriendRequests;
