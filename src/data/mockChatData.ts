// Mock Data for Chat System
// This file contains all mock data for testing the chat UI before API integration

export interface Camp {
    id: number;
    name: string;
}

export interface Staff {
    id: number;
    name: string;
    campId: number;
    avatar?: string;
    role: 'Staff';
}

export interface User {
    id: number;
    name: string;
    campId: number;
    avatar?: string;
    role: 'User';
}

export interface Message {
    id: number;
    senderId: number;
    senderName: string;
    senderRole: 'User' | 'Staff';
    senderAvatar?: string;
    content: string;
    timestamp: Date;
    chatType: 'community' | 'private';
    recipientId?: number; // For private chats
}

export interface PrivateChat {
    id: string;
    userId: number;
    staffId: number;
    lastMessage?: Message;
}

// Mock Camps
export const mockCamps: Camp[] = [
    { id: 1, name: "Camp Alpha" },
    { id: 2, name: "Camp Beta" }
];

// Mock Staff Members
export const mockStaff: Staff[] = [
    {
        id: 1,
        name: "Staff Alice",
        campId: 1,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
        role: 'Staff'
    },
    {
        id: 2,
        name: "Staff Bob",
        campId: 1,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
        role: 'Staff'
    },
    {
        id: 3,
        name: "Staff Charlie",
        campId: 2,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
        role: 'Staff'
    },
    {
        id: 4,
        name: "Staff Diana",
        campId: 2,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Diana",
        role: 'Staff'
    }
];

// Mock Users
export const mockUsers: User[] = [
    {
        id: 100,
        name: "User Emma",
        campId: 1,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
        role: 'User'
    },
    {
        id: 101,
        name: "User Frank",
        campId: 1,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Frank",
        role: 'User'
    },
    {
        id: 102,
        name: "User Grace",
        campId: 2,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Grace",
        role: 'User'
    },
    {
        id: 103,
        name: "User Henry",
        campId: 2,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Henry",
        role: 'User'
    }
];

// Current User (simulates logged-in user)
export const currentUser: User = {
    id: 100,
    name: "User Emma",
    campId: 1,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    role: 'User'
};

// Mock Community Chat Messages
export const mockCommunityMessages: Message[] = [
    {
        id: 1,
        senderId: 1,
        senderName: "Staff Alice",
        senderRole: "Staff",
        senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
        content: "Welcome to Community Camp! 🎉 Feel free to ask any questions here.",
        timestamp: new Date(Date.now() - 3600000 * 24),
        chatType: "community"
    },
    {
        id: 2,
        senderId: 100,
        senderName: "User Emma",
        senderRole: "User",
        senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
        content: "Hi everyone! Excited to be part of this camp!",
        timestamp: new Date(Date.now() - 3600000 * 23),
        chatType: "community"
    },
    {
        id: 3,
        senderId: 3,
        senderName: "Staff Charlie",
        senderRole: "Staff",
        senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
        content: "Hello from Camp Beta! Looking forward to a great summer! ☀️",
        timestamp: new Date(Date.now() - 3600000 * 22),
        chatType: "community"
    },
    {
        id: 4,
        senderId: 101,
        senderName: "User Frank",
        senderRole: "User",
        senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Frank",
        content: "What time does the orientation start?",
        timestamp: new Date(Date.now() - 3600000 * 20),
        chatType: "community"
    },
    {
        id: 5,
        senderId: 2,
        senderName: "Staff Bob",
        senderRole: "Staff",
        senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
        content: "Orientation starts at 9 AM tomorrow. Don't forget to bring your camp materials!",
        timestamp: new Date(Date.now() - 3600000 * 19),
        chatType: "community"
    },
    {
        id: 6,
        senderId: 102,
        senderName: "User Grace",
        senderRole: "User",
        senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Grace",
        content: "Is there a lunch break scheduled?",
        timestamp: new Date(Date.now() - 3600000 * 18),
        chatType: "community"
    },
    {
        id: 7,
        senderId: 4,
        senderName: "Staff Diana",
        senderRole: "Staff",
        senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Diana",
        content: "Yes! Lunch is from 12 PM to 1 PM. We'll have a variety of options available. 🍕",
        timestamp: new Date(Date.now() - 3600000 * 17),
        chatType: "community"
    },
    {
        id: 8,
        senderId: 103,
        senderName: "User Henry",
        senderRole: "User",
        senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Henry",
        content: "Can't wait for the activities! Are there any outdoor games planned?",
        timestamp: new Date(Date.now() - 3600000 * 15),
        chatType: "community"
    },
    {
        id: 9,
        senderId: 1,
        senderName: "Staff Alice",
        senderRole: "Staff",
        senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
        content: "Absolutely! We have soccer, volleyball, and capture the flag scheduled. 🏐⚽",
        timestamp: new Date(Date.now() - 3600000 * 14),
        chatType: "community"
    },
    {
        id: 10,
        senderId: 100,
        senderName: "User Emma",
        senderRole: "User",
        senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
        content: "That sounds amazing! Thank you all for organizing this!",
        timestamp: new Date(Date.now() - 3600000 * 12),
        chatType: "community"
    }
];

