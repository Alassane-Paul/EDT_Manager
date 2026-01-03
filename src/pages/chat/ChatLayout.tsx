import React, { useEffect } from 'react';
import { ConversationList } from '@/components/chat/ConversationList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { AppLayout } from '@/components/layout/AppLayout';
import { ChatProvider } from '@/contexts/ChatContext';
import { useLocation } from 'react-router-dom';
import { useChat } from '@/contexts/ChatContext';

// Wrapper component to handle query params (e.g., start chat with user)
const ChatLayoutInner = () => {
    const location = useLocation();
    const { startConversation, setActiveConversationId } = useChat();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const targetUserId = params.get('user');

        if (targetUserId) {
            startConversation(targetUserId).then(id => {
                setActiveConversationId(id);
            });
        }
    }, [location]);

    return (
        <div className="flex h-[calc(100vh-4rem)] border rounded-lg overflow-hidden bg-background shadow-sm">
            <div className="w-80 border-r hidden md:block">
                <ConversationList />
            </div>
            <div className="flex-1">
                <ChatWindow />
            </div>
        </div>
    );
};

const ChatLayout = () => {
    return (
        <AppLayout>
            <ChatProvider>
                <ChatLayoutInner />
            </ChatProvider>
        </AppLayout>
    );
};

export default ChatLayout;
