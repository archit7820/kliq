
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Users, Lock, Globe, Shield, Settings } from "lucide-react";

const CreateCommunityPage = () => {
  const { user } = useAuthStatus();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    scope: "local" as "local" | "national" | "global",
    privacy_type: "public" as "public" | "private" | "invite_only",
    max_members: null as number | null,
    admin_permissions: {
      can_create_challenges: true,
      can_moderate_posts: true,
      can_manage_members: true,
      can_edit_community: true,
    },
    member_permissions: {
      can_post: true,
      can_comment: true,
      can_create_challenges: false,
    },
    is_official: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'max_members') {
      setForm((prev) => ({
        ...prev,
        [name]: value ? parseInt(value) : null,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePermissionChange = (type: 'admin' | 'member', permission: string, value: boolean) => {
    setForm((prev) => ({
      ...prev,
      [`${type}_permissions`]: {
        ...prev[`${type}_permissions`],
        [permission]: value,
      },
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
    // Generate invite code if private or invite-only
    let inviteCode = null;
    if (form.privacy_type === 'private' || form.privacy_type === 'invite_only') {
      const { data: codeData } = await supabase.rpc('generate_invite_code');
      inviteCode = codeData;
    }

    const { data, error } = await supabase
      .from("communities")
      .insert({
        name: form.name.trim(),
        description: form.description,
        category: form.category,
        scope: form.scope,
        privacy_type: form.privacy_type,
        max_members: form.max_members,
        admin_permissions: form.admin_permissions,
        member_permissions: form.member_permissions,
        invite_code: inviteCode,
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="font-semibold text-lg">Create Community</h1>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="font-medium">Basic Information</h2>
            </div>
            
            <Input
              name="name"
              placeholder="Community Name"
              required
              value={form.name}
              onChange={handleChange}
              className="text-base"
            />
            
            <Textarea
              name="description"
              placeholder="Describe your community's mission or vibe..."
              rows={3}
              value={form.description}
              onChange={handleChange}
              className="text-base resize-none"
            />
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-muted-foreground">Category</Label>
                <Select value={form.category} onValueChange={(value) => setForm(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fitness">Fitness</SelectItem>
                    <SelectItem value="outdoors">Outdoors</SelectItem>
                    <SelectItem value="climate">Climate</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="transport">Transport</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm text-muted-foreground">Scope</Label>
                <Select value={form.scope} onValueChange={(value) => setForm(prev => ({ ...prev, scope: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Local</SelectItem>
                    <SelectItem value="national">National</SelectItem>
                    <SelectItem value="global">Global</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="bg-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="font-medium">Privacy & Access</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 border rounded-xl cursor-pointer" 
                   onClick={() => setForm(prev => ({ ...prev, privacy_type: 'public' }))}>
                <div className={`w-4 h-4 rounded-full border-2 mt-0.5 ${form.privacy_type === 'public' ? 'bg-primary border-primary' : 'border-muted-foreground'}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Public</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Anyone can find and join</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 border rounded-xl cursor-pointer"
                   onClick={() => setForm(prev => ({ ...prev, privacy_type: 'private' }))}>
                <div className={`w-4 h-4 rounded-full border-2 mt-0.5 ${form.privacy_type === 'private' ? 'bg-primary border-primary' : 'border-muted-foreground'}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Private</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Members can find and join with approval</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 border rounded-xl cursor-pointer"
                   onClick={() => setForm(prev => ({ ...prev, privacy_type: 'invite_only' }))}>
                <div className={`w-4 h-4 rounded-full border-2 mt-0.5 ${form.privacy_type === 'invite_only' ? 'bg-primary border-primary' : 'border-muted-foreground'}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Invite Only</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Only invited members can join</p>
                </div>
              </div>
            </div>
            
            {(form.privacy_type === 'private' || form.privacy_type === 'invite_only') && (
              <div>
                <Label className="text-sm text-muted-foreground">Max Members (optional)</Label>
                <Input
                  name="max_members"
                  type="number"
                  placeholder="Leave empty for unlimited"
                  value={form.max_members || ''}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
            )}
          </div>

          {/* Permissions */}
          <div className="bg-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-primary" />
              <h2 className="font-medium">Permissions</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="font-medium text-sm">Admin Permissions</Label>
                <div className="mt-2 space-y-3">
                  {Object.entries(form.admin_permissions).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label className="text-sm text-muted-foreground">
                        {key.replace(/_/g, ' ').replace(/^./, str => str.toUpperCase())}
                      </Label>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) => handlePermissionChange('admin', key, checked)}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="font-medium text-sm">Member Permissions</Label>
                <div className="mt-2 space-y-3">
                  {Object.entries(form.member_permissions).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label className="text-sm text-muted-foreground">
                        {key.replace(/_/g, ' ').replace(/^./, str => str.toUpperCase())}
                      </Label>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) => handlePermissionChange('member', key, checked)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Create Button */}
          <div className="sticky bottom-4 bg-background/80 backdrop-blur-sm rounded-2xl p-4">
            <Button type="submit" className="w-full h-12 text-base font-medium" disabled={loading}>
              {loading ? "Creating Community..." : "Create Community"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCommunityPage;
