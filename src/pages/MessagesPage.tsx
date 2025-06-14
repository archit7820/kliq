
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LoaderCircle, MessageSquare, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const MessagesPage = () => {
    const navigate = useNavigate();
    const { data: conversations, isLoading } = useQuery({
        queryKey: ['conversations'],
        queryFn: async () => {
            const { data, error } = await supabase.rpc('get_user_conversations');
            if (error) throw error;
            return data;
        },
    });

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white/80 shadow-sm p-4 flex items-center gap-2 sticky top-0 z-20 backdrop-blur-sm">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft />
                </Button>
                <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Messages</h1>
            </header>
            <main className="flex-grow">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full p-8">
                        <LoaderCircle className="w-8 h-8 animate-spin text-green-600" />
                    </div>
                ) : !conversations || conversations.length === 0 ? (
                    <div className="text-center p-8 mt-16 flex flex-col items-center">
                        <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
                        <h2 className="text-xl font-semibold text-gray-600">No Messages Yet</h2>
                        <p className="text-gray-400 mt-2">Start a conversation with a friend from the friends page.</p>
                        <Button className="mt-6" onClick={() => navigate('/friends')}>Find Friends</Button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {conversations.map((convo) => (
                            <Link to={`/chat/${convo.other_user_id}`} key={convo.other_user_id} className="flex items-center gap-4 p-4 hover:bg-gray-100 transition-colors duration-150">
                                <Avatar className="h-12 w-12 border">
                                    <AvatarImage src={convo.avatar_url || undefined} />
                                    <AvatarFallback>
                                        {convo.full_name?.charAt(0) || <User />}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <p className="font-semibold text-gray-800 truncate">{convo.full_name || convo.username}</p>
                                        <p className="text-xs text-gray-400 shrink-0 ml-2">{convo.last_message_at ? formatDistanceToNow(new Date(convo.last_message_at), { addSuffix: true }) : ''}</p>
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                        <p className="text-sm text-gray-500 truncate">{convo.last_message_content}</p>
                                        {convo.unread_count > 0 && (
                                            <span className="bg-green-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                                {String(convo.unread_count)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MessagesPage;
