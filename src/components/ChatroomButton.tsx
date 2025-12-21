import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PagePath } from '../enums/page-path.enum';

interface ChatroomButtonProps {
    className?: string;
    variant?: 'primary' | 'secondary' | 'icon';
}

/**
 * Reusable button component to navigate to the chatroom
 * Can be placed in navbar, sidebar, or anywhere in the app
 */
const ChatroomButton: React.FC<ChatroomButtonProps> = ({
    className = '',
    variant = 'primary'
}) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(PagePath.CHAT);
    };

    if (variant === 'icon') {
        return (
            <button
                onClick={handleClick}
                className={`relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors ${className}`}
                title="Open Chat"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                </svg>
                {/* Notification badge (optional) */}
                {/* <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" /> */}
            </button>
        );
    }

    if (variant === 'secondary') {
        return (
            <button
                onClick={handleClick}
                className={`px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors flex items-center gap-2 ${className}`}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                        clipRule="evenodd"
                    />
                </svg>
                <span>Chat</span>
            </button>
        );
    }

    // Primary variant (default)
    return (
        <button
            onClick={handleClick}
            className={`px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2 ${className}`}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
            >
                <path
                    fillRule="evenodd"
                    d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                    clipRule="evenodd"
                />
            </svg>
            <span>Open Chat</span>
        </button>
    );
};

export default ChatroomButton;
