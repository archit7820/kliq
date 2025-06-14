
import React from 'react';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import BottomNav from '@/components/BottomNav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, LoaderCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ActivityCard from '@/components/ActivityCard';
import { Database } from '@/integrations/supabase/types';

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

    if (profileLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <LoaderCircle className="w-8 h-8 animate-spin text-green-600" />
            </div>
        );
    }
    
    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <p>Could not load profile.</p>
                <Button onClick={() => navigate('/login')} className="mt-4">Go to Login</Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10">
                <h1 className="text-2xl font-bold text-green-700">Profile</h1>
                <div>
                    <Button variant="ghost" size="icon">
                        <Settings className="w-5 h-5" />
                    </Button>
                    <Button onClick={handleLogout} variant="ghost" size="icon" className="text-gray-600 hover:text-red-500 ml-2">
                        <LogOut className="w-5 h-5" />
                    </Button>
                </div>
            </header>
            <main className="flex-grow p-4 md:p-6 space-y-6 mb-16">
                <Card>
                    <CardContent className="pt-6 flex flex-col items-center text-center">
                        <Avatar className="w-24 h-24 mb-4 border-4 border-green-200">
                            <AvatarImage src={profile.avatar_url || undefined} />
                            <AvatarFallback className="text-3xl">{profile.full_name?.charAt(0) || profile.username?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <h2 className="text-2xl font-bold">{profile.full_name || `@${profile.username}`}</h2>
                        <p className="text-gray-500">{user?.email}</p>
                        <div className="flex gap-8 mt-4">
                            <div className="text-center">
                                <p className="font-bold text-xl">{activities?.length || 0}</p>
                                <p className="text-sm text-gray-500">Activities</p>
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-xl">{profile.kelp_points || 0}</p>
                                <p className="text-sm text-gray-500">Kelp Points</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {activitiesLoading && <div className="flex justify-center"><LoaderCircle className="w-6 h-6 animate-spin text-green-600" /></div>}
                        {activities && activities.length > 0 ? (
                            <div className="space-y-8">
                                {activities.map(item => (
                                    <ActivityCard key={item.id} activity={item} profile={item.profile} />
                                ))}
                            </div>
                        ) : (
                            !activitiesLoading && <p className="text-gray-500 text-center">No recent activities to show.</p>
                        )}
                    </CardContent>
                </Card>
            </main>
            <BottomNav />
        </div>
    );
};

export default ProfilePage;
