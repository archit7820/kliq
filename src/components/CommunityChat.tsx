
import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface CommunityChatProps {
  user: User;
  communityId: string;
}

const CommunityChat: React.FC<CommunityChatProps> = ({ user, communityId }) => {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messages } = useQuery({
    queryKey: ["community-messages", communityId],
    queryFn: async () => {
      const { data } = await supabase
        .from("community_messages")
        .select("*")
        .eq("community_id", communityId)
        .order("created_at", { ascending: true });
      return data || [];
    },
    enabled: !!user && !!communityId,
  });

  const mutation = useMutation({
    mutationFn: async (content: string) => {
      await supabase.from("community_messages").insert({
        community_id: communityId,
        user_id: user.id,
        content,
      });
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["community-messages", communityId] });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-md border">
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages?.map((msg: any) => (
          <div key={msg.id} className={`flex ${msg.user_id === user.id ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-xs px-4 py-2 rounded-2xl ${
                msg.user_id === user.id
                  ? "bg-green-500 text-white rounded-br-lg"
                  : "bg-gray-100 text-gray-800 rounded-bl-lg border"
              }`}
            >
              <span>{msg.content}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form
        className="p-3 flex gap-2 border-t"
        onSubmit={e => {
          e.preventDefault();
          if (message.trim()) mutation.mutate(message.trim());
        }}
      >
        <Input
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="rounded-full flex-1"
        />
        <Button type="submit" size="icon" className="rounded-full bg-green-600 hover:bg-green-700">
          <Send className="w-5 h-5" />
        </Button>
      </form>
    </div>
  );
};

export default CommunityChat;
