import { useAuthStore } from "../services/userService";
import { createContext, useEffect, type PropsWithChildren } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { message } from "antd";
import { jwtDecode } from "jwt-decode";
import { PagePath } from "../enums/page-path.enum";

type UserRole = "Parent" | "Staff" | "Admin" | "Camper";

type AuthGuardContextType = Record<string, unknown>;

type AuthGuardProviderProps = PropsWithChildren;

const AuthGuardContext = createContext<AuthGuardContextType>({});

export function AuthGuardProvider(props: AuthGuardProviderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { children } = props;
  const { user, logout, token, setUser, setToken } = useAuthStore();

  useEffect(() => {
    if (!user || !token) {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    }

    if (token && user) {
      try {
        const decoded = jwtDecode<{ role: string; exp: number }>(token);
        const currentTime = Math.floor(Date.now() / 1000);

        if (decoded.exp < currentTime) {
          message.warning("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
          logout();
          return;
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        logout();
      }
    }
  }, [token, user, setUser, setToken, logout]);

  useEffect(() => {
    // Public routes that don't need authentication
    const publicRoutes = [
      PagePath.ROOT,
      PagePath.LOGIN,
      PagePath.REGISTER,
      PagePath.VERIFY_EMAIL,
      PagePath.VERIFY_OTP,
      PagePath.RESET_PASSWORD,
      PagePath.FORBIDDEN,
    ];

    // Check if current route is public
    if (publicRoutes.includes(location.pathname as PagePath)) {
      // If user is already logged in and tries to access login/register, redirect to home
      if (user && token && (location.pathname === PagePath.LOGIN || location.pathname === PagePath.REGISTER)) {
        navigate(PagePath.HOME, { replace: true });
      }
      return;
    }

    // Protected routes - require authentication
    if (!user || !token) {
      navigate(PagePath.LOGIN, { replace: true });
      return;
    }

    try {
      const decoded = jwtDecode<{
        id: number;
        role: string;
        fullName: string;
        email: string;
        phone_number: string;
        exp: number;
      }>(token);

      // Default redirects for each role when accessing root
      const roleRedirects: Record<UserRole, string> = {
        Parent: PagePath.HOME,
        Staff: "/staff/orders",
        Admin: "/admin/users",
        Camper: "/manager/dashboard",
      };

      if (location.pathname === PagePath.ROOT) {
        navigate(roleRedirects[decoded.role as UserRole] || PagePath.HOME, { replace: true });
        return;
      }

      // Role-based access control
      const restrictedPages: Record<UserRole, string[]> = {
        Staff: [
          "/staff/orders",
          "/staff/profile",
          "/staff/chat",
          "/staff/pos",
          "/staff/payment-success",
          "/staff/pos/payment-cancel",
        ],
        Parent: [
          PagePath.HOME,
          "/checkout",
          "/payment-success",
          "/user/information",
          "/user/order-history",
          "/user/order-tracking/:orderId",
          "/user/promotion",
          "/payment-cancel",
        ],
        Camper: [
          "/manager/dashboard",
          "/manager/orders",
          "/manager/orders/confirm-orders",
          "/manager/transactions",
          "/manager/products",
          "/manager/promotions",
          "/manager/staffs",
          "/manager/feedback",
          "/manager/chat",
          "/manager/staffs/staffId",
          "/manager/materials",
          "/manager/profile",
          "/manager/blog",
          "/manager/materials-process",
        ],
        Admin: ["/admin/users", "/admin/profile"],
      };

      const userRole = decoded.role as UserRole;
      const allowedPages = restrictedPages[userRole] || [];

      // Check if user has access to current page
      const matchDynamicRoute = (routePattern: string, path: string) => {
        const dynamicRoutePattern = routePattern
          .replace(/:productId/, "[0-9]+")
          .replace(/:userId/, "[0-9]+")
          .replace(/:orderId/, "[0-9]+")
          .replace(/:id/, "[0-9]+");
        const regex = new RegExp(`^${dynamicRoutePattern}$`);
        return regex.test(path);
      };

      const isAllowed =
        publicRoutes.includes(location.pathname as PagePath) ||
        allowedPages.some((route) => {
          if (route.includes(":")) {
            return matchDynamicRoute(route, location.pathname);
          }
          return route === location.pathname;
        });

      if (!isAllowed) {
        navigate(PagePath.FORBIDDEN, { replace: true });
      }
    } catch (error) {
      console.error("Error in auth guard:", error);
      logout();
      navigate(PagePath.LOGIN, { replace: true });
    }
  }, [user, location, navigate, token, logout]);

  return (
    <AuthGuardContext.Provider value={{}}>{children}</AuthGuardContext.Provider>
  );
}

export default AuthGuardContext;