
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, User, LoaderCircle, MessageCircle } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Message = Tables<'direct_messages'>;

const ChatPage = () => {
    const { userId: friendId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStatus();
    const queryClient = useQueryClient();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch friend's profile
    const { data: friendProfile, isLoading: isLoadingProfile, error: profileError } = useQuery({
        queryKey: ['profile', friendId],
        queryFn: async () => {
            if (!friendId) return null;
            const { data, error } = await supabase.from('profiles').select('*').eq('id', friendId).maybeSingle();
            if (error) throw error;
            return data;
        },
        enabled: !!friendId,
    });

    // Correct: use nested and/or in or= for correct DM filter.
    const { data: messages, isLoading: isLoadingMessages, error: messagesError } = useQuery({
        queryKey: ['messages', friendId],
        queryFn: async () => {
            if (!user || !friendId) return [];
            // Fixed the query syntax for .or()
            const { data, error } = await supabase
                .from('direct_messages')
                .select('*')
                .or(`and(sender_id.eq.${user.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${user.id})`)
                .order('created_at', { ascending: true });
            if (error) throw error;
            return data;
        },
        enabled: !!user && !!friendId,
    });

    const sendMessageMutation = useMutation({
        mutationFn: async (content: string) => {
            if (!user || !friendId) throw new Error('User or friend not defined');
            const { data, error } = await supabase.from('direct_messages').insert({
                sender_id: user.id,
                receiver_id: friendId,
                content: content,
            }).select();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            setNewMessage('');
        },
    });

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Real-time sync
    useEffect(() => {
        if (!user || !friendId) return;
        const handleRealtime = (payload: any, direction: string) => {
            queryClient.setQueryData(['messages', friendId], (oldData: Message[] | undefined) => {
                if (oldData?.find(m => m.id === payload.new.id)) return oldData;
                return [...(oldData || []), payload.new];
            });
        };
        const channelSent = supabase
            .channel(`dm-sent-${user.id}-${friendId}`)
            .on<Message>('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'direct_messages',
                filter: `sender_id=eq.${user.id},receiver_id=eq.${friendId}`,
            }, (payload) => handleRealtime(payload, "sent"))
            .subscribe();
        const channelReceived = supabase
            .channel(`dm-received-${friendId}-${user.id}`)
            .on<Message>('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'direct_messages',
                filter: `sender_id=eq.${friendId},receiver_id=eq.${user.id}`,
            }, (payload) => handleRealtime(payload, "received"))
            .subscribe();
        return () => {
            supabase.removeChannel(channelSent);
            supabase.removeChannel(channelReceived);
        };
    }, [user, friendId, queryClient]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            sendMessageMutation.mutate(newMessage.trim());
        }
    };

    // Loading/Error states
    if (isLoadingProfile || isLoadingMessages) {
        return <div className="flex justify-center items-center h-screen"><LoaderCircle className="w-8 h-8 animate-spin text-green-600" /><span className="ml-4 text-green-700">Loading...</span></div>;
    }
    if (profileError) {
        return <div className="flex flex-col justify-center items-center h-screen text-red-500">Error loading friend's profile.</div>;
    }
    if (!friendProfile) {
        return <div className="flex flex-col justify-center items-center h-screen text-gray-400">
            <MessageCircle className="w-10 h-10 mb-3"/>
            Could not load this user’s profile.
        </div>;
    }

    // Adjust mobile chat page to add space for BottomNav (h-0 and pb-24/pb-28 for safe area).
    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <header className="bg-white/80 shadow-sm p-3 flex items-center gap-3 sticky top-0 z-20 backdrop-blur-sm border-b">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft />
                </Button>
                <Link to={`/profile/${friendId}`} className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border">
                        <AvatarImage src={friendProfile?.avatar_url || undefined} />
                        <AvatarFallback>{friendProfile?.full_name?.charAt(0) || <User />}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="font-bold text-gray-800">{friendProfile?.full_name || friendProfile?.username}</h2>
                        <p className="text-xs text-gray-500">@{friendProfile?.username}</p>
                    </div>
                </Link>
            </header>
            <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-32"> {/* pb-32 ensures the input is always visible above BottomNav */}
                {messagesError && (
                  <div className="text-center text-red-500">Could not load messages.</div>
                )}
                {messages?.length === 0 && (
                  <div className="flex flex-col items-center justify-center mt-24 text-gray-400">
                    <MessageCircle className="w-12 h-12 mb-2"/>
                    <span>No messages yet. Start a conversation!</span>
                  </div>
                )}
                {messages?.map((msg) => (
                    <div key={msg.id} className={`flex items-end gap-2 ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender_id !== user?.id && (
                            <Avatar className="h-8 w-8 self-end">
                                <AvatarImage src={friendProfile?.avatar_url || undefined} />
                                <AvatarFallback>{friendProfile?.full_name?.charAt(0) || 'F'}</AvatarFallback>
                            </Avatar>
                        )}
                        <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${msg.sender_id === user?.id ? 'bg-green-500 text-white rounded-br-lg' : 'bg-white text-gray-800 rounded-bl-lg border'}`}>
                            <p>{msg.content}</p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </main>
            {/* Make the footer sticky above the bottom nav. */}
            <footer
              className="fixed bottom-[65px] left-0 right-0 z-40 bg-white border-t flex items-center p-4"
              style={{ maxWidth: '100vw' }}
            >
                <form onSubmit={handleSendMessage} className="flex items-center gap-2 w-full">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 rounded-full"
                        autoComplete="off"
                    />
                    <Button type="submit" size="icon" className="rounded-full bg-green-600 hover:bg-green-700" disabled={sendMessageMutation.isPending}>
                        <Send className="w-5 h-5" />
                    </Button>
                </form>
            </footer>
        </div>
    );
};

export default ChatPage;

