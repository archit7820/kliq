
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, User, LoaderCircle } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Message = Tables<'direct_messages'>;

const ChatPage = () => {
    const { userId: friendId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStatus();
    const queryClient = useQueryClient();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { data: friendProfile, isLoading: isLoadingProfile } = useQuery({
        queryKey: ['profile', friendId],
        queryFn: async () => {
            if (!friendId) return null;
            const { data, error } = await supabase.from('profiles').select('*').eq('id', friendId).single();
            if (error) throw error;
            return data;
        },
        enabled: !!friendId,
    });

    const { data: messages, isLoading: isLoadingMessages } = useQuery({
        queryKey: ['messages', friendId],
        queryFn: async () => {
            if (!user || !friendId) return [];
            const { data, error } = await supabase
                .from('direct_messages')
                .select('*')
                .or(`(sender_id.eq.${user.id},receiver_id.eq.${friendId}),(sender_id.eq.${friendId},receiver_id.eq.${user.id})`)
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
    
    useEffect(() => {
        if (!user || !friendId) return;

        const channel = supabase
            .channel(`dm-${[user.id, friendId].sort().join('-')}`)
            .on<Message>('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'direct_messages',
                filter: `or(and(sender_id.eq.${user.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${user.id}))`
            }, (payload) => {
                queryClient.setQueryData(['messages', friendId], (oldData: Message[] | undefined) => {
                    const existingMessage = oldData?.find(m => m.id === payload.new.id);
                    if (existingMessage) return oldData;
                    return [...(oldData || []), payload.new];
                });
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, friendId, queryClient]);


    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            sendMessageMutation.mutate(newMessage.trim());
        }
    };
    
    if (isLoadingProfile || isLoadingMessages) {
        return <div className="flex justify-center items-center h-screen"><LoaderCircle className="w-8 h-8 animate-spin text-green-600" /></div>;
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <header className="bg-white/80 shadow-sm p-3 flex items-center gap-3 sticky top-0 z-20 backdrop-blur-sm border-b">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft />
                </Button>
                <Link to={`/profile/${friendId}`} className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border">
                        <AvatarImage src={friendProfile?.avatar_url || undefined} />
                        <AvatarFallback>{friendProfile?.full_name?.charAt(0) || <User/>}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="font-bold text-gray-800">{friendProfile?.full_name || friendProfile?.username}</h2>
                        <p className="text-xs text-gray-500">@{friendProfile?.username}</p>
                    </div>
                </Link>
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-4">
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

            <footer className="p-4 bg-white border-t">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
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
