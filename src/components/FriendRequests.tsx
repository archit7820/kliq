
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { UserPlus, UserX } from "lucide-react";

type Request = {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  sender?: any;
  receiver?: any;
};

const FriendRequests = () => {
  const { user } = useAuthStatus();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from("friend_requests")
      .select("*, sender:sender_id(full_name, username, avatar_url), receiver:receiver_id(full_name, username, avatar_url)")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) return;
        setRequests(data || []);
        setLoading(false);
      });
  }, [user]);

  const respondToRequest = async (id: string, accept: boolean) => {
    if (!user) return;
    if (accept) {
      // 1. Mark request accepted 2. Create a row in friends table, with the two ids (ascending order to deduplicate)
      const req = requests.find(r => r.id === id);
      if (!req) return;
      const user1 = [req.sender_id, req.receiver_id].sort()[0];
      const user2 = [req.sender_id, req.receiver_id].sort()[1];

      const { error: updateError } = await supabase
        .from("friend_requests")
        .update({ status: "accepted" })
        .eq("id", id);
      if (updateError) {
        toast({ title: "Error", description: updateError.message, variant: "destructive" });
        return;
      }
      const { error: friendError } = await supabase
        .from("friends")
        .insert([{ user1_id: user1, user2_id: user2 }]);
      if (friendError) {
        toast({ title: "Error", description: friendError.message, variant: "destructive" });
      } else {
        toast({ title: "Friends!", description: "You are now friends." });
      }
    } else {
      // Decline/reject
      const { error } = await supabase
        .from("friend_requests")
        .update({ status: "declined" })
        .eq("id", id);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    }
    // Remove from local list afterwards
    setRequests((prev) => prev.filter(r => r.id !== id));
  };

  if (!user) return null;

  // Split into received and sent
  const received = requests.filter(r => r.receiver_id === user.id && r.status === "pending");
  const sent = requests.filter(r => r.sender_id === user.id && r.status === "pending");

  return (
    <section>
      <h2 className="font-semibold text-lg mb-2">Friend Requests</h2>
      <div className="flex flex-col gap-3">
        {received.length > 0 && (
          <div>
            <h3 className="font-medium mb-1">Received</h3>
            <ul>
              {received.map(r => (
                <li key={r.id} className="bg-white rounded-md shadow p-3 flex items-center gap-3 mb-2">
                  {r.sender?.avatar_url
                    ? <img src={r.sender.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                    : <div className="w-8 h-8 rounded-full bg-gray-300" />}
                  <span>{r.sender?.full_name || r.sender?.username || "User"}</span>
                  <Button
                    size="sm"
                    className="ml-auto mr-2"
                    onClick={() => respondToRequest(r.id, true)}
                  >
                    <UserPlus className="w-4 h-4 mr-1" /> Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => respondToRequest(r.id, false)}
                  >
                    <UserX className="w-4 h-4 mr-1" /> Decline
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {sent.length > 0 && (
          <div>
            <h3 className="font-medium mb-1">Sent</h3>
            <ul>
              {sent.map(r => (
                <li key={r.id} className="bg-white rounded-md shadow p-3 flex items-center gap-3 mb-2">
                  {r.receiver?.avatar_url
                    ? <img src={r.receiver.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                    : <div className="w-8 h-8 rounded-full bg-gray-300" />}
                  <span>{r.receiver?.full_name || r.receiver?.username || "User"}</span>
                  <span className="ml-auto text-gray-400">Pending</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {received.length === 0 && sent.length === 0 && (
          <div className="text-gray-400 text-sm">No pending friend requests.</div>
        )}
      </div>
    </section>
  );
};

export default FriendRequests;
