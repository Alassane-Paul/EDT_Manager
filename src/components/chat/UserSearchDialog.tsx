import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Search, Loader2 } from "lucide-react";
import axiosInstance from '@/api/axios_instance';
import { useChat } from '@/contexts/ChatContext';

interface UserResult {
    id: string;
    nom: string;
    prenom: string;
    photo_url?: string;
    role: string;
}

export const UserSearchDialog = () => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<UserResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const { startConversation, setActiveConversationId } = useChat();

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length >= 2) {
                performSearch(query);
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const performSearch = async (q: string) => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get(`/users/search?q=${encodeURIComponent(q)}`);
            setResults(response.data);
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectUser = async (user: UserResult) => {
        try {
            const conversationId = await startConversation(user.id);
            setActiveConversationId(conversationId);
            setOpen(false);
            setQuery('');
            setResults([]);
        } catch (error) {
            console.error("Failed to start conversation", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                    <Plus className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Nouvelle conversation</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher un utilisateur..."
                            className="pl-9"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="max-h-[300px] overflow-y-auto space-y-2">
                    {isLoading && (
                        <div className="flex justify-center p-4">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    )}

                    {!isLoading && results.length === 0 && query.length >= 2 && (
                        <p className="text-center text-sm text-muted-foreground py-4">
                            Aucun utilisateur trouvé
                        </p>
                    )}

                    {results.map((user) => (
                        <button
                            key={user.id}
                            onClick={() => handleSelectUser(user)}
                            className="flex items-center gap-3 w-full p-2 hover:bg-accent rounded-lg transition-colors text-left"
                        >
                            <Avatar>
                                <AvatarImage src={user.photo_url} />
                                <AvatarFallback>{user.prenom[0]}{user.nom[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="font-medium text-sm">{user.prenom} {user.nom}</p>
                                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
};
