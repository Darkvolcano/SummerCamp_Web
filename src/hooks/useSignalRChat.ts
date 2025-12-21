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
        // Remove /api suffix from base URL since hub is at root level
        const apiBaseURL = import.meta.env.VITE_API_BASE_URL || 'https://summercampapi-339197681269.asia-southeast1.run.app/api';
        const baseURL = apiBaseURL.replace(/\/api$/, '');
        return `${baseURL}/hubs/chat`;  // Match backend hub path
    };

    // Initialize SignalR connection
    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');

        if (!token) {
            console.warn('[SignalR] No authentication token found for SignalR connection');
            return;
        }

        console.log('[SignalR] Initializing connection to:', getHubUrl());

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(getHubUrl(), {
                accessTokenFactory: () => token,
                withCredentials: false  // Disable credentials to work with CORS wildcard
            })
            .withAutomaticReconnect([0, 2000, 5000, 10000]) // Custom retry delays
            .configureLogging(signalR.LogLevel.Information)
            .build();

        connectionRef.current = connection;

        // Handle incoming messages
        connection.on('ReceiveMessage', (message: ChatRoomMessageDto) => {
            console.log('[SignalR] Received message:', message);
            onMessageReceived(message);
        });

        // Handle connection events
        connection.onclose(() => {
            console.log('[SignalR] Connection closed');
            setIsConnected(false);
            onDisconnected?.();
        });

        connection.onreconnecting(() => {
            console.log('[SignalR] Reconnecting...');
            setIsConnected(false);
        });

        connection.onreconnected(() => {
            console.log('[SignalR] Reconnected successfully');
            setIsConnected(true);
            // Rejoin current room if we were in one
            if (currentRoomId !== null) {
                console.log('[SignalR] Rejoining room after reconnection:', currentRoomId);
                connection.invoke('JoinRoom', currentRoomId.toString()).catch((err: Error) => {
                    console.error('[SignalR] Failed to rejoin room after reconnection:', err);
                });
            }
        });

        // Start connection
        connection
            .start()
            .then(() => {
                console.log('[SignalR] Connection started successfully');
                setIsConnected(true);
                onConnected?.();
            })
            .catch((err: Error) => {
                console.error('[SignalR] Connection error:', err);
                onError?.(err);
            });

        // Cleanup on unmount
        return () => {
            console.log('[SignalR] Cleaning up connection');
            if (connection.state === signalR.HubConnectionState.Connected) {
                connection.stop();
            }
        };
    }, [onMessageReceived, onConnected, onDisconnected, onError]);

    // Join a chat room
    const joinRoom = useCallback(async (roomId: number) => {
        if (!connectionRef.current || connectionRef.current.state !== signalR.HubConnectionState.Connected) {
            console.warn('Cannot join room: SignalR not connected', {
                hasConnection: !!connectionRef.current,
                connectionState: connectionRef.current?.state,
                roomId
            });
            return;
        }

        try {
            // Leave current room if we're in one
            if (currentRoomId !== null && currentRoomId !== roomId) {
                console.log('[SignalR] Leaving room:', currentRoomId);
                await connectionRef.current.invoke('LeaveRoom', currentRoomId.toString());
            }

            // Join new room
            console.log('[SignalR] Joining room:', roomId);
            await connectionRef.current.invoke('JoinRoom', roomId.toString());
            setCurrentRoomId(roomId);
            console.log('[SignalR] Successfully joined room:', roomId);
        } catch (err) {
            console.error('[SignalR] Failed to join room:', roomId, err);
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
