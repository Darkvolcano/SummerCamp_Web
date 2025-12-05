// /**
//  * CHATBOT API USAGE EXAMPLES
//  * 
//  * File này chứa các ví dụ về cách sử dụng chatService
//  * Không cần chạy file này - chỉ để tham khảo
//  */

// import { chatService } from "../../services/chatService";

// // ====================================
// // Example 1: Gửi tin nhắn đầu tiên (cuộc trò chuyện mới)
// // ====================================
// async function exampleNewConversation() {
//     try {
//         // conversationId = null → backend sẽ tạo conversation mới
//         const response = await chatService.sendMessage(
//             "Xin chào! Camp của tôi có những hoạt động gì?",
//             null
//         );

//         console.log("AI Response:", response.textResponse);
//         console.log("Conversation ID:", response.conversationId); // Lưu lại để dùng tiếp
//         console.log("Conversation Title:", response.title);

//         // Output example:
//         // {
//         //   textResponse: "Xin chào! Camp của chúng tôi có rất nhiều hoạt động...",
//         //   conversationId: 123,
//         //   title: "Camp Activities"
//         // }
//     } catch (error) {
//         console.error("Error:", error);
//     }
// }

// // ====================================
// // Example 2: Tiếp tục cuộc trò chuyện
// // ====================================
// async function exampleContinueConversation() {
//     try {
//         const conversationId = 123; // ID từ response trước đó

//         // Gửi tin nhắn tiếp theo trong cùng conversation
//         const response = await chatService.sendMessage(
//             "Cho tôi biết thêm về hoạt động ngoài trời",
//             conversationId
//         );

//         console.log("AI Response:", response.textResponse);
//         // conversationId sẽ giữ nguyên = 123
//     } catch (error) {
//         console.error("Error:", error);
//     }
// }

// // ====================================
// // Example 3: Lấy lịch sử các cuộc trò chuyện
// // ====================================
// async function exampleGetHistory() {
//     try {
//         const conversations = await chatService.getConversationHistory();

//         console.log("All conversations:");
//         conversations.forEach((conv) => {
//             console.log(`[${conv.conversationId}] ${conv.title}`);
//             console.log(`Created at: ${conv.createdAt}`);
//         });

//         // Output example:
//         // [123] Camp Activities
//         // Created at: 2024-01-15T10:30:00Z
//         //
//         // [124] Registration Process
//         // Created at: 2024-01-15T14:20:00Z
//     } catch (error) {
//         console.error("Error:", error);
//     }
// }

// // ====================================
// // Example 4: Xem lại tin nhắn của một cuộc trò chuyện
// // ====================================
// async function exampleGetConversationMessages() {
//     try {
//         const conversationId = 123;
//         const messages = await chatService.getConversationMessages(conversationId);

//         console.log("Conversation messages:");
//         messages.forEach((msg) => {
//             const sender = msg.role === "user" ? "You" : "AI";
//             console.log(`[${sender}]: ${msg.content}`);
//             console.log(`Sent at: ${msg.sentAt}`);
//         });

//         // Output example:
//         // [You]: Xin chào! Camp của tôi có những hoạt động gì?
//         // Sent at: 2024-01-15T10:30:00Z
//         //
//         // [AI]: Xin chào! Camp của chúng tôi có rất nhiều hoạt động...
//         // Sent at: 2024-01-15T10:30:05Z
//     } catch (error) {
//         console.error("Error:", error);
//     }
// }

// // ====================================
// // Example 5: Xóa một cuộc trò chuyện
// // ====================================
// async function exampleDeleteConversation() {
//     try {
//         const conversationId = 123;
//         await chatService.deleteConversation(conversationId);

//         console.log("Conversation deleted successfully");
//     } catch (error: any) {
//         console.error("Error:", error);
//         if (error.response?.status === 404) {
//             console.log("Conversation not found or already deleted");
//         }
//     }
// }

// // ====================================
// // Example 6: Error Handling
// // ====================================
// async function exampleErrorHandling() {
//     try {
//         const response = await chatService.sendMessage("Hello", null);
//         console.log(response);
//     } catch (error: any) {
//         if (error.response) {
//             // Backend trả về lỗi
//             switch (error.response.status) {
//                 case 401:
//                     console.error("Unauthorized - User needs to login");
//                     break;
//                 case 403:
//                     console.error("Forbidden - User doesn't have permission");
//                     break;
//                 case 404:
//                     console.error("Not Found - Conversation doesn't exist");
//                     break;
//                 case 500:
//                     console.error("Server Error - Something went wrong on backend");
//                     break;
//                 default:
//                     console.error("Unknown error:", error.response.data);
//             }
//         } else if (error.request) {
//             // Request được gửi nhưng không nhận được response
//             console.error("Network Error - No response from server");
//         } else {
//             // Lỗi khác
//             console.error("Error:", error.message);
//         }
//     }
// }

