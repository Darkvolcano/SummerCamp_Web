import { useAuthStore } from "../services/userService";
import { createContext, useEffect, type PropsWithChildren } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { message } from "antd";
import { jwtDecode } from "jwt-decode";
import { PagePath } from "../enums/page-path.enum";

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
      PagePath.CAMP,
      PagePath.CAMP_DETAIL,
      PagePath.BLOG,
      PagePath.BLOG_DETAIL,
      PagePath.ABOUT,
    ];

    // Check if current route is public
    if (publicRoutes.includes(location.pathname as PagePath)) {
      // If user is already logged in and tries to access login/register, redirect to appropriate dashboard
      if (user && token && (location.pathname === PagePath.LOGIN || location.pathname === PagePath.REGISTER)) {
        try {
          const decoded = jwtDecode<{ role: string }>(token);
          const userRole = decoded.role?.toLowerCase();

          if (userRole === "admin") {
            navigate(PagePath.ADMIN_DASHBOARD, { replace: true });
          } else if (userRole === "staff") {
            navigate(PagePath.STAFF_SCHEDULE, { replace: true });
          } else {
            navigate(PagePath.HOME, { replace: true });
          }
        } catch {
          navigate(PagePath.HOME, { replace: true });
        }
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
        sub: string;
        email: string;
        name: string;
        role: string;
        exp: number;
        iat: number;
        iss: string;
        aud: string;
      }>(token);

      // Normalize role to lowercase for case-insensitive comparison
      const userRole = decoded.role?.toLowerCase() as "parent" | "staff" | "admin" | "camper" | "user";

      // Default redirects for each role when accessing root
      const roleRedirects: Record<string, string> = {
        parent: PagePath.HOME,
        staff: PagePath.STAFF_SCHEDULE,
        admin: PagePath.ADMIN_DASHBOARD,
        camper: "/manager/dashboard",
        user: PagePath.HOME,
      };

      if (location.pathname === PagePath.ROOT) {
        navigate(roleRedirects[userRole] || PagePath.HOME, { replace: true });
        return;
      }

      // Role-based access control - define allowed pages per role
      const restrictedPages: Record<string, string[]> = {
        staff: [
          PagePath.STAFF_SCHEDULE,
          PagePath.STAFF_CAMPS,
          PagePath.STAFF_BLOGS,
          "/staff/profile",
          "/staff/chat",
          "/profile",
        ],
        parent: [
          PagePath.HOME,
          "/checkout",
          "/payment-success",
          "/user/information",
          "/user/order-history",
          "/user/order-tracking/:orderId",
          "/user/promotion",
          "/payment-cancel",
          "/profile",
        ],
        camper: [
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
          "/profile",
        ],
        admin: [
          PagePath.ADMIN_DASHBOARD,
          PagePath.ADMIN_CAMPS,
          PagePath.ADMIN_BLOGS,
          PagePath.ADMIN_ACCOUNTS,
          PagePath.ADMIN_SETTINGS,
          "/admin/profile",
          "/profile",
        ],
        user: [
          PagePath.HOME,
          "/profile",
        ],
      };

      const allowedPages = restrictedPages[userRole] || [];

      // Check if user has access to current page
      const matchDynamicRoute = (routePattern: string, path: string) => {
        const dynamicRoutePattern = routePattern
          .replace(/:productId/, "[0-9]+")
          .replace(/:userId/, "[0-9]+")
          .replace(/:orderId/, "[0-9]+")
          .replace(/:campId/, "[0-9]+")
          .replace(/:blogId/, "[0-9]+")
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