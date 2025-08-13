import React from 'react';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import BottomNav from '@/components/BottomNav';

import { Button } from '@/components/ui/button';
import { LogOut, Settings, LoaderCircle, Award, Leaf, Users, MapPin, Tag, X, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ActivityCard from '@/components/ActivityCard';
import { Database } from '@/integrations/supabase/types';
import { Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ProfileHeaderSimple from "@/components/ProfileHeaderSimple";
import { useUserBadges } from "@/hooks/useUserBadges";
import UserBadges from "@/components/UserBadges";
import EditProfileModal from "@/components/EditProfileModal";
import DynamicAchievements from "@/components/DynamicAchievements";

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
    const [showStartCard, setShowStartCard] = React.useState(true);

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

    // Hide BottomNav while editing (for mobile)
    const renderBottomNav = !editing;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="bg-card/80 backdrop-blur-sm px-4 py-3 sticky top-0 z-40 flex items-center justify-between border-b">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Close">
                    <X className="w-5 h-5 text-muted-foreground" />
                </Button>
                <h1 className="text-base font-semibold text-foreground">Profile</h1>
                <Button variant="ghost" size="icon" onClick={() => navigate('/communities/create')} aria-label="Start a club">
                    <Crown className="w-5 h-5 text-muted-foreground" />
                </Button>
            </header>
            <main className="flex-grow max-w-md w-full mx-auto px-4 py-6 space-y-6 mb-16">
                {/* EDIT MODE MODAL: moved to component */}
                <EditProfileModal
                    open={editing}
                    onClose={() => setEditing(false)}
                    editForm={editForm}
                    setEditForm={setEditForm}
                    avatarUploading={avatarUploading}
                    handleAvatarUpload={handleAvatarUpload}
                    handleTagToggle={handleTagToggle}
                    errorMsg={errorMsg}
                    onSave={() => { updateProfile(); }}
                />
                {/* Start your own club banner */}
                {showStartCard && (
                  <div className="rounded-xl border bg-muted/40 p-3 flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">Start your own club</p>
                      <p className="text-xs text-muted-foreground">Lead a community around your passion</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => navigate('/communities/create')}>Start</Button>
                      <Button variant="ghost" size="icon" onClick={() => setShowStartCard(false)} aria-label="Dismiss">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Profile header simple */}
                <ProfileHeaderSimple profile={profile} onEdit={() => setEditing(true)} />

                {/* Invite a friend card */}
                <div className="rounded-2xl border bg-card p-4 flex items-center gap-3">
                  <div className="flex-1">
                    <p className="font-medium">Invite a friend, earn Kelp</p>
                    <p className="text-sm text-muted-foreground">Invite a friend to Kelp and both of you get points.</p>
                  </div>
                  <Button size="sm" onClick={() => navigate('/friends')}>Invite</Button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-3 text-center">
                    <div className="text-lg font-bold text-primary">{profile?.kelp_points ?? 0}</div>
                    <div className="text-xs text-muted-foreground">Kelp Points</div>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 border border-orange-200 p-3 text-center">
                    <div className="text-lg font-bold text-orange-600">{profile?.streak_count ?? 0}</div>
                    <div className="text-xs text-muted-foreground">Day Streak</div>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 p-3 text-center">
                    <div className="text-lg font-bold text-blue-600">{activities?.length || 0}</div>
                    <div className="text-xs text-muted-foreground">Activities</div>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 border border-purple-200 p-3 text-center">
                    <div className="text-lg font-bold text-purple-600">0</div>
                    <div className="text-xs text-muted-foreground">Friends</div>
                  </div>
                </div>

                {/* Weekly Progress Card */}
                <div className="rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-green-800">Weekly CO₂e Progress</h3>
                    <span className="text-sm text-green-600 font-medium">
                      {profile?.co2e_weekly_progress ?? 0} / {profile?.co2e_weekly_goal ?? 0} kg
                    </span>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, ((profile?.co2e_weekly_progress ?? 0) / (profile?.co2e_weekly_goal ?? 1)) * 100)}%`
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-green-700 mt-2">
                    {((profile?.co2e_weekly_progress ?? 0) / (profile?.co2e_weekly_goal ?? 1) * 100).toFixed(0)}% of weekly goal
                  </div>
                </div>

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

                {/* Enhanced Achievements Section */}
                <div className="rounded-2xl bg-card border p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Achievements & Progress</h3>
                  </div>
                  <DynamicAchievements 
                    profile={profile} 
                    activities={activities || []} 
                    badges={badges} 
                  />
                </div>

                {/* Analytics Section */}
                <div className="rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">Your Impact Analytics</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/impact-dashboard')}
                      className="text-xs"
                    >
                      View Full Dashboard
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="rounded-xl bg-white/70 backdrop-blur-sm border p-3">
                      <div className="text-xs text-muted-foreground mb-1">Weekly Impact</div>
                      <div className="text-lg font-bold text-green-600">
                        {profile?.co2e_weekly_progress ?? 0} kg
                      </div>
                      <div className="text-xs text-muted-foreground">CO₂e saved</div>
                    </div>
                    <div className="rounded-xl bg-white/70 backdrop-blur-sm border p-3">
                      <div className="text-xs text-muted-foreground mb-1">Current Streak</div>
                      <div className="text-lg font-bold text-orange-600 flex items-center gap-1">
                        <Leaf className="w-4 h-4" />
                        {profile?.streak_count ?? 0}
                      </div>
                      <div className="text-xs text-muted-foreground">days active</div>
                    </div>
                  </div>
                  <Button 
                    variant="secondary" 
                    className="w-full" 
                    onClick={() => navigate('/log-activity')}
                  >
                    Log New Activity
                  </Button>
                </div>

                {/* Recent Activity */}
                <div className="rounded-2xl bg-card border p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Recent Activity</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate('/log-activity')}
                      className="text-xs"
                    >
                      Add Activity
                    </Button>
                  </div>
                  {activitiesLoading && (
                    <div className="flex justify-center py-8">
                      <LoaderCircle className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  )}
                  {activities && activities.length > 0 ? (
                    <div className="space-y-3">
                      {activities.slice(0, 3).map(item => (
                        <div key={item.id} className="p-3 rounded-xl bg-gradient-to-r from-muted/30 to-muted/10 border border-muted/50">
                          <div className="flex items-center gap-3">
                            {item.emoji && (
                              <span className="text-lg">{item.emoji}</span>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{item.activity}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.carbon_footprint_kg} kg CO₂e • {new Date(item.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-medium text-primary">
                                {item.carbon_footprint_kg > 0 ? '+' : ''}{item.carbon_footprint_kg} kg
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {activities.length > 3 && (
                        <Button 
                          variant="ghost" 
                          className="w-full mt-2" 
                          onClick={() => navigate('/feed')}
                        >
                          View All Activities ({activities.length})
                        </Button>
                      )}
                    </div>
                  ) : (
                    !activitiesLoading && (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                          <Leaf className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground mb-4">No activities yet</p>
                        <Button onClick={() => navigate('/log-activity')}>
                          Log Your First Activity
                        </Button>
                      </div>
                    )
                  )}
                </div>
            </main>
            {renderBottomNav && <BottomNav />}
        </div>
    );
};

export default ProfilePage;
