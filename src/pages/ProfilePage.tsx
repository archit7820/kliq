import React from 'react';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import BottomNav from '@/components/BottomNav';
import { useFriendsCount } from '@/hooks/useFriendsCount';

import { Button } from '@/components/ui/button';
import { LogOut, Settings, LoaderCircle, Award, Leaf, Users, MapPin, Tag, X, Crown, Plus, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
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
import KelpWalletModal from "@/components/KelpWalletModal";

type Activity = Database['public']['Tables']['activities']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type ActivityWithProfile = Activity & { profile: Profile | null };

const ProfilePage = () => {
    const { user } = useAuthStatus();
    const navigate = useNavigate();
    const { friendsCount } = useFriendsCount();

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
            navigate('/auth');
        }
    };

    const [editing, setEditing] = React.useState(false);
    const [showKelpWallet, setShowKelpWallet] = React.useState(false);
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

    // Navigation handlers for stat cards
    const handleStatClick = (statType: string) => {
        switch (statType) {
            case 'kelp':
                setShowKelpWallet(true);
                break;
            case 'streak':
                navigate('/impact-dashboard');
                break;
            case 'activities':
                navigate('/feed');
                break;
            case 'friends':
                navigate('/friends');
                break;
            default:
                break;
        }
    };

    if (profileLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background px-2">
                <LoaderCircle className="w-6 h-6 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background p-3 text-center">
                <p className="text-muted-foreground text-sm">Could not load profile. It might be that you just signed up.</p>
                <p className="text-muted-foreground text-xs mb-3">Try refreshing the page in a bit.</p>
                <Button onClick={() => navigate('/auth')} size="sm">Go to Login</Button>
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
            <header className="bg-card/80 backdrop-blur-sm px-3 py-2 sticky top-0 z-40 flex items-center justify-between border-b">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)} aria-label="Close" className="h-8 w-8 p-0">
                    <X className="w-4 h-4 text-muted-foreground" />
                </Button>
                <h1 className="text-sm font-semibold text-foreground">Profile</h1>
                <Button variant="ghost" size="sm" onClick={() => navigate('/communities/create')} aria-label="Start a club" className="h-8 w-8 p-0">
                    <Crown className="w-4 h-4 text-muted-foreground" />
                </Button>
            </header>
            <main className="flex-grow max-w-sm w-full mx-auto px-3 py-3 space-y-4 mb-16">
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

                {/* Kelp Wallet Modal */}
                <KelpWalletModal
                    open={showKelpWallet}
                    setOpen={setShowKelpWallet}
                    points={profile?.kelp_points ?? 0}
                />

                {/* Enhanced Start Your Own Club Banner */}
                {showStartCard && (
                  <div className="rounded-lg border border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 p-3 flex items-center justify-between shadow-sm">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">Start your own club</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Lead a community around your passion</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <Button 
                        size="sm" 
                        onClick={() => navigate('/communities/create')}
                        className="bg-slate-800 hover:bg-slate-900 text-white font-medium px-3 py-1 text-xs shadow-sm hover:shadow-md transition-all duration-200 border border-slate-700 hover:border-slate-800"
                        aria-label="Navigate to create community page"
                      >
                        Start
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowStartCard(false)} 
                        aria-label="Dismiss start club banner"
                        className="h-6 w-6 p-0 hover:bg-white/80"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Profile header simple */}
                <ProfileHeaderSimple profile={profile} onEdit={() => setEditing(true)} />

                {/* Enhanced Invite a Friend Card */}
                <div className="rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 p-3 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground">Invite a friend, earn Kelp</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Invite a friend to Kelp and both of you get points.</p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => navigate('/friends')}
                    className="bg-slate-800 hover:bg-slate-900 text-white font-medium px-3 py-1 text-xs shadow-sm hover:shadow-md transition-all duration-200 border border-slate-700 hover:border-slate-800"
                    aria-label="Navigate to friends page to invite friends"
                  >
                    Invite
                  </Button>
                </div>

                {/* Enhanced Interactive Stats Grid */}
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => handleStatClick('kelp')}
                    className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-2 text-center hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-primary/30"
                    aria-label="View Kelp Wallet"
                  >
                    <div className="text-lg font-bold text-primary group-hover:text-primary/80 transition-colors">
                      {profile?.kelp_points ?? 0}
                    </div>
                    <div className="text-xs text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
                      Kelp Points
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleStatClick('streak')}
                    className="rounded-lg bg-gradient-to-br from-orange-100 to-orange-50 border border-orange-200 p-2 text-center hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-orange-300"
                    aria-label="View Impact Dashboard"
                  >
                    <div className="text-lg font-bold text-orange-600 group-hover:text-orange-500 transition-colors">
                      {profile?.streak_count ?? 0}
                    </div>
                    <div className="text-xs text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
                      Day Streak
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleStatClick('activities')}
                    className="rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 p-2 text-center hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-300"
                    aria-label="View All Activities"
                  >
                    <div className="text-lg font-bold text-blue-600 group-hover:text-blue-500 transition-colors">
                      {activities?.length || 0}
                    </div>
                    <div className="text-xs text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
                      Activities
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleStatClick('friends')}
                    className="rounded-lg bg-gradient-to-br from-purple-100 to-purple-50 border border-purple-200 p-2 text-center hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-purple-300"
                    aria-label="View Friends Page"
                  >
                    <div className="text-lg font-bold text-purple-600 group-hover:text-purple-500 transition-colors">
                      {friendsCount}
                    </div>
                    <div className="text-xs text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
                      Friends
                    </div>
                  </button>
                </div>

                {/* Enhanced Weekly Progress Card */}
                <div className="rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-green-800 text-sm">Weekly CO₂e Progress</h3>
                    <span className="text-xs text-green-700 font-semibold bg-green-100 px-2 py-0.5 rounded-full">
                      {profile?.co2e_weekly_progress ?? 0} / {profile?.co2e_weekly_goal ?? 0} kg
                    </span>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500 shadow-sm"
                      style={{
                        width: `${Math.min(100, ((profile?.co2e_weekly_progress ?? 0) / (profile?.co2e_weekly_goal ?? 1)) * 100)}%`
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-green-700 font-medium">
                    {((profile?.co2e_weekly_progress ?? 0) / (profile?.co2e_weekly_goal ?? 1) * 100).toFixed(0)}% of weekly goal achieved
                  </div>
                </div>

                <Card>
                    <CardHeader className="p-3">
                        <CardTitle className="flex items-center gap-2 text-sm"><Users className="w-4 h-4 text-primary" /> About Me</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 p-3 pt-0">
                        {profile.location && (
                            <div className="flex items-center gap-2 text-xs">
                                <MapPin className="w-3 h-3 text-muted-foreground" />
                                <span>{profile.location}</span>
                            </div>
                        )}
                        {(profile.lifestyle_tags && profile.lifestyle_tags.length > 0) ? (
                            <div className="flex items-start gap-2 text-xs">
                                <Tag className="w-3 h-3 text-muted-foreground mt-0.5" />
                                <div className="flex flex-wrap gap-1">
                                    {profile.lifestyle_tags.map(tag => (
                                        <div key={tag} className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full text-xs font-medium">
                                            {tag}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : <p className="text-xs text-muted-foreground">No lifestyle tags added yet.</p>}
                        {/* Enhanced Edit Profile Button */}
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full mt-3 bg-slate-800 hover:bg-slate-900 text-white font-medium py-2 shadow-sm hover:shadow-md transition-all duration-200 border border-slate-700 hover:border-slate-800"
                          onClick={() => setEditing(true)}
                          aria-label="Edit your profile information"
                        >
                          <Settings className="w-3 h-3 mr-1" />
                          Edit Profile
                        </Button>
                    </CardContent>
                </Card>

                {/* Enhanced Achievements Section */}
                <div className="rounded-lg bg-card border p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-sm">Achievements & Progress</h3>
                  </div>
                  <DynamicAchievements 
                    profile={profile} 
                    activities={activities || []} 
                    badges={badges} 
                  />
                </div>

                {/* Enhanced Analytics Section with Better Accessibility */}
                <div className="rounded-lg bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-primary/20 p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      Your Impact Analytics
                    </h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/impact-dashboard')}
                      className="bg-slate-700 hover:bg-slate-800 border border-slate-600 hover:border-slate-700 text-white hover:text-white font-medium px-2 py-1 text-xs shadow-sm hover:shadow-md transition-all duration-200"
                      aria-label="Navigate to full impact dashboard"
                    >
                      View Full Dashboard
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="rounded-lg bg-white/90 backdrop-blur-sm border border-green-200 p-3 hover:shadow-sm transition-shadow">
                      <div className="text-xs font-medium text-muted-foreground mb-1">Weekly Impact</div>
                      <div className="text-xl font-bold text-green-600 mb-1">
                        {profile?.co2e_weekly_progress ?? 0} kg
                      </div>
                      <div className="text-xs text-muted-foreground">CO₂e saved</div>
                    </div>
                    <div className="rounded-lg bg-white/90 backdrop-blur-sm border border-orange-200 p-3 hover:shadow-sm transition-shadow">
                      <div className="text-xs font-medium text-muted-foreground mb-1">Current Streak</div>
                      <div className="text-xl font-bold text-orange-600 flex items-center gap-1 mb-1">
                        <Leaf className="w-4 h-4" />
                        {profile?.streak_count ?? 0}
                      </div>
                      <div className="text-xs text-muted-foreground">days active</div>
                    </div>
                  </div>
                  {/* Enhanced Primary CTA Button with Darker Colors */}
                  <Button 
                    variant="default"
                    size="default"
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 text-sm shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border border-slate-700 hover:border-slate-800" 
                    onClick={() => navigate('/log-activity')}
                    aria-label="Log a new environmental activity"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Log New Activity
                  </Button>
                </div>

                {/* Recent Activity */}
                <div className="rounded-lg bg-card border p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm">Recent Activity</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate('/log-activity')}
                      className="text-xs px-2 py-1"
                    >
                      Add Activity
                    </Button>
                  </div>
                  {activitiesLoading && (
                    <div className="flex justify-center py-6">
                      <LoaderCircle className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  )}
                  {activities && activities.length > 0 ? (
                    <div className="space-y-2">
                      {activities.slice(0, 3).map(item => (
                        <div key={item.id} className="p-2 rounded-lg bg-gradient-to-r from-muted/30 to-muted/10 border border-muted/50">
                          <div className="flex items-center gap-2">
                            {item.emoji && (
                              <span className="text-base">{item.emoji}</span>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-xs truncate">{item.activity}</p>
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
                          className="w-full mt-2 text-xs" 
                          onClick={() => navigate('/feed')}
                        >
                          View All Activities ({activities.length})
                        </Button>
                      )}
                    </div>
                  ) : (
                    !activitiesLoading && (
                      <div className="text-center py-6">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted/50 flex items-center justify-center">
                          <Leaf className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground mb-3 text-sm">No activities yet</p>
                        <Button onClick={() => navigate('/log-activity')} size="sm">
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
