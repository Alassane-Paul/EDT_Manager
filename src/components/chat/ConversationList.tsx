import React from 'react';
import { useChat } from '@/contexts/ChatContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from "@/components/ui/badge";
import { ContactDirectory } from './ContactDirectory';

export const ConversationList = () => {
    const { conversations, activeConversationId, setActiveConversationId, markAsRead } = useChat();

    const handleSelect = (id: string, unread: number) => {
        setActiveConversationId(id);
        if (unread > 0) {
            markAsRead(id);
        }
    };

    return (
        <div className="flex flex-col h-full border-r bg-muted/10">
            <div className="p-4 border-b flex items-center justify-between">
                <h2 className="font-semibold text-lg">Messages</h2>
                <ContactDirectory />
            </div>
            <div className="overflow-y-auto flex-1">
                {conversations.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                        Aucune conversation
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {conversations.map((conv) => (
                            <button
                                key={conv.id}
                                onClick={() => handleSelect(conv.id, conv.unread_count)}
                                className={cn(
                                    "flex items-center gap-3 p-4 text-left hover:bg-accent/50 transition-colors border-b border-border/40",
                                    activeConversationId === conv.id && "bg-accent"
                                )}
                            >
                                <div className="relative">
                                    <Avatar>
                                        <AvatarImage src={conv.photo} />
                                        <AvatarFallback>{conv.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    {conv.unread_count > 0 && (
                                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 rounded-full bg-red-50">
                                            {conv.unread_count}
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className="font-medium truncate">{conv.name}</span>
                                        {conv.last_message && (
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                                                {formatDistanceToNow(new Date(conv.last_message.created_at), { addSuffix: true, locale: fr })}
                                            </span>
                                        )}
                                    </div>
                                    <p className={cn(
                                        "text-xs truncate",
                                        conv.unread_count > 0 ? "text-foreground font-medium" : "text-muted-foreground"
                                    )}>
                                        {conv.last_message ? (
                                            <>
                                                {conv.last_message.sender_id !== 'ME' && ""}
                                                {conv.last_message.content}
                                            </>
                                        ) : (
                                            <span className="italic opacity-50">Nouvelle conversation</span>
                                        )}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
