import { useState, useRef, useEffect } from "react";
import { chatService } from "../../services/chatService";
import ChatMessage from "./ChatMessage";

interface Message {
    id: string;
    role: "user" | "model";
    content: string;
    timestamp: string;
}

export default function ChatBubble() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Load messages from localStorage when component mounts
    useEffect(() => {
        const savedMessages = localStorage.getItem("chatMessages");
        const savedConversationId = localStorage.getItem("chatConversationId");

        if (savedMessages) {
            setMessages(JSON.parse(savedMessages));
        }
        if (savedConversationId) {
            setConversationId(parseInt(savedConversationId));
        }
    }, []);

    // Save messages to localStorage whenever they change
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem("chatMessages", JSON.stringify(messages));
        }
    }, [messages]);

    // Save conversationId to localStorage whenever it changes
    useEffect(() => {
        if (conversationId !== null) {
            localStorage.setItem("chatConversationId", conversationId.toString());
        }
    }, [conversationId]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: inputMessage.trim(),
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputMessage("");
        setIsLoading(true);
        setError(null);

        try {
            const response = await chatService.sendMessage(
                userMessage.content,
                conversationId
            );

            // Update conversationId if this is a new conversation
            if (!conversationId && response.conversationId) {
                setConversationId(response.conversationId);
            }

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "model",
                content: response.textResponse,
                timestamp: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (err: any) {
            console.error("Error sending message:", err);

            let errorMessage = "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.";

            if (err.response?.status === 401) {
                errorMessage = "Bạn cần đăng nhập để sử dụng chatbot.";
            } else if (err.response?.status === 500) {
                errorMessage = "Lỗi server. Vui lòng thử lại sau.";
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleNewConversation = () => {
        setMessages([]);
        setConversationId(null);
        setError(null);
        localStorage.removeItem("chatMessages");
        localStorage.removeItem("chatConversationId");
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
        setError(null);
    };

    return (
        <>
            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 w-[calc(100vw-2rem)] sm:w-[400px] max-w-[400px] h-[calc(100vh-8rem)] sm:h-[600px] max-h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-[9999] transition-all duration-300 ease-in-out animate-in slide-in-from-bottom-4 fade-in overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-400 to-yellow-400 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-t-2xl flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg
                                    className="w-5 h-5 sm:w-6 sm:h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                                    />
                                </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-base sm:text-lg truncate">Summer Camp Bot</h3>
                                <p className="text-xs text-white/80 truncate">Trợ lý AI của bạn</p>
                            </div>
                        </div>
                        <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                            {/* New Conversation Button */}
                            <button
                                onClick={handleNewConversation}
                                className="w-8 h-8 sm:w-9 sm:h-9 hover:bg-white/20 active:bg-white/30 rounded-lg flex items-center justify-center transition-all touch-manipulation group"
                                title="Bắt đầu cuộc trò chuyện mới"
                                aria-label="Bắt đầu cuộc trò chuyện mới"
                            >
                                <svg
                                    className="w-5 h-5 sm:w-5 sm:h-5 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2.5}
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                            </button>
                            {/* Close Button */}
                            <button
                                onClick={toggleChat}
                                className="w-8 h-8 sm:w-9 sm:h-9 hover:bg-white/20 active:bg-white/30 rounded-lg flex items-center justify-center transition-all touch-manipulation group"
                                aria-label="Đóng chat"
                                title="Đóng chat"
                            >
                                <svg
                                    className="w-5 h-5 sm:w-5 sm:h-5 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2.5}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Messages Container */}
                    <div
                        ref={chatContainerRef}
                        className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400"
                    >
                        {messages.length === 0 && !isLoading && (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 px-4">
                                <svg
                                    className="w-14 h-14 sm:w-16 sm:h-16 mb-3 sm:mb-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                    />
                                </svg>
                                <p className="text-center text-sm leading-relaxed">
                                    Xin chào! Tôi là trợ lý AI của Summer Camp.
                                    <br />
                                    Hãy hỏi tôi bất cứ điều gì!
                                </p>
                            </div>
                        )}

                        {messages.map((message) => (
                            <ChatMessage
                                key={message.id}
                                role={message.role}
                                content={message.content}
                                timestamp={message.timestamp}
                            />
                        ))}

                        {/* Loading Indicator */}
                        {isLoading && (
                            <div className="flex justify-start transition-opacity duration-300 ease-in">
                                <div className="bg-gray-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                                    <div className="flex gap-1.5">
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0ms]"></div>
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:150ms]"></div>
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:300ms]"></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm transition-opacity duration-300 ease-in">
                                <div className="flex items-start gap-2">
                                    <svg
                                        className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <span className="flex-1 leading-relaxed">{error}</span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-gray-200 p-3 sm:p-4 bg-white rounded-b-2xl flex-shrink-0">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Nhập tin nhắn..."
                                disabled={isLoading}
                                autoComplete="off"
                                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm placeholder:text-gray-400 transition-shadow"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputMessage.trim() || isLoading}
                                className="bg-gradient-to-r from-orange-400 to-yellow-400 hover:from-orange-500 hover:to-yellow-500 text-white px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-300 transition-all flex items-center justify-center flex-shrink-0 touch-manipulation shadow-md"
                                title="Gửi tin nhắn"
                                aria-label="Gửi tin nhắn"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                    />
                                </svg>
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 text-center hidden sm:block">
                            Nhấn Enter để gửi tin nhắn
                        </p>
                    </div>
                </div>
            )}

            {/* Chat Bubble Button */}
            <button
                onClick={toggleChat}
                className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-orange-400 to-yellow-400 text-white rounded-full shadow-2xl hover:shadow-orange-500/50 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center z-[9999] touch-manipulation ${isOpen ? "" : "animate-bounce"
                    }`}
                title="Chat với AI"
                aria-label="Mở chat AI"
            >
                {isOpen ? (
                    <svg
                        className="w-6 h-6 sm:w-7 sm:h-7 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                ) : (
                    <svg
                        className="w-6 h-6 sm:w-7 sm:h-7"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                    </svg>
                )}
            </button>
        </>
    );
}
