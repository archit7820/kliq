
import React, { useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const audienceScopes = [
  { value: "friends", label: "Friends" },
  { value: "community", label: "Community" },
  { value: "world", label: "World" }
];

const ChallengeCreate: React.FC = () => {
  const [title, setTitle] = useState("");
  const [audience, setAudience] = useState("friends");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      toast({ title: "Title required" });
      return;
    }
    const { error } = await supabase
      .from("challenges")
      .insert([{ title, audience_scope: audience }]);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Challenge created!" });
      setTitle("");
    }
  };

  return (
    <Card className="mb-6">
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 border-b">
        <CardTitle className="text-lg">Create a Challenge</CardTitle>
      </div>
      <CardContent>
        <form className="gap-2 flex flex-col sm:flex-row items-center" onSubmit={handleSubmit}>
          <input
            className="w-full border rounded px-2 py-1"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Challenge title"
            required
          />
          <select
            className="border rounded px-2 py-1"
            value={audience}
            onChange={e => setAudience(e.target.value)}
          >
            {audienceScopes.map(a => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
          <Button className="bg-green-600" type="submit">Create</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChallengeCreate;
