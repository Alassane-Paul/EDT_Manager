import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Check, CheckCheck, Trash2 } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';

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
    delivered_at?: string;
    read_at?: string;
    deleted_at?: string;
    is_deleted?: boolean;
}

interface MessageListProps {
    messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
    const { user } = useAuth();
    const bottomRef = useRef<HTMLDivElement>(null);
    const { deleteMessage, acknowledgeDelivery, socket } = useChat();

    // Auto-scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Acknowledge delivery for new incoming messages
    useEffect(() => {
        messages.forEach(msg => {
            if (msg.sender_id !== user?.id && !msg.delivered_at) {
                acknowledgeDelivery(msg.id);
            }
        });
    }, [messages, user?.id, acknowledgeDelivery]);

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
                            {!isMe && isSequential && <div className="w-8" />}

                            <div className={cn(
                                "rounded-2xl px-4 py-2 text-sm shadow-sm relative group",
                                isMe
                                    ? "bg-primary text-primary-foreground rounded-tr-none"
                                    : "bg-muted text-foreground rounded-tl-none",
                                msg.is_deleted && "opacity-50 italic"
                            )}>
                                {isMe && !msg.is_deleted && (
                                    <button
                                        onClick={() => deleteMessage(msg.id)}
                                        className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 p-1 hover:bg-red-50 rounded"
                                        title="Supprimer"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                )}
                                <p>{msg.content}</p>
                                <div className={cn(
                                    "text-[10px] mt-1 opacity-70 flex items-center gap-1",
                                    isMe ? "justify-end" : "justify-start"
                                )}>
                                    {format(new Date(msg.created_at), 'HH:mm', { locale: fr })}
                                    {isMe && !msg.is_deleted && (
                                        <div className="flex items-center ml-1">
                                            {msg.read_at ? (
                                                <div title={`Lu à ${format(new Date(msg.read_at), 'HH:mm')}`}>
                                                    <CheckCheck className="h-3 w-3 text-blue-400" />
                                                </div>
                                            ) : msg.delivered_at ? (
                                                <div title={`Distribué à ${format(new Date(msg.delivered_at), 'HH:mm')}`}>
                                                    <CheckCheck className="h-3 w-3 text-slate-300" />
                                                </div>
                                            ) : (
                                                <Check className="h-3 w-3 text-slate-300" />
                                            )}
                                        </div>
                                    )}
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
