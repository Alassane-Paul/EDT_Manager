import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { toast } from 'react-toastify';
import axiosInstance from '@/api/axios_instance';

interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    type: 'TEXT' | 'IMAGE' | 'FILE';
    is_read: boolean;
    created_at: string;
    sender?: {
        id: string;
        nom: string;
        prenom: string;
        photo_url?: string;
    };
}

interface Conversation {
    id: string;
    type: 'DIRECT' | 'GROUP';
    name: string;
    photo?: string;
    unread_count: number;
    last_message?: {
        content: string;
        created_at: string;
        sender_id: string;
        is_read: boolean;
    };
    participants: any[]; // Simplified for now
    updated_at: string;
}

interface ChatContextType {
    socket: Socket | null;
    isConnected: boolean;
    conversations: Conversation[];
    activeConversationId: string | null;
    setActiveConversationId: (id: string | null) => void;
    refreshConversations: () => void;
    markAsRead: (conversationId: string) => void;
    sendMessage: (conversationId: string, content: string, type?: 'TEXT' | 'IMAGE' | 'FILE') => Promise<void>;
    startConversation: (targetUserId: string) => Promise<string>; // Returns conversation ID
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const { socket, isConnected } = useSocket();

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

    // Initialisation Socket Listeners
    useEffect(() => {
        if (!socket || !user) return;

        // Ensure we handle our specific room join if needed, or rely on SocketContext
        // SocketContext joins generic "user.id" room.
        // Our backend emits to `user_${p.utilisateur_id}` for notifications. 
        // We probably need to join `user_${user.id}` strictly or update backend to emit to `user.id`.
        // Let's explicitly join our notification room here to be safe and specific.
        socket.emit('join_user_room', user.id);

        const handleNewMessageNotification = (data: { conversationId: string, message: Message }) => {
            setConversations(prev => {
                const index = prev.findIndex(c => c.id === data.conversationId);
                // Si la conversation n'existe pas localement, on recharge tout
                if (index === -1) {
                    refreshConversations();
                    return prev;
                }

                const updated = [...prev];
                const existing = updated[index];

                updated[index] = {
                    ...existing,
                    unread_count: existing.id === activeConversationId ? existing.unread_count : existing.unread_count + 1,
                    last_message: {
                        content: data.message.content,
                        created_at: data.message.created_at,
                        sender_id: data.message.sender_id,
                        is_read: false
                    },
                    updated_at: new Date().toISOString()
                };

                return updated.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
            });

            if (activeConversationId !== data.conversationId) {
                toast.info(`Nouveau message de ${data.message.sender?.prenom || 'Utilisateur'}`);
            }
        };

        socket.on('new_message_notification', handleNewMessageNotification);

        return () => {
            socket.off('new_message_notification', handleNewMessageNotification);
        };
    }, [socket, user, activeConversationId]);

    // Chargement initial des conversations
    useEffect(() => {
        if (user) {
            refreshConversations();
        }
    }, [user]);

    const refreshConversations = async () => {
        try {
            const response = await axiosInstance.get('/chat/conversations');
            setConversations(response.data);
        } catch (error: any) {
            console.error("Failed to fetch conversations", error);
            if (error.response?.data) {
                console.error("Backend Error Details:", error.response.data);
            }
        }
    };

    const markAsRead = async (conversationId: string) => {
        try {
            await axiosInstance.post(`/chat/conversations/${conversationId}/read`);
            setConversations(prev => prev.map(c =>
                c.id === conversationId ? { ...c, unread_count: 0 } : c
            ));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const sendMessage = async (conversationId: string, content: string, type: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT') => {
        try {
            await axiosInstance.post(`/chat/conversations/${conversationId}/messages`, { content, type });
            refreshConversations();
        } catch (error: any) {
            console.error("Failed to send message", error);
            if (error.response?.data) {
                console.error("Backend Error Details (Send):", error.response.data);
            }
            toast.error("Échec de l'envoi du message");
            throw error;
        }
    };

    const startConversation = async (targetUserId: string): Promise<string> => {
        console.log(`DEBUG CHAT_CONTEXT: startConversation called for ${targetUserId}`);
        const response = await axiosInstance.post('/chat/conversations', { targetUserId });
        const { id } = response.data;
        console.log(`DEBUG CHAT_CONTEXT: Received ID ${id} from server`);
        // Toujours rafraîchir pour être sûr d'avoir les métadonnées fraîches dans le state
        await refreshConversations();
        console.log(`DEBUG CHAT_CONTEXT: Refresh complete, returning ${id}`);
        return id;
    };

    return (
        <ChatContext.Provider value={{
            socket,
            isConnected,
            conversations,
            activeConversationId,
            setActiveConversationId,
            refreshConversations,
            markAsRead,
            sendMessage,
            startConversation
        }}>
            {children}
        </ChatContext.Provider>
    );
};
