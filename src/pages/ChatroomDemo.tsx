import React from 'react';
import ChatroomButton from '../components/ChatroomButton';

/**
 * Demo page showing how to use the ChatroomButton component
 * You can add this button to your navbar, homepage, or anywhere else
 */
const ChatroomDemo: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        💬 Chatroom System
                    </h1>
                    <p className="text-lg text-gray-600">
                        Discord-inspired chat for Summer Camp Management
                    </p>
                </div>

                {/* Button Variants Demo */}
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                        Button Variants
                    </h2>

                    <div className="space-y-8">
                        {/* Primary Button */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-3">
                                Primary Button (Default)
                            </h3>
                            <ChatroomButton variant="primary" />
                            <p className="text-xs text-gray-500 mt-2">
                                Use in hero sections or as main call-to-action
                            </p>
                        </div>

                        {/* Secondary Button */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-3">
                                Secondary Button
                            </h3>
                            <ChatroomButton variant="secondary" />
                            <p className="text-xs text-gray-500 mt-2">
                                Use in lists, cards, or as secondary action
                            </p>
                        </div>

                        {/* Icon Button */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-3">
                                Icon Button
                            </h3>
                            <ChatroomButton variant="icon" />
                            <p className="text-xs text-gray-500 mt-2">
                                Use in navbar, header, or compact layouts
                            </p>
                        </div>
                    </div>
                </div>

                {/* Usage Examples */}
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                        Integration Examples
                    </h2>

                    {/* Example 1: Navbar */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-3">
                                1. In Navbar
                            </h3>
                            <div className="bg-gray-900 text-white p-4 rounded-lg flex items-center justify-between">
                                <div className="font-semibold">Summer Camp System</div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm">Home</span>
                                    <span className="text-sm">Camps</span>
                                    <span className="text-sm">About</span>
                                    <ChatroomButton variant="icon" />
                                </div>
                            </div>
                            <pre className="mt-3 bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                                {`<nav>
  <ChatroomButton variant="icon" />
</nav>`}
                            </pre>
                        </div>

                        {/* Example 2: Dashboard Card */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-3">
                                2. In Dashboard Card
                            </h3>
                            <div className="border border-gray-200 rounded-lg p-6">
                                <h4 className="font-semibold text-gray-900 mb-2">
                                    Need Help?
                                </h4>
                                <p className="text-sm text-gray-600 mb-4">
                                    Chat with our staff members anytime
                                </p>
                                <ChatroomButton variant="secondary" />
                            </div>
                            <pre className="mt-3 bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                                {`<div className="card">
  <h4>Need Help?</h4>
  <ChatroomButton variant="secondary" />
</div>`}
                            </pre>
                        </div>

                        {/* Example 3: Hero Section */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-3">
                                3. In Hero Section
                            </h3>
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-8 text-center">
                                <h4 className="text-2xl font-bold mb-2">
                                    Welcome to Summer Camp!
                                </h4>
                                <p className="mb-6 text-blue-100">
                                    Connect with staff and fellow campers
                                </p>
                                <ChatroomButton variant="primary" className="mx-auto" />
                            </div>
                            <pre className="mt-3 bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                                {`<section className="hero">
  <h1>Welcome to Summer Camp!</h1>
  <ChatroomButton variant="primary" />
</section>`}
                            </pre>
                        </div>
                    </div>
                </div>

                {/* Features Overview */}
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                        Chatroom Features
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-semibold">
                                #
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-1">
                                    Community Chat
                                </h4>
                                <p className="text-sm text-gray-600">
                                    Chat with all camp members and staff in one place
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center font-semibold">
                                💬
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-1">
                                    Private Chats
                                </h4>
                                <p className="text-sm text-gray-600">
                                    1-on-1 conversations with your camp staff
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center font-semibold">
                                🏕️
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-1">
                                    Camp-Based Access
                                </h4>
                                <p className="text-sm text-gray-600">
                                    Only chat with staff from your specific camp
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center font-semibold">
                                ⚡
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-1">
                                    Real-Time Ready
                                </h4>
                                <p className="text-sm text-gray-600">
                                    Prepared for WebSocket/SignalR integration
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Start */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-8">
                    <h2 className="text-2xl font-semibold text-blue-900 mb-4">
                        🚀 Quick Start
                    </h2>
                    <ol className="space-y-3 text-blue-800">
                        <li className="flex gap-3">
                            <span className="font-bold">1.</span>
                            <span>Click any button above to navigate to the chatroom</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold">2.</span>
                            <span>Try the community chat to see all users and staff</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold">3.</span>
                            <span>Click "💬 Chat with Staff" to start a private conversation</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold">4.</span>
                            <span>Currently using mock data - ready for API integration!</span>
                        </li>
                    </ol>
                </div>

                {/* Direct Access */}
                <div className="text-center">
                    <div className="inline-flex flex-col items-center gap-4 bg-white rounded-xl shadow-lg p-8">
                        <h3 className="text-xl font-semibold text-gray-900">
                            Ready to chat?
                        </h3>
                        <ChatroomButton variant="primary" />
                        <p className="text-sm text-gray-500">
                            or navigate to <code className="bg-gray-100 px-2 py-1 rounded">/chat</code>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatroomDemo;
