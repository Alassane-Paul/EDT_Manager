import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    type: 'TEXT' | 'IMAGE' | 'FILE';
    created_at: string;
    sender?: {
        id: string;
        nom: string;
        prenom: string;
        photo_url?: string;
    };
}

interface MessageListProps {
    messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
    const { user } = useAuth();
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const getInitials = (prenom: string, nom: string) => {
        return `${prenom?.[0] || ''}${nom?.[0] || ''}`.toUpperCase();
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => {
                const isMe = msg.sender_id === user?.id;
                const isSequential = index > 0 && messages[index - 1].sender_id === msg.sender_id;

                return (
                    <div
                        key={msg.id}
                        className={cn(
                            "flex w-full",
                            isMe ? "justify-end" : "justify-start"
                        )}
                    >
                        <div className={cn(
                            "flex max-w-[70%] gap-2",
                            isMe ? "flex-row-reverse" : "flex-row"
                        )}>
                            {!isMe && !isSequential && (
                                <Avatar className="h-8 w-8 mt-1">
                                    <AvatarImage src={msg.sender?.photo_url} />
                                    <AvatarFallback>{getInitials(msg.sender?.prenom || '', msg.sender?.nom || '')}</AvatarFallback>
                                </Avatar>
                            )}
                            {!isMe && isSequential && <div className="w-8" />} {/* Spacer */}

                            <div className={cn(
                                "rounded-2xl px-4 py-2 text-sm shadow-sm",
                                isMe
                                    ? "bg-primary text-primary-foreground rounded-tr-none"
                                    : "bg-muted text-foreground rounded-tl-none"
                            )}>
                                <p>{msg.content}</p>
                                <div className={cn(
                                    "text-[10px] mt-1 opacity-70",
                                    isMe ? "text-right" : "text-left"
                                )}>
                                    {format(new Date(msg.created_at), 'HH:mm', { locale: fr })}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
            <div ref={bottomRef} />
        </div>
    );
};
