import React, { useState, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from "@/components/ui/badge";
import { ContactDirectory } from './ContactDirectory';
import { Check, CheckCheck, Search, X } from 'lucide-react';
import { Input } from "@/components/ui/input";

export const ConversationList = () => {
    const { conversations, activeConversationId, setActiveConversationId, markAsRead, onlineUsers, typingStates, searchMessages } = useChat();
    const { user: currentUser } = useAuth();

    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim().length >= 2) {
                setIsSearching(true);
                const results = await searchMessages(searchQuery);
                setSearchResults(results);
            } else {
                setIsSearching(false);
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, searchMessages]);

    const handleSelect = (id: string, unread: number) => {
        setActiveConversationId(id);
        if (unread > 0) {
            markAsRead(id);
        }
        if (isSearching) {
            setSearchQuery('');
            setIsSearching(false);
        }
    };

    return (
        <div className="flex flex-col h-full border-r bg-muted/10">
            <div className="p-4 border-b flex items-center justify-between bg-card/30">
                <h2 className="font-semibold text-lg">Messages</h2>
                <ContactDirectory />
            </div>

            <div className="p-3 border-b">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher un message..."
                        className="pl-9 h-9 bg-muted/50 border-none focus-visible:ring-1"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            <div className="overflow-y-auto flex-1">
                {isSearching ? (
                    <div className="flex flex-col">
                        <div className="p-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Résultats de recherche
                        </div>
                        {searchResults.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground text-sm">
                                Aucun message trouvé pour "{searchQuery}"
                            </div>
                        ) : (
                            searchResults.map((msg) => (
                                <button
                                    key={msg.id}
                                    onClick={() => handleSelect(msg.conversation_id, 0)}
                                    className={cn(
                                        "flex flex-col gap-1 p-4 text-left hover:bg-accent/50 transition-colors border-b border-border/40",
                                        activeConversationId === msg.conversation_id && "bg-accent/30"
                                    )}
                                >
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-xs font-semibold text-primary">
                                            {msg.sender?.prenom} {msg.sender?.nom}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">
                                            {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: fr })}
                                        </span>
                                    </div>
                                    <p className="text-sm line-clamp-2">
                                        {msg.content}
                                    </p>
                                    <div className="text-[10px] text-muted-foreground italic flex items-center gap-1">
                                        <span>Dans:</span>
                                        <span className="truncate max-w-[150px]">
                                            {msg.conversation?.name || "Discussion directe"}
                                        </span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                ) : conversations.length === 0 ? (
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
                                    {/* Online indicator */}
                                    {conv.type === 'DIRECT' && conv.participants.some(p => p.id !== currentUser?.id && onlineUsers.has(p.id)) && (
                                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full" title="En ligne" />
                                    )}
                                    {conv.unread_count > 0 && (
                                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 rounded-full bg-primary text-primary-foreground font-bold">
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
                                        "text-xs truncate flex items-center gap-1",
                                        conv.unread_count > 0 ? "text-foreground font-medium" : "text-muted-foreground"
                                    )}>
                                        {typingStates[conv.id]?.isTyping ? (
                                            <span className="text-primary animate-pulse italic">
                                                {typingStates[conv.id].userName} est en train d'écrire...
                                            </span>
                                        ) : conv.last_message ? (
                                            <>
                                                {conv.last_message.sender_id === currentUser?.id && !conv.last_message.is_deleted && (
                                                    <span className="flex-shrink-0">
                                                        {conv.last_message.read_at ? (
                                                            <CheckCheck className="h-3.5 w-3.5 text-blue-400" />
                                                        ) : conv.last_message.delivered_at ? (
                                                            <CheckCheck className="h-3.5 w-3.5 text-slate-300" />
                                                        ) : (
                                                            <Check className="h-3.5 w-3.5 text-slate-300" />
                                                        )}
                                                    </span>
                                                )}
                                                <span className="truncate">{conv.last_message.content}</span>
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
