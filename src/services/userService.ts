/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import axiosInstance from "../config/axios";
import { useMutation } from "@tanstack/react-query";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, messaging } from "../config/firebase";
import { getToken } from "firebase/messaging";

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  token: string;
}

export interface GoogleLoginDto {
  idToken: string;
}

export interface RegisterDto {
  fullName: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
  password: string;
}

export interface ForgorPasswordDto {
  email: string;
}

export interface VerifyOTPDto {
  email: string;
  otp: string;
}

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

interface User {
  id: number;
  fullName: string;
  email: string;
  phone_number: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  error: string | null;
  login: (values: LoginDto) => Promise<{
    success: boolean;
    message: string;
  }>;
  googleLogin: () => Promise<{
    success: boolean;
    message: string;
  }>;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const loadStoredAuth = () => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    return {
      user: storedUser ? JSON.parse(storedUser) : null,
      token: storedToken || null,
      error: null,
    };
  };

  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.warn("Notification permission not granted");
        return null;
      }
      return permission;
    } catch (err) {
      console.error("Error requesting notification permission:", err);
      return null;
    }
  };

  const registerServiceWorker = async () => {
    try {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js",
          {
            scope: "/firebase-cloud-messaging-push-scope",
          }
        );
        console.log("Service Worker registered:", registration);
        return registration;
      } else {
        console.warn("Service Worker is not supported in this browser.");
        return null;
      }
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      return null;
    }
  };

  return {
    ...loadStoredAuth(),

    login: async (values: LoginDto) => {
      try {
        const response = await axiosInstance.post("auth/login", values, {
          headers: { "Content-Type": "application/json" },
        });

        const data = response.data;
        if (data.token) {
          const decoded = jwtDecode<{
            id: number;
            role: string;
            fullName: string;
            email: string;
            phone_number: string;
          }>(data.token);

          const user = {
            id: decoded.id,
            fullName: decoded.fullName,
            email: decoded.email,
            phone_number: decoded.phone_number,
          };

          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("token", data.token);

          await registerServiceWorker();

          // Request notification permission before fetching FCM token
          const permission = await requestNotificationPermission();
          let fcmToken: string | null = null;
          if (permission === "granted") {
            fcmToken = await getToken(messaging, {
              vapidKey:
                "BOYKZ4MFMfEBL8WJTLid1bmd-m0Hbq8Aru3jlJTbylPWiHpdxyiKlhU97BtPw3K44Uyn4BLqzzVmsptNvwatdRI",
            }).catch((err) => {
              console.error("Lỗi khi lấy fcmToken:", err);
              return null;
            });
          }

          if (fcmToken) {
            console.log("FCM Token:", fcmToken); // Log fcmToken ra console
            // Optional: Send fcmToken to server
            // await axiosInstance.post("auth/update-fcm-token", { fcmToken });
          }

          set({ user, token: data.token, error: null });
          return {
            success: true,
            message: data.message,
          };
        } else {
          const errorMessage = data.message;
          set({ error: errorMessage });
          return { success: false, message: errorMessage };
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          const errorMessage = error.response.data;
          set({ error: errorMessage });
          const customError = new Error("API Error");
          (customError as any).responseValue = errorMessage;
          throw customError;
        } else {
          const errorMessage = (error as Error).message;
          set({ error: errorMessage });
          throw new Error(errorMessage);
        }
      }
    },

    googleLogin: async () => {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const idToken = await result.user.getIdToken();

        if (!idToken || typeof idToken !== "string" || idToken.length < 100) {
          throw new Error("Invalid ID token received from Firebase");
        }

        const response = await axiosInstance.post(
          "auth/google-login",
          { idToken },
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        const data = response.data;
        if (data.token) {
          const user = {
            id: data.id,
            fullName: data.fullName,
            email: data.email,
            phone_number: data.phone_number,
          };

          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("token", data.token);

          await registerServiceWorker();

          // Request notification permission before fetching FCM token
          const permission = await requestNotificationPermission();
          let fcmToken: string | null = null;
          if (permission === "granted") {
            fcmToken = await getToken(messaging, {
              vapidKey:
                "BOYKZ4MFMfEBL8WJTLid1bmd-m0Hbq8Aru3jlJTbylPWiHpdxyiKlhU97BtPw3K44Uyn4BLqzzVmsptNvwatdRI",
            }).catch((err) => {
              console.error("Lỗi khi lấy fcmToken:", err);
              return null;
            });
          }

          if (fcmToken) {
            console.log("FCM Token:", fcmToken); // Log fcmToken ra console
            // Optional: Send fcmToken to server
            // await axiosInstance.post("auth/update-fcm-token", { fcmToken });
          }

          set({ user, token: data.token, error: null });
          return {
            success: true,
            message: data.message || "Google login successful",
          };
        } else {
          set({ error: "Google login failed" });
          return { success: false, message: "Google login failed" };
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          const errorMessage = error.response.data;
          set({ error: errorMessage });
          const customError = new Error("API Error");
          (customError as any).responseValue = errorMessage;
          throw customError;
        } else {
          const errorMessage = (error as Error).message;
          set({ error: errorMessage });
          throw new Error(errorMessage);
        }
      }
    },

    logout: () => {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      set({ user: null, token: null, error: null });
    },

    setUser: (user) => {
      localStorage.setItem("user", JSON.stringify(user));
      set({ user });
    },

    setToken: (token) => {
      localStorage.setItem("token", token);
      set({ token });
    },
  };
});

export const useRegister = () => {
  return useMutation({
    mutationFn: async (newAccount: RegisterDto) => {
      try {
        const response = await axiosInstance.post(`auth/register`, newAccount);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          const errorMessage = error.response.data;
          const customError = new Error("API Error");
          (customError as any).responseValue = errorMessage;
          throw customError;
        } else {
          const errorMessage = (error as Error).message;
          throw new Error(errorMessage);
        }
      }
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (verifyAccount: ForgorPasswordDto) => {
      try {
        const response = await axiosInstance.post(
          `auth/forgot-password`,
          verifyAccount
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          const errorMessage = error.response.data;
          const customError = new Error("API Error");
          (customError as any).responseValue = errorMessage;
          throw customError;
        } else {
          const errorMessage = (error as Error).message;
          throw new Error(errorMessage);
        }
      }
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (changePassword: ChangePasswordDto) => {
      try {
        const response = await axiosInstance.post(
          `auth/change-password`,
          changePassword
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          const errorMessage = error.response.data;
          const customError = new Error("API Error");
          (customError as any).responseValue = errorMessage;
          throw customError;
        } else {
          const errorMessage = (error as Error).message;
          throw new Error(errorMessage);
        }
      }
    },
  });
};

export const useVerifyOTP = () => {
  return useMutation({
    mutationFn: async (verifyOTP: VerifyOTPDto) => {
      const response = await axiosInstance.post(`auth/verify-otp`, verifyOTP);
      return response.data;
    },
  });
};

export const useResendOTP = () => {
  return useMutation({
    mutationFn: async (resendOTP: ForgorPasswordDto) => {
      const response = await axiosInstance.post(`auth/resend-otp`, resendOTP);
      return response.data;
    },
  });
};

export const useLoginGoogle = () => {
  return useMutation({
    mutationFn: async (newAccount: GoogleLoginDto) => {
      const response = await axiosInstance.post(
        `auth/google-login`,
        newAccount
      );
      return response.data;
    },
  });
};
