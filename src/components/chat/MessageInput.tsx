import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Image as ImageIcon, Paperclip } from "lucide-react";

interface MessageInputProps {
    onSend: (content: string, type: 'TEXT' | 'IMAGE' | 'FILE') => void;
    disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSend, disabled }) => {
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;
        onSend(message, 'TEXT');
        setMessage('');
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border-t bg-background flex items-center gap-2">
            <Button type="button" size="icon" variant="ghost" className="text-muted-foreground" disabled={disabled}>
                <Paperclip className="h-5 w-5" />
            </Button>
            <Input
                placeholder="Écrivez votre message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={disabled}
                className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!message.trim() || disabled}>
                <Send className="h-4 w-4" />
            </Button>
        </form>
    );
};
