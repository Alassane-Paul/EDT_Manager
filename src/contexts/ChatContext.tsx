import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { toast } from 'react-toastify';
import axiosInstance from '@/api/axios_instance';
import { playMessageSound } from '@/utils/notificationSound';

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
    delivered_at?: string;
    read_at?: string;
    deleted_at?: string;
    is_deleted?: boolean;
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
        delivered_at?: string;
        read_at?: string;
        is_deleted?: boolean;
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
    deleteMessage: (messageId: string) => Promise<void>;
    acknowledgeDelivery: (messageId: string) => Promise<void>;
    sendTypingIndicator: (conversationId: string, isTyping: boolean) => void;
    searchMessages: (query: string) => Promise<Message[]>;
    onlineUsers: Set<string>;
    typingStates: Record<string, { userId: string, userName: string, isTyping: boolean }>;
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
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
    const [typingStates, setTypingStates] = useState<Record<string, { userId: string, userName: string, isTyping: boolean }>>({});

    // Initialisation Socket Listeners
    useEffect(() => {
        if (!socket || !user) return;

        // Ensure we handle our specific room join if needed, or rely on SocketContext
        // SocketContext joins generic "user.id" room.
        // Our backend emits to `user_${p.utilisateur_id}` for notifications. 
        // We probably need to join `user_${user.id}` strictly or update backend to emit to `user.id`.
        // Let's explicitly join our notification room here to be safe and specific.
        socket.emit('join_user_room', user.id);
        socket.emit('get_online_users');

        const handleOnlineUsersList = (users: string[]) => {
            console.log('DEBUG CHAT: Received initial online users list:', users);
            setOnlineUsers(new Set(users));
        };

        const handleUserStatusChange = (data: { userId: string, status: 'online' | 'offline' }) => {
            console.log(`DEBUG CHAT: User ${data.userId} changed status to ${data.status}`);
            setOnlineUsers(prev => {
                const updated = new Set(prev);
                if (data.status === 'online') {
                    updated.add(data.userId);
                } else {
                    updated.delete(data.userId);
                }
                return updated;
            });
        };

        const handleNewMessageNotification = (data: { conversationId: string, message: Message }) => {
            setConversations(prev => {
                const index = prev.findIndex(c => c.id === data.conversationId);
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
                        is_read: false,
                        delivered_at: data.message.delivered_at,
                        read_at: data.message.read_at
                    },
                    updated_at: new Date().toISOString()
                };

                return updated.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
            });

            if (data.message.sender_id !== user.id) {
                if (activeConversationId !== data.conversationId) {
                    playMessageSound();
                    toast.info(`Nouveau message de ${data.message.sender?.prenom || 'Utilisateur'}`);
                } else {
                    markAsRead(data.conversationId);
                }
            }
        };

        const handleMessageDelivered = (data: { messageId: string, delivered_at: string }) => {
            console.log(`DEBUG CHAT: Message ${data.messageId} delivered`);
            setConversations(prev => prev.map(c => {
                if (c.last_message && c.last_message.sender_id === user.id) {
                    // We don't have messageId in last_message preview easily, 
                    // but we can assume if the latest message is from us and undelivered, it's this one.
                    return {
                        ...c,
                        last_message: { ...c.last_message, delivered_at: data.delivered_at }
                    };
                }
                return c;
            }));
        };

        const handleMessagesRead = (data: { conversation_id: string, reader_id: string, read_at: string }) => {
            console.log(`DEBUG CHAT: Messages in ${data.conversation_id} read by ${data.reader_id}`);
            setConversations(prev => prev.map(c => {
                if (c.id === data.conversation_id) {
                    const newUnread = data.reader_id === user.id ? 0 : c.unread_count;
                    const updatedLast = c.last_message && c.last_message.sender_id === user.id ?
                        { ...c.last_message, is_read: true, read_at: data.read_at } : c.last_message;

                    return { ...c, unread_count: newUnread, last_message: updatedLast };
                }
                return c;
            }));
        };

        const handleMessageDeleted = (data: { messageId: string, conversation_id: string }) => {
            console.log(`DEBUG CHAT: Message ${data.messageId} deleted`);
            setConversations(prev => prev.map(c => {
                if (c.id === data.conversation_id && c.last_message) {
                    // In a real app we'd check if messageId matches last_message.id
                    return { ...c, last_message: { ...c.last_message, content: "Ce message a été supprimé", is_deleted: true } };
                }
                return c;
            }));
        };

        const handleTypingEvent = (data: { conversationId: string, userId: string, userName: string, isTyping: boolean }) => {
            if (data.userId === user.id) return;
            setTypingStates(prev => ({
                ...prev,
                [data.conversationId]: data
            }));
        };

        socket.on('new_message_notification', handleNewMessageNotification);
        socket.on('online_users_list', handleOnlineUsersList);
        socket.on('user_status_change', handleUserStatusChange);
        socket.on('message_delivered', handleMessageDelivered);
        socket.on('messages_read', handleMessagesRead);
        socket.on('message_deleted', handleMessageDeleted);
        socket.on('user_typing_sidebar', handleTypingEvent);
        socket.on('user_typing', handleTypingEvent);

        return () => {
            socket.off('new_message_notification', handleNewMessageNotification);
            socket.off('online_users_list', handleOnlineUsersList);
            socket.off('user_status_change', handleUserStatusChange);
            socket.off('message_delivered', handleMessageDelivered);
            socket.off('messages_read', handleMessagesRead);
            socket.off('message_deleted', handleMessageDeleted);
            socket.off('user_typing_sidebar', handleTypingEvent);
            socket.off('user_typing', handleTypingEvent);
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
            // refreshConversations() is removed as the socket will trigger the update for the sidebar
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

    const deleteMessage = async (messageId: string) => {
        try {
            await axiosInstance.delete(`/chat/messages/${messageId}`);
            // The socket listener or local refresh will handle UI
        } catch (error) {
            console.error("Failed to delete message", error);
            toast.error("Échec de la suppression");
        }
    };

    const acknowledgeDelivery = async (messageId: string) => {
        try {
            await axiosInstance.post(`/chat/messages/${messageId}/delivered`);
        } catch (error) {
            // Silently fail for delivery ack as it's a background quality of life feature
            console.error("Failed to ack delivery", error);
        }
    };

    const sendTypingIndicator = (conversationId: string, isTyping: boolean) => {
        if (!socket || !user) return;
        socket.emit('typing', {
            conversationId,
            userId: user.id,
            userName: user.firstName,
            isTyping
        });
    };

    const searchMessages = async (query: string): Promise<Message[]> => {
        try {
            const response = await axiosInstance.get('/chat/messages/search', { params: { query } });
            return response.data;
        } catch (error) {
            console.error("Search failed", error);
            return [];
        }
    };

    const contextValue: ChatContextType = {
        socket,
        isConnected,
        conversations,
        activeConversationId,
        setActiveConversationId,
        refreshConversations,
        markAsRead,
        sendMessage,
        startConversation,
        deleteMessage,
        acknowledgeDelivery,
        sendTypingIndicator,
        searchMessages,
        onlineUsers,
        typingStates
    };

    return (
        <ChatContext.Provider value={contextValue}>
            {children}
        </ChatContext.Provider>
    );
};