// Mock Private Chat Messages
export const mockPrivateMessages: Message[] = [
    {
        id: 101,
        senderId: 100,
        senderName: "User Emma",
        senderRole: "User",
        senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
        content: "Hi! I have a question about the camp schedule.",
        timestamp: new Date(Date.now() - 3600000 * 10),
        chatType: "private",
        recipientId: 1
    },
    {
        id: 102,
        senderId: 1,
        senderName: "Staff Alice",
        senderRole: "Staff",
        senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
        content: "Of course! What would you like to know?",
        timestamp: new Date(Date.now() - 3600000 * 9),
        chatType: "private",
        recipientId: 100
    },
    {
        id: 103,
        senderId: 100,
        senderName: "User Emma",
        senderRole: "User",
        senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
        content: "What activities are planned for week 2?",
        timestamp: new Date(Date.now() - 3600000 * 8),
        chatType: "private",
        recipientId: 1
    },
    {
        id: 104,
        senderId: 1,
        senderName: "Staff Alice",
        senderRole: "Staff",
        senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
        content: "Week 2 includes swimming lessons, arts & crafts, and a field trip to the science museum! 🏊‍♀️🎨🔬",
        timestamp: new Date(Date.now() - 3600000 * 7),
        chatType: "private",
        recipientId: 100
    },
    {
        id: 105,
        senderId: 100,
        senderName: "User Emma",
        senderRole: "User",
        senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
        content: "Perfect! Thank you so much!",
        timestamp: new Date(Date.now() - 3600000 * 6),
        chatType: "private",
        recipientId: 1
    },
    // Conversation with Staff Bob
    {
        id: 201,
        senderId: 100,
        senderName: "User Emma",
        senderRole: "User",
        senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
        content: "Hello! Do I need to bring any special equipment for swimming?",
        timestamp: new Date(Date.now() - 3600000 * 5),
        chatType: "private",
        recipientId: 2
    },
    {
        id: 202,
        senderId: 2,
        senderName: "Staff Bob",
        senderRole: "Staff",
        senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
        content: "Just a swimsuit and towel! We provide goggles and floaties if needed. 🏊",
        timestamp: new Date(Date.now() - 3600000 * 4),
        chatType: "private",
        recipientId: 100
    }
];

// Helper function to get staff for current user's camp
export const getEligibleStaff = (userId: number): Staff[] => {
    const user = mockUsers.find(u => u.id === userId) || currentUser;
    return mockStaff.filter(staff => staff.campId === user.campId);
};

// Helper function to get private messages between two users
export const getPrivateMessages = (userId: number, staffId: number): Message[] => {
    return mockPrivateMessages.filter(
        msg =>
            (msg.senderId === userId && msg.recipientId === staffId) ||
            (msg.senderId === staffId && msg.recipientId === userId)
    );
};

// Helper function to get all private chats for a user
export const getUserPrivateChats = (userId: number): PrivateChat[] => {
    const userMessages = mockPrivateMessages.filter(
        msg => msg.senderId === userId || msg.recipientId === userId
    );

    const staffIds = new Set<number>();
    userMessages.forEach(msg => {
        if (msg.senderId === userId && msg.recipientId) {
            staffIds.add(msg.recipientId);
        } else if (msg.recipientId === userId) {
            staffIds.add(msg.senderId);
        }
    });

    return Array.from(staffIds).map(staffId => {
        const messages = getPrivateMessages(userId, staffId);
        const lastMessage = messages[messages.length - 1];

        return {
            id: `${userId}-${staffId}`,
            userId,
            staffId,
            lastMessage
        };
    });
};

// Helper function to add a new message (mock implementation)
export const addMessage = (message: Omit<Message, 'id' | 'timestamp'>): Message => {
    const newMessage: Message = {
        ...message,
        id: Date.now(),
        timestamp: new Date()
    };

    if (message.chatType === 'community') {
        mockCommunityMessages.push(newMessage);
    } else {
        mockPrivateMessages.push(newMessage);
    }

    return newMessage;
};

// Helper function to get staff by ID
export const getStaffById = (staffId: number): Staff | undefined => {
    return mockStaff.find(staff => staff.id === staffId);
};

// Helper function to get user by ID
export const getUserById = (userId: number): User | undefined => {
    return mockUsers.find(user => user.id === userId);
};

// Helper function to get camp by ID
export const getCampById = (campId: number): Camp | undefined => {
    return mockCamps.find(camp => camp.id === campId);
};
