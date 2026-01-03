import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Search, Loader2 } from "lucide-react";
import axiosInstance from '@/api/axios_instance';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface UserResult {
    id: string;
    nom: string;
    prenom: string;
    photo_url?: string;
    role: string;
}

interface DirectoryData {
    [role: string]: UserResult[];
}

interface Etablissement {
    id: string;
    nom: string;
}

export const ContactDirectory = () => {
    const [open, setOpen] = useState(false);
    const [directory, setDirectory] = useState<DirectoryData>({});
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { user } = useAuth();

    // Admin specific state
    const [etablissements, setEtablissements] = useState<Etablissement[]>([]);
    const [selectedEtabId, setSelectedEtabId] = useState<string | null>(null);

    const { startConversation, setActiveConversationId } = useChat();

    // Charger les établissements si admin
    useEffect(() => {
        if (open && user?.role === 'admin') {
            fetchEtablissements();
        } else if (open) {
            fetchDirectory();
        }
    }, [open, user]);

    // Recharger le répertoire quand l'établissement change (pour admin)
    useEffect(() => {
        if (selectedEtabId) {
            fetchDirectory(selectedEtabId);
        }
    }, [selectedEtabId]);

    const fetchEtablissements = async () => {
        try {
            const response = await axiosInstance.get('/etablissements');
            if (response.data && Array.isArray(response.data.data)) {
                setEtablissements(response.data.data);
                if (response.data.data.length > 0) {
                    setSelectedEtabId(response.data.data[0].id);
                }
            }
        } catch (error) {
            console.error("Failed to fetch etablissements", error);
        }
    };

    const fetchDirectory = async (etabId?: string) => {
        setIsLoading(true);
        try {
            const url = etabId ? `/users/directory?etablissement_id=${etabId}` : '/users/directory';
            const response = await axiosInstance.get(url);
            setDirectory(response.data);
        } catch (error) {
            console.error("Failed to fetch directory", error);
        } finally {
            setIsLoading(false);
        }
    };

    const [isSelecting, setIsSelecting] = useState<string | null>(null);

    const handleSelectUser = async (selectedUser: UserResult) => {
        if (isSelecting) return;
        setIsSelecting(selectedUser.id);
        const name = `${selectedUser.prenom} ${selectedUser.nom}`;
        console.log(`DEBUG DIRECTORY: Selecting ${name} (ID: ${selectedUser.id})`);
        const loadingToast = toast.info(`Ouverture de la discussion avec ${name}...`);
        try {
            const conversationId = await startConversation(selectedUser.id);
            console.log(`DEBUG DIRECTORY: API returned conversation ID: ${conversationId}`);
            setActiveConversationId(conversationId);
            setOpen(false);
        } catch (error) {
            console.error("Failed to start conversation", error);
            toast.error("Impossible d'ouvrir la discussion");
        } finally {
            setIsSelecting(null);
        }
    };

    const getRoleLabel = (role: string) => {
        const labels: Record<string, string> = {
            admin: "Administration",
            enseignant: "Enseignants",
            etudiant: "Étudiants",
            directeur: "Direction",
            personnel: "Personnel",
            responsable_pedagogique: "Responsable Pédagogique",
        };
        return labels[role] || role;
    };

    const filteredDirectory = Object.entries(directory).reduce((acc, [role, users]) => {
        const filteredUsers = users.filter(u =>
            u.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.prenom.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (filteredUsers.length > 0) {
            acc[role] = filteredUsers;
        }
        return acc;
    }, {} as DirectoryData);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full bg-primary/10 hover:bg-primary/20 text-primary">
                    <Plus className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] h-[80vh] flex flex-col p-0 gap-0">
                <DialogHeader className="p-4 pb-2 border-b">
                    <DialogTitle>Nouvelle discussion</DialogTitle>
                </DialogHeader>

                <div className="p-4 pb-2 space-y-3">
                    {user?.role === 'admin' && (
                        <Select value={selectedEtabId || ''} onValueChange={setSelectedEtabId}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Choisir un établissement" />
                            </SelectTrigger>
                            <SelectContent>
                                {etablissements.map((etab) => (
                                    <SelectItem key={etab.id} value={etab.id}>
                                        {etab.nom}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher..."
                            className="pl-9 bg-muted/50 border-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1 p-0">
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="pb-4">
                            {Object.entries(filteredDirectory).map(([role, users]) => (
                                <div key={role} className="mb-0">
                                    <div className="px-4 py-2 bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider sticky top-0 backdrop-blur-sm z-10">
                                        {getRoleLabel(role)}
                                        <Badge variant="secondary" className="ml-2 text-[10px] h-4 px-1">{users.length}</Badge>
                                    </div>
                                    <div className="divide-y divide-border/20">
                                        {users.map((user) => (
                                            <button
                                                key={user.id}
                                                disabled={isSelecting !== null}
                                                onClick={() => handleSelectUser(user)}
                                                className={cn(
                                                    "flex items-center gap-3 w-full p-3 px-4 hover:bg-accent/50 transition-colors text-left relative",
                                                    isSelecting === user.id && "bg-accent/30"
                                                )}
                                            >
                                                <Avatar className="h-10 w-10 border border-border/50">
                                                    <AvatarImage src={user.photo_url} />
                                                    <AvatarFallback className="bg-primary/10 text-primary">
                                                        {user.prenom[0]}{user.nom[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-sm text-foreground/90">
                                                        {user.prenom} {user.nom}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {user.role}
                                                    </p>
                                                </div>
                                                {isSelecting === user.id && (
                                                    <Loader2 className="h-4 w-4 animate-spin text-primary absolute right-4" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {Object.keys(filteredDirectory).length === 0 && !isLoading && (
                                <div className="p-8 text-center text-muted-foreground">
                                    <p>Aucun contact trouvé</p>
                                    {user?.role === 'admin' && !selectedEtabId && (
                                        <p className="text-xs mt-2 text-primary">Veuillez sélectionner un établissement</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};
