interface ChatMessageProps {
    role: "user" | "model";
    content: string;
    timestamp?: string;
}

export default function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
    const isUser = role === "user";

    return (
        <div
            className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3 sm:mb-4 transition-opacity duration-300 ease-in`}
        >
            <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 shadow-sm ${isUser
                    ? "bg-gradient-to-r from-orange-400 to-yellow-400 text-white rounded-br-none"
                    : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                    }`}
            >
                {/* Message Content */}
                <div className="text-[13px] sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {content}
                </div>

                {/* Timestamp */}
                {timestamp && (
                    <div
                        className={`text-[10px] sm:text-xs mt-1 ${isUser ? "text-white/80" : "text-gray-500"
                            }`}
                    >
                        {new Date(timestamp).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
