import React from 'react';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import BottomNav from '@/components/BottomNav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, LoaderCircle, Award, Leaf, Users, MapPin, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ActivityCard from '@/components/ActivityCard';
import { Database } from '@/integrations/supabase/types';
import { Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ProfileHeader from "@/components/ProfileHeader";
import { useUserBadges } from "@/hooks/useUserBadges";
import UserBadges from "@/components/UserBadges";

type Activity = Database['public']['Tables']['activities']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type ActivityWithProfile = Activity & { profile: Profile | null };

const ProfilePage = () => {
    const { user } = useAuthStatus();
    const navigate = useNavigate();

    const { data: profile, isLoading: profileLoading } = useQuery({
        queryKey: ['profile', user?.id],
        queryFn: async () => {
            if (!user) return null;
            const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            if (error) {
                console.error("Error fetching profile:", error);
                return null;
            }
            return data;
        },
        enabled: !!user,
    });
    
    const { data: activities, isLoading: activitiesLoading } = useQuery<ActivityWithProfile[]>({
        queryKey: ['user-activities', user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from('activities')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) {
                console.error('Error fetching activities', error);
                return [];
            }
            
            const { data: userProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

            return data.map(activity => ({
                ...activity,
                profile: userProfile,
            }));
        },
        enabled: !!user,
    });

    // NEW: Fetch user badges
    const { data: badges = [], isLoading: badgesLoading } = useUserBadges();

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            toast({ title: "Logout Failed", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Logged Out", description: "You have been successfully logged out." });
            navigate('/login');
        }
    };

    const [editing, setEditing] = React.useState(false);
    const [editForm, setEditForm] = React.useState({
        full_name: '',
        username: '',
        location: '',
        lifestyle_tags: [] as string[],
        avatar_url: '',
    });
    const [avatarUploading, setAvatarUploading] = React.useState(false);
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (profile) {
            setEditForm({
                full_name: profile.full_name || '',
                username: profile.username || '',
                location: profile.location || '',
                lifestyle_tags: profile.lifestyle_tags || [],
                avatar_url: profile.avatar_url || '',
            });
        }
    }, [profile]);

    const updateProfile = async () => {
        setErrorMsg(null);
        if (!user) {
            console.log("[Profile Edit] No user found in context.");
            return;
        }
        if (!editForm.username) {
            setErrorMsg("Username cannot be empty.");
            console.log("[Profile Edit] Username is empty.");
            return;
        }
        console.log("[Profile Edit] Submitting update", {
            id: user.id,
            ...editForm
        });
        const { error } = await supabase.from('profiles').update({
            full_name: editForm.full_name,
            username: editForm.username,
            location: editForm.location,
            lifestyle_tags: editForm.lifestyle_tags,
            avatar_url: editForm.avatar_url
        }).eq('id', user.id);
        if (error) {
            if (error.code === '23505' || (error.message && error.message?.toLowerCase().includes('username'))) {
                setErrorMsg("That username is taken. Please choose another.");
            } else {
                setErrorMsg(error.message || "Update failed");
            }
            console.error("[Profile Edit] Supabase error", error);
            return;
        } else {
            toast({ title: "Profile updated!" });
            setEditing(false);
            console.log("[Profile Edit] Profile updated successfully!");
        }
    };

    const handleTagToggle = (tag: string) => {
        setEditForm((curr) => ({
            ...curr,
            lifestyle_tags: curr.lifestyle_tags.includes(tag)
                ? curr.lifestyle_tags.filter((t) => t !== tag)
                : [...curr.lifestyle_tags, tag]
        }));
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;
        setAvatarUploading(true);
        const filePath = `avatars/${user.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
        if (uploadError) {
            toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
            console.log("Profile avatar upload failed:", uploadError);
            setAvatarUploading(false);
            return;
        }
        const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(filePath);
        if (!publicData?.publicUrl) {
            toast({ title: "Couldn't load avatar url!", description: "No public URL", variant: "destructive" });
            console.log("Profile avatar public URL failed:", publicData);
            setAvatarUploading(false);
            return;
        }
        setEditForm((curr) => ({ ...curr, avatar_url: publicData.publicUrl }));
        toast({ title: "Profile image updated!" });
        setAvatarUploading(false);
    };

    if (profileLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
                <p className="text-muted-foreground">Could not load profile. It might be that you just signed up.</p>
                <p className="text-muted-foreground text-sm mb-4">Try refreshing the page in a bit.</p>
                <Button onClick={() => navigate('/login')} className="mt-4">Go to Login</Button>
            </div>
        )
    }

    const achievements = [
        { icon: Award, title: 'First Steps', description: 'Logged your first activity.' },
        { icon: Leaf, title: 'Eco-Warrior', description: 'Saved 100kg of CO2.' },
        { icon: Users, title: 'Social Butterfly', description: 'Made 5 friends.' },
    ];

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="bg-card/80 backdrop-blur-sm p-4 sticky top-0 z-40 flex justify-between items-center border-b">
                <h1 className="text-2xl font-bold text-primary">Profile</h1>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                        <Settings className="w-5 h-5 text-muted-foreground" />
                    </Button>
                    <Button onClick={handleLogout} variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                        <LogOut className="w-5 h-5" />
                    </Button>
                </div>
            </header>
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 mb-16">

                {/* EDIT MODE MODAL: Show if editing is true */}
                {editing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <div
                            className={`
                                bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-lg
                                p-4 sm:p-8 relative
                                flex flex-col max-h-screen
                                overflow-y-auto
                                transition-all
                                sm:mt-0 mt-auto
                                ${editing ? "animate-in fade-in-0 slide-in-from-bottom-8" : ""}
                            `}
                            style={{
                                minHeight: '50vh',
                                maxHeight: '95vh'
                            }}
                        >
                            <h2 className="text-2xl font-bold mb-4 sm:mb-6 text-center">Edit Profile</h2>
                            <form
                              onSubmit={e => {
                                  e.preventDefault();
                                  updateProfile();
                              }}
                              className="space-y-4"
                            >
                                <div>
                                    <label className="block font-medium mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={editForm.full_name}
                                        onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))}
                                        className="w-full border rounded p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">Username</label>
                                    <input
                                        type="text"
                                        value={editForm.username}
                                        onChange={e => setEditForm(f => ({ ...f, username: e.target.value }))}
                                        className="w-full border rounded p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">Location</label>
                                    <input
                                        type="text"
                                        value={editForm.location}
                                        onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))}
                                        className="w-full border rounded p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">Lifestyle Tags</label>
                                    <div className="flex flex-wrap gap-2">
                                        {["Vegetarian", "Vegan", "Cyclist", "Gardener", "Minimalist", "Composter", "Zero Waste", "Car Free", "Parent", "Techie", "Student", "Remote Worker"].map(tag => (
                                            <button
                                                key={tag}
                                                type="button"
                                                className={`px-3 py-1 rounded-full border ${editForm.lifestyle_tags.includes(tag) ? 'bg-blue-100 border-blue-400 text-blue-900' : 'bg-gray-100 border-gray-300 text-gray-600'}`}
                                                onClick={() => handleTagToggle(tag)}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">Avatar</label>
                                    <div className="flex items-center gap-3">
                                        <img src={editForm.avatar_url || "/placeholder.svg"} alt="avatar" className="w-16 h-16 rounded-full border" />
                                        <label className="inline-block cursor-pointer">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleAvatarUpload}
                                                disabled={avatarUploading}
                                            />
                                            <span className="inline-flex items-center gap-1 text-blue-600 hover:underline">
                                                {avatarUploading ? "Uploading..." : "Change"}
                                            </span>
                                        </label>
                                    </div>
                                </div>
                                {errorMsg && <div className="text-red-500 text-sm">{errorMsg}</div>}
                                <div className="flex justify-end gap-2 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setEditing(false)}
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-5 py-2 rounded"
                                        disabled={avatarUploading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded"
                                        disabled={avatarUploading}
                                    >
                                        Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Refactored header section! */}
                <ProfileHeader
                    profile={profile}
                    badges={badges}
                    badgesLoading={badgesLoading}
                    activitiesCount={activities?.length || 0}
                    kelpPoints={profile.kelp_points || 0}
                    editing={editing}
                    editForm={editForm}
                    avatarUploading={avatarUploading}
                    errorMsg={errorMsg}
                    setEditing={setEditing}
                    updateProfile={() => { console.log("[Profile Edit] Save button clicked."); updateProfile(); }}
                    setEditForm={setEditForm}
                    handleTagToggle={handleTagToggle}
                    handleAvatarUpload={handleAvatarUpload}
                />

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> About Me</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {profile.location && (
                            <div className="flex items-center gap-3 text-sm">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <span>{profile.location}</span>
                            </div>
                        )}
                        {(profile.lifestyle_tags && profile.lifestyle_tags.length > 0) ? (
                            <div className="flex items-start gap-3 text-sm">
                                <Tag className="w-4 h-4 text-muted-foreground mt-1" />
                                <div className="flex flex-wrap gap-2">
                                    {profile.lifestyle_tags.map(tag => (
                                        <div key={tag} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium">
                                            {tag}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : <p className="text-sm text-muted-foreground">No lifestyle tags added yet.</p>}
                        {/* Updated: Add onClick to show edit mode */}
                        <Button
                          variant="outline"
                          className="w-full mt-2"
                          onClick={() => setEditing(true)}
                        >
                          Edit Profile
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Award className="w-5 h-5 text-primary" /> Achievements</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {achievements.map((ach) => (
                            <div key={ach.title} className="flex items-center gap-4 p-3 bg-secondary rounded-lg">
                                <ach.icon className="w-8 h-8 text-primary" />
                                <div>
                                    <p className="font-semibold">{ach.title}</p>
                                    <p className="text-sm text-muted-foreground">{ach.description}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {activitiesLoading && <div className="flex justify-center"><LoaderCircle className="w-6 h-6 animate-spin text-primary" /></div>}
                        {activities && activities.length > 0 ? (
                            <div className="space-y-4">
                                {activities.map(item => (
                                    <ActivityCard key={item.id} activity={item} profile={item.profile} />
                                ))}
                            </div>
                        ) : (
                            !activitiesLoading && <p className="text-muted-foreground text-center py-8">No recent activities to show.</p>
                        )}
                    </CardContent>
                </Card>
            </main>
            <BottomNav />
        </div>
    );
};

export default ProfilePage;
