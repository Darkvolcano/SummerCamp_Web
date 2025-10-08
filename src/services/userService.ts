import { create } from "zustand";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import axiosInstance from "../config/axios";
import { useMutation } from "@tanstack/react-query";
// import { signInWithPopup } from "firebase/auth";
// import { auth, googleProvider, messaging } from "../config/firebase";
// import { getToken } from "firebase/messaging";

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  message: string;
}

// export interface GoogleLoginDto {
//   idToken: string;
// }

// CORRECTED: Match Swagger documentation exactly
export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  dob: string; // Format: "YYYY-MM-DD"
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
  // googleLogin: () => Promise<{
  //   success: boolean;
  //   message: string;
  // }>;
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

  // const requestNotificationPermission = async () => {
  //   try {
  //     const permission = await Notification.requestPermission();
  //     if (permission !== "granted") {
  //       console.warn("Notification permission not granted");
  //       return null;
  //     }
  //     return permission;
  //   } catch (err) {
  //     console.error("Error requesting notification permission:", err);
  //     return null;
  //   }
  // };

  // const registerServiceWorker = async () => {
  //   try {
  //     if ("serviceWorker" in navigator) {
  //       const registration = await navigator.serviceWorker.register(
  //         "/firebase-messaging-sw.js",
  //         {
  //           scope: "/firebase-cloud-messaging-push-scope",
  //         }
  //       );
  //       console.log("Service Worker registered:", registration);
  //       return registration;
  //     } else {
  //       console.warn("Service Worker is not supported in this browser.");
  //       return null;
  //     }
  //   } catch (error) {
  //     console.error("Service Worker registration failed:", error);
  //     return null;
  //   }
  // };

  return {
    ...loadStoredAuth(),

    login: async (values: LoginDto) => {
      try {
        const response = await axiosInstance.post("auth/login", values, {
          headers: { "Content-Type": "application/json" },
        });

        const data = response.data;
        if (data.accessToken) {
          const decoded = jwtDecode<{
            id: number;
            role: string;
            fullName: string;
            email: string;
            phone_number: string;
          }>(data.accessToken);

          const user = {
            id: decoded.id,
            fullName: decoded.fullName,
            email: decoded.email,
            phone_number: decoded.phone_number,
          };

          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("token", data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);

          // await registerServiceWorker();

          // const permission = await requestNotificationPermission();
          // let fcmToken: string | null = null;
          // if (permission === "granted") {
          //   fcmToken = await getToken(messaging, {
          //     vapidKey:
          //       "BOYKZ4MFMfEBL8WJTLid1bmd-m0Hbq8Aru3jlJTbylPWiHpdxyiKlhU97BtPw3K44Uyn4BLqzzVmsptNvwatdRI",
          //   }).catch((err) => {
          //     console.error("Lỗi khi lấy fcmToken:", err);
          //     return null;
          //   });
          // }

          // if (fcmToken) {
          //   console.log("FCM Token:", fcmToken);
          // }

          set({ user, token: data.accessToken, error: null });
          return {
            success: true,
            message: data.message || "Đăng nhập thành công",
          };
        } else {
          const errorMessage = data.message || "Đăng nhập thất bại";
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

    // googleLogin: async () => {
    //   try {
    //     const result = await signInWithPopup(auth, googleProvider);
    //     const idToken = await result.user.getIdToken();

    //     if (!idToken || typeof idToken !== "string" || idToken.length < 100) {
    //       throw new Error("Invalid ID token received from Firebase");
    //     }

    //     const response = await axiosInstance.post(
    //       "auth/google-login",
    //       { idToken },
    //       {
    //         headers: { "Content-Type": "application/json" },
    //       }
    //     );

    //     const data = response.data;
    //     if (data.token) {
    //       const user = {
    //         id: data.id,
    //         fullName: data.fullName,
    //         email: data.email,
    //         phone_number: data.phone_number,
    //       };

    //       localStorage.setItem("user", JSON.stringify(user));
    //       localStorage.setItem("token", data.token);

    //       await registerServiceWorker();

    //       const permission = await requestNotificationPermission();
    //       let fcmToken: string | null = null;
    //       if (permission === "granted") {
    //         fcmToken = await getToken(messaging, {
    //           vapidKey:
    //             "BOYKZ4MFMfEBL8WJTLid1bmd-m0Hbq8Aru3jlJTbylPWiHpdxyiKlhU97BtPw3K44Uyn4BLqzzVmsptNvwatdRI",
    //         }).catch((err) => {
    //           console.error("Lỗi khi lấy fcmToken:", err);
    //           return null;
    //         });
    //       }

    //       if (fcmToken) {
    //         console.log("FCM Token:", fcmToken);
    //       }

    //       set({ user, token: data.token, error: null });
    //       return {
    //         success: true,
    //         message: data.message || "Google login successful",
    //       };
    //     } else {
    //       set({ error: "Google login failed" });
    //       return { success: false, message: "Google login failed" };
    //     }
    //   } catch (error) {
    //     if (axios.isAxiosError(error) && error.response) {
    //       const errorMessage = error.response.data;
    //       set({ error: errorMessage });
    //       const customError = new Error("API Error");
    //       (customError as any).responseValue = errorMessage;
    //       throw customError;
    //     } else {
    //       const errorMessage = (error as Error).message;
    //       set({ error: errorMessage });
    //       throw new Error(errorMessage);
    //     }
    //   }
    // },

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
        console.log('=== REGISTER REQUEST DEBUG ===');
        console.log('Request Data:', JSON.stringify(newAccount, null, 2));
        console.log('API URL:', axiosInstance.defaults.baseURL + '/auth/register');

        const response = await axiosInstance.post(`auth/register`, newAccount);

        console.log('=== REGISTER RESPONSE SUCCESS ===');
        console.log('Response:', response.data);

        return response.data;
      } catch (error) {
        console.error('=== REGISTER ERROR ===');

        if (axios.isAxiosError(error)) {
          if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);

            const errorData = error.response.data;
            let errorMessage = 'Đăng ký thất bại';

            // Handle different error formats
            if (errorData?.message) {
              errorMessage = errorData.message;
            } else if (errorData?.title) {
              errorMessage = errorData.title;
            } else if (errorData?.errors) {
              // Validation errors
              const errors = Object.entries(errorData.errors)
                .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
                .join('\n');
              errorMessage = errors;
            } else if (typeof errorData === 'string') {
              errorMessage = errorData;
            }

            const customError = new Error("API Error");
            (customError as any).responseValue = {
              message: errorMessage,
              status: error.response.status,
              data: errorData
            };
            throw customError;
          } else if (error.request) {
            console.error('No response received:', error.request);
            throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối.');
          }
        }

        console.error('Unexpected error:', error);
        throw new Error('Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.');
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
      try {
        console.log('=== VERIFY OTP REQUEST DEBUG ===');
        console.log('Request Data:', JSON.stringify(verifyOTP, null, 2));

        const response = await axiosInstance.post(`auth/verify-otp`, verifyOTP);

        console.log('=== VERIFY OTP RESPONSE SUCCESS ===');
        console.log('Response:', response.data);

        return response.data;
      } catch (error) {
        console.error('=== VERIFY OTP ERROR ===');

        if (axios.isAxiosError(error)) {
          if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);

            const errorData = error.response.data;
            let errorMessage = 'Xác thực OTP thất bại';

            if (errorData?.message) {
              errorMessage = errorData.message;
            } else if (typeof errorData === 'string') {
              errorMessage = errorData;
            }

            const customError = new Error("API Error");
            (customError as any).responseValue = {
              message: errorMessage,
              status: error.response.status,
              data: errorData
            };
            throw customError;
          } else if (error.request) {
            console.error('No response received:', error.request);
            throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối.');
          }
        }

        console.error('Unexpected error:', error);
        throw new Error('Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.');
      }
    },
  });
};

