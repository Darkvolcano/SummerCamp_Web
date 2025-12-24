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
      
      // Throw error with detailed message
      const errorMessage = responseData?.message || responseData?.error || "Failed to create VideoSDK room";
      throw new Error(`VideoSDK API Error (${res.status}): ${errorMessage}`);
    }
    
    const { roomId } = responseData;
    
    if (!roomId) {
      console.error("[videoSDKService] No roomId in response:", responseData);
      throw new Error("VideoSDK API returned no roomId");
    }
    
    console.log("[videoSDKService] Room created successfully:", roomId);
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
