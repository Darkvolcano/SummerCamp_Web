import React from "react";

interface ChatMessageProps {
    role: "user" | "model";
    content: string;
    timestamp?: string;
}

export default function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
    const isUser = role === "user";

    // Function to convert URLs in text to clickable links
    const renderContentWithLinks = (text: string) => {
        // Regex to detect URLs (excluding trailing punctuation)
        const urlRegex = /(https?:\/\/[^\s]+?)([.,;:!?)]*)(?=\s|$)/g;
        
        const elements: React.ReactNode[] = [];
        let lastIndex = 0;
        let match;

        // Reset regex state
        urlRegex.lastIndex = 0;

        while ((match = urlRegex.exec(text)) !== null) {
            const fullMatch = match[0];
            const url = match[1];
            const punctuation = match[2];
            const matchStart = match.index;

            // Add text before the URL
            if (matchStart > lastIndex) {
                elements.push(
                    <span key={`text-${lastIndex}`}>
                        {text.substring(lastIndex, matchStart)}
                    </span>
                );
            }

            // Add the URL as a link
            elements.push(
                <a
                    key={`link-${matchStart}`}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`underline font-medium hover:opacity-80 transition-opacity ${
                        isUser ? "text-white" : "text-blue-600"
                    }`}
                >
                    {url}
                </a>
            );

            // Add the punctuation after the link
            if (punctuation) {
                elements.push(
                    <span key={`punct-${matchStart}`}>{punctuation}</span>
                );
            }

            lastIndex = matchStart + fullMatch.length;
        }

        // Add remaining text after the last URL
        if (lastIndex < text.length) {
            elements.push(
                <span key={`text-${lastIndex}`}>
                    {text.substring(lastIndex)}
                </span>
            );
        }

        return elements.length > 0 ? elements : <span>{text}</span>;
    };

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
                    {renderContentWithLinks(content)}
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
