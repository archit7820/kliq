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
        if (!user) return;
        if (!editForm.username) {
            setErrorMsg("Username cannot be empty.");
            return;
        }
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
            return;
        } else {
            toast({ title: "Profile updated!" });
            setEditing(false);
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
        const { data: publicData, error: urlError } = supabase.storage.from('avatars').getPublicUrl(filePath);
        if (urlError || !publicData?.publicUrl) {
            toast({ title: "Couldn't load avatar url!", description: urlError?.message || "No public URL", variant: "destructive" });
            console.log("Profile avatar public URL failed:", urlError, publicData);
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
                <Card className="overflow-hidden border">
                    <div className="bg-primary/10 h-24 sm:h-32" />
                    <CardContent className="pt-0">
                        <div className="flex flex-col items-center -mt-12 sm:-mt-16">
                            {editing ? (
                                <>
                                    <label className="relative group cursor-pointer">
                                        <img
                                            src={editForm.avatar_url || ""}
                                            alt="avatar"
                                            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 object-cover border-background ring-2 ring-primary"
                                        />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                                        <span className="absolute bottom-2 right-2 bg-primary text-white rounded-full p-1">
                                            <Upload className="w-5 h-5" />
                                        </span>
                                        {avatarUploading && <LoaderCircle className="absolute w-5 h-5 animate-spin top-2 right-2 text-muted-foreground" />}
                                    </label>
                                    <Input
                                        className="mt-2"
                                        placeholder="Full name"
                                        value={editForm.full_name}
                                        onChange={e => setEditForm({ ...editForm, full_name: e.target.value })}
                                    />
                                    <Input
                                        className="mt-2"
                                        placeholder="Username"
                                        value={editForm.username}
                                        onChange={e => setEditForm({ ...editForm, username: e.target.value.replace(/\W/g, '') })}
                                    />
                                    <Input
                                        className="mt-2"
                                        placeholder="Location"
                                        value={editForm.location}
                                        onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                                    />
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {[
                                            "Vegetarian", "Vegan", "Cyclist", "Gardener", "Minimalist", "Composter",
                                            "Zero Waste", "Car Free", "Parent", "Techie", "Student", "Remote Worker"
                                        ].map(tag => (
                                            <button
                                                key={tag}
                                                type="button"
                                                className={`px-3 py-1 rounded-full border ${editForm.lifestyle_tags.includes(tag) ? 'bg-green-300 text-green-900 font-semibold border-green-400' : 'bg-gray-100 text-gray-600 border-gray-200'} transition-all`}
                                                onClick={() => handleTagToggle(tag)}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                    <Button className="w-full mt-2" onClick={updateProfile}>Save Profile</Button>
                                    <Button variant="outline" className="w-full mt-2" onClick={() => setEditing(false)}>Cancel</Button>
                                    {errorMsg && (
                                        <div className="text-red-500 text-xs mt-2 text-center">{errorMsg}</div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <Avatar className="w-24 h-24 sm:w-32 sm:h-32 mb-2 border-4 border-background ring-2 ring-primary">
                                        <AvatarImage src={profile.avatar_url || undefined} />
                                        <AvatarFallback className="text-4xl bg-secondary">
                                            {profile.full_name?.charAt(0) || profile.username?.charAt(0) || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <h2 className="text-2xl font-bold mt-2">{profile.full_name || `@${profile.username}`}</h2>
                                    <p className="text-muted-foreground">{profile.username ? `@${profile.username}` : null}</p>
                                    <Button variant="outline" size="sm" className="mt-2" onClick={() => setEditing(true)}>
                                        Edit Profile
                                    </Button>
                                </>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-6 text-center">
                            <div className="p-4 bg-secondary rounded-lg">
                                <p className="font-bold text-2xl text-primary">{activities?.length || 0}</p>
                                <p className="text-sm text-muted-foreground">Activities</p>
                            </div>
                            <div className="p-4 bg-secondary rounded-lg">
                                <p className="font-bold text-2xl text-primary">{profile.kelp_points || 0}</p>
                                <p className="text-sm text-muted-foreground">Kelp Points</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

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
                        <Button variant="outline" className="w-full mt-2">Edit Profile</Button>
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