export const useResendOTP = () => {
  return useMutation({
    mutationFn: async (resendOTP: ForgorPasswordDto) => {
      try {
        console.log('=== RESEND OTP REQUEST DEBUG ===');
        console.log('Request Data:', JSON.stringify(resendOTP, null, 2));

        // Note: Backend doesn't have resend-otp endpoint, using register endpoint to resend
        // This will trigger a new OTP to be sent
        const response = await axiosInstance.post(`auth/register`, resendOTP);

        console.log('=== RESEND OTP RESPONSE SUCCESS ===');
        console.log('Response:', response.data);

        return response.data;
      } catch (error) {
        console.error('=== RESEND OTP ERROR ===');

        if (axios.isAxiosError(error)) {
          if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);

            const errorData = error.response.data;
            let errorMessage = 'Gửi lại OTP thất bại';

            if (errorData?.message) {
              errorMessage = errorData.message;
            } else if (typeof errorData === 'string') {
              errorMessage = errorData;
            }

            const customError = new Error("API Error");
            (customError as any).responseValue = {
              message: errorMessage,
              status: error.response.status,
              data: errorData
            };
            throw customError;
          } else if (error.request) {
            console.error('No response received:', error.request);
            throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối.');
          }
        }

        console.error('Unexpected error:', error);
        throw new Error('Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.');
      }
    },
  });
};

// export const useLoginGoogle = () => {
//   return useMutation({
//     mutationFn: async (newAccount: GoogleLoginDto) => {
//       const response = await axiosInstance.post(
//         `auth/google-login`,
//         newAccount
//       );
//       return response.data;
//     },
//   });
// };