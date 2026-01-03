import React, { useEffect, useState } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreVertical, Phone, Video } from "lucide-react";
import axiosInstance from '@/api/axios_instance';
import { Skeleton } from "@/components/ui/skeleton";

export const ChatWindow = () => {
    const { activeConversationId, conversations, sendMessage, socket } = useChat();
    const [messages, setMessages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const activeConversation = conversations.find(c => c.id === activeConversationId);

    // Si on a l'ID mais pas encore les données (nouvelle discussion en cours de sync)
    const displayName = activeConversation?.name || "Nouvelle discussion";
    const displayPhoto = activeConversation?.photo;
    const initials = displayName.slice(0, 2).toUpperCase();

    useEffect(() => {
        if (!activeConversationId) return;

        const fetchMessages = async () => {
            setIsLoading(true);
            try {
                const response = await axiosInstance.get(`/chat/conversations/${activeConversationId}/messages`);
                setMessages(response.data.messages);
            } catch (error) {
                console.error("Error fetching messages", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMessages();

        // Join socket room
        socket?.emit('join_conversation', activeConversationId);

        return () => {
            socket?.emit('leave_conversation', activeConversationId);
        };
    }, [activeConversationId, socket]);

    // Listen for real-time messages
    useEffect(() => {
        if (!socket || !activeConversationId) return;

        const handleNewMessage = (message: any) => {
            // Only append if it belongs to this conversation
            if (message.conversation_id === activeConversationId) {
                setMessages(prev => [...prev, message]);
            }
        };

        socket.on('receive_message', handleNewMessage);

        return () => {
            socket.off('receive_message', handleNewMessage);
        };
    }, [socket, activeConversationId]);

    const handleSend = async (content: string, type: 'TEXT' | 'IMAGE' | 'FILE') => {
        if (!activeConversationId) return;
        // Optimistic UI could be here, but we wait for now
        await sendMessage(activeConversationId, content, type);
    };

    if (!activeConversationId) {
        return (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Sélectionnez une conversation pour commencer
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <div className="border-b p-4 flex items-center justify-between bg-card/50 backdrop-blur">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={displayPhoto} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-semibold">{displayName}</h3>
                        <p className="text-xs text-muted-foreground">Discussion</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon"><Phone className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon"><Video className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button>
                </div>
            </div>

            {/* Messages */}
            {isLoading ? (
                <div className="p-4 space-y-4">
                    <Skeleton className="h-10 w-[70%]" />
                    <Skeleton className="h-10 w-[60%] ml-auto" />
                    <Skeleton className="h-10 w-[50%]" />
                </div>
            ) : (
                <MessageList messages={messages} />
            )}

            {/* Input */}
            <MessageInput onSend={handleSend} />
        </div>
    );
};
