import React, { useState, useRef, useEffect } from 'react';
import ChatMessageBubble from './ChatMessageBubble';

// Updated Message interface to match API structure
interface Message {
    id: number;
    senderId: number;
    senderName: string;
    senderRole: string;
    senderAvatar?: string;
    content: string;
    timestamp: Date;
}

interface ChatAreaProps {
    messages: Message[];
    chatTitle: string;
    chatSubtitle?: string;
    onSendMessage?: (content: string) => void;
    disabled?: boolean;
}

const ChatArea: React.FC<ChatAreaProps> = ({
    messages,
    chatTitle,
    chatSubtitle,
    onSendMessage,
    disabled = false
}) => {
    const [messageInput, setMessageInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [messageInput]);

    const handleSendMessage = () => {
        if (messageInput.trim() && onSendMessage) {
            onSendMessage(messageInput.trim());
            setMessageInput('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Chat Header */}
            <div className="flex-shrink-0 h-16 border-b border-gray-200 px-6 flex items-center shadow-sm">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        {chatTitle.startsWith('#') ? (
                            <>
                                <span className="text-gray-500">#</span>
                                <span>{chatTitle.slice(1)}</span>
                            </>
                        ) : (
                            <span>{chatTitle}</span>
                        )}
                    </h2>
                    {chatSubtitle && (
                        <p className="text-xs text-gray-500 mt-0.5">{chatSubtitle}</p>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <div className="text-center">
                            <div className="text-4xl mb-3">💬</div>
                            <p className="text-sm">No messages yet</p>
                            <p className="text-xs mt-1">Be the first to start the conversation!</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((message) => (
                            <ChatMessageBubble
                                key={message.id}
                                message={message}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Message Input Area */}
            <div className="flex-shrink-0 border-t border-gray-200 p-4 bg-gray-50">
                <div className="flex items-end gap-3">
                    <div className="flex-1 relative">
                        <textarea
                            ref={textareaRef}
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={`Message ${chatTitle}`}
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg resize-none text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            rows={1}
                            style={{ maxHeight: '120px', minHeight: '48px' }}
                            disabled={disabled}
                        />
                        {/* Character count (optional) */}
                        {messageInput.length > 0 && (
                            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                                {messageInput.length}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim() || disabled}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-5 h-5"
                        >
                            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                        </svg>
                    </button>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                    Press Enter to send, Shift + Enter for new line
                </div>
            </div>
        </div>
    );
};

export default ChatArea;
