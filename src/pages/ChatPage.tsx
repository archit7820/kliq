
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Send, User, MessageCircle, Sparkles, MoreVertical } from 'lucide-react';
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
            // Invalidate messages query to force refetch and always show latest message
            queryClient.invalidateQueries({ queryKey: ['messages', friendId] });
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
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading conversation...</p>
                </div>
            </div>
        );
    }
    
    if (profileError || !friendProfile) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card>
                    <CardContent className="p-8 text-center">
                        <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-lg font-medium text-gray-900 mb-2">User not found</h2>
                        <p className="text-gray-500 mb-4">Could not load this user's profile.</p>
                        <Button onClick={() => navigate(-1)}>Go Back</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b p-4 flex items-center gap-3 sticky top-0 z-20">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-gray-100">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <Link to={`/profile/${friendId}`} className="flex items-center gap-3 flex-1">
                    <Avatar className="h-10 w-10 border-2 border-gray-100">
                        <AvatarImage src={friendProfile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-gray-100">
                            {friendProfile?.full_name?.charAt(0) || <User className="w-5 h-5 text-gray-400" />}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <h2 className="font-semibold text-gray-900 truncate">
                            {friendProfile?.full_name || friendProfile?.username}
                        </h2>
                        <p className="text-sm text-gray-500 truncate">@{friendProfile?.username}</p>
                    </div>
                </Link>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Sparkles className="w-3 h-3" />
                        <span>AI</span>
                    </div>
                    <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
                {messagesError && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="p-4 text-center text-red-600">
                            Could not load messages. Please try again.
                        </CardContent>
                    </Card>
                )}
                
                {messages?.length === 0 && !messagesError && (
                    <Card className="border-dashed border-2 border-gray-200">
                        <CardContent className="p-8 text-center">
                            <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                                <MessageCircle className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="font-medium text-gray-900 mb-2">Start the conversation</h3>
                            <p className="text-sm text-gray-500 mb-4">Send the first message to begin chatting!</p>
                            <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                                <Sparkles className="w-3 h-3" />
                                <span>AI suggestions coming soon</span>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {messages?.map((msg) => (
                    <div key={msg.id} className={`flex items-end gap-3 ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender_id !== user?.id && (
                            <Avatar className="h-8 w-8 border">
                                <AvatarImage src={friendProfile?.avatar_url || undefined} />
                                <AvatarFallback className="bg-gray-100 text-xs">
                                    {friendProfile?.full_name?.charAt(0) || 'F'}
                                </AvatarFallback>
                            </Avatar>
                        )}
                        <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-sm ${
                            msg.sender_id === user?.id
                                ? 'bg-blue-600 text-white rounded-br-md'
                                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                        }`}>
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </main>

            <footer className="fixed bottom-[65px] left-0 right-0 z-40 bg-white border-t p-4">
                <div className="max-w-2xl mx-auto">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 rounded-full border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            autoComplete="off"
                            disabled={sendMessageMutation.isPending}
                        />
                        <Button 
                            type="submit" 
                            size="icon" 
                            className="rounded-full bg-blue-600 hover:bg-blue-700 shrink-0 w-10 h-10"
                            disabled={sendMessageMutation.isPending || !newMessage.trim()}
                        >
                            {sendMessageMutation.isPending ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                        </Button>
                    </form>
                </div>
            </footer>
        </div>
    );
};

export default ChatPage;
