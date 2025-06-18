
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MessageSquare, User, Sparkles, Zap } from 'lucide-react';
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
        <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
            <header className="bg-white shadow-sm border-b p-4 flex items-center gap-3 sticky top-0 z-20">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-gray-100">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                    <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500 ml-auto">
                    <Sparkles className="w-4 h-4" />
                    <span>AI-enhanced</span>
                </div>
            </header>

            <main className="flex-grow p-6 max-w-2xl mx-auto w-full">
                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <Card key={i}>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-4 animate-pulse">
                                        <div className="w-12 h-12 bg-gray-200 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-200 rounded w-1/3" />
                                            <div className="h-3 bg-gray-200 rounded w-1/2" />
                                        </div>
                                        <div className="h-3 bg-gray-200 rounded w-12" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : !conversations || conversations.length === 0 ? (
                    <Card className="border-dashed border-2 border-gray-200">
                        <CardContent className="p-12 text-center">
                            <div className="p-4 bg-blue-100 rounded-full w-fit mx-auto mb-6">
                                <MessageSquare className="w-12 h-12 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">No conversations yet</h2>
                            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                                Start meaningful conversations with friends who share your interests and values.
                            </p>
                            <div className="flex items-center justify-center gap-2 mb-4 text-sm text-gray-400">
                                <Zap className="w-4 h-4" />
                                <span>AI will help suggest conversation starters</span>
                            </div>
                            <Button onClick={() => navigate('/friends')} className="bg-blue-600 hover:bg-blue-700">
                                Find Friends to Chat With
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {conversations.map((convo) => (
                            <Link 
                                to={`/chat/${convo.other_user_id}`} 
                                key={convo.other_user_id} 
                                className="block"
                            >
                                <Card className="hover:shadow-md transition-all duration-200 hover:scale-[1.01]">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-12 w-12 border-2 border-gray-100">
                                                <AvatarImage src={convo.avatar_url || undefined} />
                                                <AvatarFallback className="bg-gray-100">
                                                    {convo.full_name?.charAt(0) || <User className="w-6 h-6 text-gray-400" />}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="font-medium text-gray-900 truncate">
                                                        {convo.full_name || convo.username}
                                                    </h3>
                                                    <div className="flex items-center gap-2 shrink-0 ml-2">
                                                        {convo.unread_count > 0 && (
                                                            <Badge className="bg-blue-600 text-white text-xs px-2 py-1">
                                                                {String(convo.unread_count)}
                                                            </Badge>
                                                        )}
                                                        <span className="text-xs text-gray-400">
                                                            {convo.last_message_at ? formatDistanceToNow(new Date(convo.last_message_at), { addSuffix: true }) : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-500 truncate">
                                                    {convo.last_message_content || "No messages yet"}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MessagesPage;
