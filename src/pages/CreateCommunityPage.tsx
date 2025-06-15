
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { toast } from "@/components/ui/use-toast";

const CreateCommunityPage = () => {
  const { user } = useAuthStatus();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    is_official: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "You need to login", description: "Login required to create communities.", variant: "destructive" });
      return;
    }
    if (!form.name.trim()) {
      toast({ title: "Name required", description: "Community name cannot be empty.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("communities")
      .insert({
        name: form.name.trim(),
        description: form.description,
        created_by: user.id,
        is_official: form.is_official,
      })
      .select()
      .maybeSingle();

    setLoading(false);

    if (error) {
      toast({ title: "Creation failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Community created!", description: form.name });
    // Auto-join the new community
    if (data?.id) {
      await supabase.from("community_memberships").insert({
        user_id: user.id,
        community_id: data.id,
        status: "approved"
      });
      navigate(`/communities/${data.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex justify-center items-center">
      <form onSubmit={handleSubmit} className="bg-white px-8 py-7 rounded-2xl shadow-2xl max-w-lg w-full space-y-5">
        <h1 className="font-extrabold text-3xl text-blue-900 mb-1 tracking-wide">Create Community</h1>
        <Input
          name="name"
          placeholder="Community Name"
          required
          value={form.name}
          onChange={handleChange}
          className="text-lg"
        />
        <Textarea
          name="description"
          placeholder="Describe your community's mission or vibe..."
          rows={3}
          value={form.description}
          onChange={handleChange}
          className="text-base"
        />
        <div className="flex gap-2 items-center">
          <input
            id="is_official"
            type="checkbox"
            checked={form.is_official}
            onChange={e => setForm(f => ({ ...f, is_official: e.target.checked }))}
            disabled
          />
          <label htmlFor="is_official" className="text-xs text-blue-600">Official (admins only)</label>
        </div>
        <Button type="submit" className="w-full bg-blue-700 text-white hover:bg-blue-800" disabled={loading}>
          {loading ? "Creating..." : "Create"}
        </Button>
      </form>
    </div>
  );
};

export default CreateCommunityPage;
