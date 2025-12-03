import { VIDEOSDK_CONFIG } from "../config/videosdk.config";

const videoSDKService = {
  createRoom: async (): Promise<string> => {
    console.log("[videoSDKService] Creating new room");
    console.log("[videoSDKService] Token:", VIDEOSDK_CONFIG.authToken?.substring(0, 20) + "...");
    
    const res = await fetch(`${VIDEOSDK_CONFIG.apiEndpoint}/rooms`, {
      method: "POST",
      headers: {
        authorization: VIDEOSDK_CONFIG.authToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
    
    let responseData: any;
    const contentType = res.headers.get("content-type");
    
    try {
      if (contentType?.includes("application/json")) {
        responseData = await res.json();
      } else {
        const textResponse = await res.text();
        responseData = { message: textResponse };
      }
    } catch {
      responseData = { message: await res.text() };
    }
    
    console.log("[videoSDKService] Response:", responseData);
    console.log("[videoSDKService] Status:", res.status, res.statusText);
    
    if (!res.ok) {
      console.error("[videoSDKService] Create room failed:", {
        status: res.status,
        response: responseData,
      });
      
      // Fallback for testing when VideoSDK API fails
      console.warn("[videoSDKService] Using fallback random roomId");
      return "test-room-" + Math.random().toString(36).substring(7);
    }
    
    const { roomId } = responseData;
    
    if (!roomId) {
      throw new Error("No roomId in response");
    }
    
    console.log("[videoSDKService] Room created:", roomId);
    return roomId;
  },

  validateRoom: async (roomId: string): Promise<boolean> => {
    console.log("[videoSDKService] Validating room:", roomId);
    try {
      const res = await fetch(
        `${VIDEOSDK_CONFIG.apiEndpoint}/rooms/validate/${roomId}`,
        {
          headers: {
            authorization: VIDEOSDK_CONFIG.authToken,
          },
        }
      );
      return res.ok;
    } catch (error) {
      console.error("[videoSDKService] Validation error:", error);
      return false;
    }
  },
};

export default videoSDKService;
