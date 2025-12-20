import { useEffect, useRef, useCallback, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import type { ChatRoomMessageDto } from '../services/chatRoomService';

interface UseSignalRChatOptions {
    onMessageReceived: (message: ChatRoomMessageDto) => void;
    onConnected?: () => void;
    onDisconnected?: () => void;
    onError?: (error: Error) => void;
}

export const useSignalRChat = (options: UseSignalRChatOptions) => {
    const { onMessageReceived, onConnected, onDisconnected, onError } = options;
    const connectionRef = useRef<signalR.HubConnection | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [currentRoomId, setCurrentRoomId] = useState<number | null>(null);

    // Get API base URL from axios config or environment
    const getHubUrl = () => {
        const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7179';
        return `${baseURL}/hubs/chatroom`;
    };

    // Initialize SignalR connection
    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');

        if (!token) {
            console.warn('No authentication token found for SignalR connection');
            return;
        }

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(getHubUrl(), {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        connectionRef.current = connection;

        // Handle incoming messages
        connection.on('ReceiveMessage', (message: ChatRoomMessageDto) => {
            onMessageReceived(message);
        });

        // Handle connection events
        connection.onclose(() => {
            setIsConnected(false);
            onDisconnected?.();
        });

        connection.onreconnecting(() => {
            setIsConnected(false);
        });

        connection.onreconnected(() => {
            setIsConnected(true);
            // Rejoin current room if we were in one
            if (currentRoomId !== null) {
                connection.invoke('JoinRoom', currentRoomId.toString()).catch(err => {
                    console.error('Failed to rejoin room after reconnection:', err);
                });
            }
        });

        // Start connection
        connection
            .start()
            .then(() => {
                setIsConnected(true);
                onConnected?.();
            })
            .catch((err) => {
                console.error('SignalR connection error:', err);
                onError?.(err);
            });

        // Cleanup on unmount
        return () => {
            if (connection.state === signalR.HubConnectionState.Connected) {
                connection.stop();
            }
        };
    }, [onMessageReceived, onConnected, onDisconnected, onError]);

    // Join a chat room
    const joinRoom = useCallback(async (roomId: number) => {
        if (!connectionRef.current || connectionRef.current.state !== signalR.HubConnectionState.Connected) {
            console.warn('Cannot join room: SignalR not connected');
            return;
        }

        try {
            // Leave current room if we're in one
            if (currentRoomId !== null && currentRoomId !== roomId) {
                await connectionRef.current.invoke('LeaveRoom', currentRoomId.toString());
            }

            // Join new room
            await connectionRef.current.invoke('JoinRoom', roomId.toString());
            setCurrentRoomId(roomId);
        } catch (err) {
            console.error('Failed to join room:', err);
            onError?.(err as Error);
        }
    }, [currentRoomId, onError]);

    // Leave current room
    const leaveRoom = useCallback(async () => {
        if (!connectionRef.current || currentRoomId === null) {
            return;
        }

        try {
            await connectionRef.current.invoke('LeaveRoom', currentRoomId.toString());
            setCurrentRoomId(null);
        } catch (err) {
            console.error('Failed to leave room:', err);
        }
    }, [currentRoomId]);

    return {
        isConnected,
        joinRoom,
        leaveRoom,
        currentRoomId
    };
};