// // ====================================
// // Example 7: Complete Chat Flow (như ChatBubble.tsx đang làm)
// // ====================================
// async function exampleCompleteChatFlow() {
//     // Giả sử user đã đăng nhập và có token trong localStorage

//     // 1. Khởi tạo chat mới
//     let conversationId: number | null = null;

//     // 2. User gửi tin nhắn đầu tiên
//     try {
//         const response1 = await chatService.sendMessage(
//             "Tôi muốn đăng ký camp cho con trai tôi",
//             conversationId
//         );

//         console.log("Bot:", response1.textResponse);
//         conversationId = response1.conversationId; // Lưu lại

//         // 3. User gửi tin nhắn tiếp theo
//         const response2 = await chatService.sendMessage(
//             "Con trai tôi 10 tuổi, có camp nào phù hợp không?",
//             conversationId
//         );

//         console.log("Bot:", response2.textResponse);

//         // 4. User muốn bắt đầu topic mới → reset conversationId
//         conversationId = null;

//         const response3 = await chatService.sendMessage(
//             "Cho tôi biết giá của các gói camp",
//             conversationId
//         );

//         console.log("Bot:", response3.textResponse);
//         conversationId = response3.conversationId; // Conversation mới

//     } catch (error) {
//         console.error("Chat flow error:", error);
//     }
// }

// // ====================================
// // Example 8: Using with React State (như trong ChatBubble.tsx)
// // ====================================
// function ReactComponentExample() {
//     /**
//      * Đây là pseudo-code minh họa cách ChatBubble.tsx sử dụng
//      * 
//      * const [messages, setMessages] = useState<Message[]>([]);
//      * const [conversationId, setConversationId] = useState<number | null>(null);
//      * const [isLoading, setIsLoading] = useState(false);
//      * 
//      * const handleSendMessage = async (userInput: string) => {
//      *   // Add user message to UI
//      *   setMessages(prev => [...prev, {
//      *     id: Date.now().toString(),
//      *     role: "user",
//      *     content: userInput,
//      *     timestamp: new Date().toISOString()
//      *   }]);
//      * 
//      *   setIsLoading(true);
//      * 
//      *   try {
//      *     // Call API
//      *     const response = await chatService.sendMessage(userInput, conversationId);
//      * 
//      *     // Update conversationId if new
//      *     if (!conversationId) {
//      *       setConversationId(response.conversationId);
//      *     }
//      * 
//      *     // Add bot message to UI
//      *     setMessages(prev => [...prev, {
//      *       id: (Date.now() + 1).toString(),
//      *       role: "model",
//      *       content: response.textResponse,
//      *       timestamp: new Date().toISOString()
//      *     }]);
//      *   } catch (error) {
//      *     console.error(error);
//      *     // Show error in UI
//      *   } finally {
//      *     setIsLoading(false);
//      *   }
//      * };
//      */
// }

// // ====================================
// // Example 9: DTO Type Reference
// // ====================================
// function typeReference() {
//     /**
//      * ChatRequestDto - Gửi lên backend
//      * {
//      *   conversationId?: number | null,  // Optional, null = new conversation
//      *   message: string                  // Required, max 2000 chars
//      * }
//      * 
//      * ChatResponseDto - Nhận từ backend
//      * {
//      *   textResponse: string,      // AI's reply
//      *   conversationId: number,    // ID to continue conversation
//      *   title: string              // Auto-generated title
//      * }
//      * 
//      * ChatMessageDto - Tin nhắn trong conversation
//      * {
//      *   messageId: number,
//      *   role: "user" | "model",    // Sender type
//      *   content: string,           // Message text
//      *   sentAt: string             // ISO 8601 datetime
//      * }
//      * 
//      * ChatConversationDto - Metadata của conversation
//      * {
//      *   conversationId: number,
//      *   title: string,             // Summary of conversation
//      *   createdAt: string          // ISO 8601 datetime
//      * }
//      */
// }

// // ====================================
// // Notes:
// // ====================================
// /**
//  * 1. Tất cả API calls yêu cầu authentication (JWT Bearer Token)
//  *    → Token tự động được thêm bởi axiosInstance
//  * 
//  * 2. conversationId = null → tạo conversation mới
//  *    conversationId = number → tiếp tục conversation hiện tại
//  * 
//  * 3. Backend tự động validate:
//  *    - Message không được rỗng
//  *    - Message tối đa 2000 ký tự
//  *    - User chỉ có quyền truy cập conversation của mình
//  * 
//  * 4. Response từ AI có thể mất vài giây
//  *    → Nên hiển thị loading indicator (typing animation)
//  * 
//  * 5. localStorage được sử dụng để lưu trữ:
//  *    - chatMessages: Mảng tin nhắn hiện tại
//  *    - chatConversationId: ID của conversation hiện tại
//  *    → Giúp giữ lịch sử khi user đóng/mở chat
//  * 
//  * 6. Khi user logout, localStorage sẽ được clear
//  *    → Xem userService.logout() trong userService.ts
//  */

// export { };
