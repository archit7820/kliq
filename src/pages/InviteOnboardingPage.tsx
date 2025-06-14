import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { LoaderCircle, Upload } from 'lucide-react';
import { useAuthStatus } from '@/hooks/useAuthStatus';

const allTags = [
  "Vegetarian", "Vegan", "Cyclist", "Gardener", "Minimalist", "Composter",
  "Zero Waste", "Car Free", "Parent", "Techie", "Student", "Remote Worker"
];

const InviteOnboardingPage = () => {
  const [params] = useSearchParams();
  const inviteCode = params.get('inviteCode');
  const { user } = useAuthStatus();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    full_name: '',
    username: '',
    location: '',
    lifestyle_tags: [] as string[],
    avatar_url: '',
    uploading: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // On mount, fetch user profile to prefill
    if (!user) return;
    (async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) setForm((curr) => ({ ...curr, full_name: data.full_name || '', username: data.username || '' }));
    })();
  }, [user]);

  const handleTagToggle = (tag: string) => {
    setForm((curr) => ({
      ...curr,
      lifestyle_tags: curr.lifestyle_tags.includes(tag)
        ? curr.lifestyle_tags.filter((t) => t !== tag)
        : [...curr.lifestyle_tags, tag]
    }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setForm((f) => ({ ...f, uploading: true }));
    const filePath = `avatars/${user.id}/${Date.now()}_${file.name}`;
    // Create a public bucket in Supabase Storage called "avatars"
    const { data, error } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } else {
      const url = supabase.storage.from('avatars').getPublicUrl(filePath).data.publicUrl;
      setForm((f) => ({ ...f, avatar_url: url }));
    }
    setForm((f) => ({ ...f, uploading: false }));
  };

  const handleNext = () => setStep((s) => s + 1);

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    setErrorMsg(null);
    const { error } = await supabase.from('profiles').update({
      full_name: form.full_name,
      username: form.username,
      location: form.location,
      lifestyle_tags: form.lifestyle_tags,
      avatar_url: form.avatar_url,
      invite_code: inviteCode?.trim() || null,
    }).eq('id', user.id);

    setSubmitting(false);
    if (error) {
      if (error.code === '23505' && error.message.includes('profiles_username_key')) {
        setErrorMsg("That username is taken. Please choose another.");
      } else {
        setErrorMsg(error.message || "Profile update failed");
      }
    } else {
      toast({ title: "Welcome!", description: "Onboarding complete, enjoy Kelp 🎉" });
      navigate("/home");
    }
  };

  if (!user) return <div className="p-10 text-center text-muted-foreground">Loading user…</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-100 to-blue-50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl space-y-6">
        <h2 className="text-xl font-bold mb-2 text-center">Get started with Kelp</h2>
        {step === 1 && (
          <>
            <p className="text-muted-foreground text-center mb-2">Welcome! Enter your profile details:</p>
            <Input
              placeholder="Full name"
              value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })}
              className="mb-2"
              autoFocus
            />
            <Input
              placeholder="Username"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value.replace(/\W/g, '') })}
              className="mb-2"
            />
            <Input
              placeholder="Location"
              value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })}
              className="mb-2"
            />
            <Button className="w-full" onClick={handleNext} disabled={!form.full_name || !form.username}>
              Next
            </Button>
          </>
        )}
        {step === 2 && (
          <>
            <p className="text-muted-foreground text-center mb-4">Pick some tags that describe you:</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {allTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  className={`px-4 py-1 rounded-full border ${form.lifestyle_tags.includes(tag) ? 'bg-green-300 text-green-900 font-semibold border-green-400' : 'bg-gray-100 text-gray-600 border-gray-200'} transition-all`}
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
            <Button className="w-full" onClick={handleNext}>Next</Button>
          </>
        )}
        {step === 3 && (
          <>
            <p className="text-muted-foreground text-center mb-2">Add a profile picture (optional):</p>
            <div className="flex flex-col items-center mb-3">
              {form.avatar_url 
                ? <img src={form.avatar_url} alt="avatar" className="rounded-full w-24 h-24 object-cover border mb-2" />
                : <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-2xl text-green-700 mb-2">🙂</div>}
              <label className="cursor-pointer text-sm text-primary flex items-center gap-1">
                <Upload className="inline-block w-4 h-4" />
                Change photo
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
              {form.uploading && <LoaderCircle className="w-5 h-5 animate-spin text-muted-foreground mt-2" />}
            </div>
            <Button className="w-full" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <LoaderCircle className="animate-spin w-4 h-4" /> : "Get Started"}
            </Button>
            {errorMsg && (
              <div className="text-red-500 text-xs mt-2 text-center">{errorMsg}</div>
            )}
          </>
        )}
      </div>
      {inviteCode && (
        <div className="mt-6 text-xs text-green-700">
          Joining with invite: <span className="font-bold">{inviteCode}</span>
        </div>
      )}
    </div>
  );
};

export default InviteOnboardingPage;
