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
    const matchDynamicRoute = (routePattern: string, path: string) => {
      const dynamicRoutePattern = routePattern
        .replace(/\//g, "\\/")
        .replace(/:campId/g, "[0-9]+")
        .replace(/:camperId/g, "[0-9]+")
        .replace(/:userId/g, "[0-9]+")
        .replace(/:blogId/g, "[0-9]+")
        .replace(/:orderId/g, "[0-9]+")
        .replace(/:registrationId/g, "[0-9]+")
        .replace(/:scheduleId/g, "[0-9]+")
        .replace(/:roomId/g, "[a-zA-Z0-9\\-_]+")
        .replace(/:id/g, "[0-9]+");
      const regex = new RegExp(`^${dynamicRoutePattern}$`);
      return regex.test(path);
    };

    // Public routes that don't need authentication
    const publicRoutes = [
      PagePath.ROOT,
      PagePath.LOGIN,
      PagePath.REGISTER,
      PagePath.VERIFY_EMAIL,
      PagePath.VERIFY_OTP,
      PagePath.FORGOT_PASSWORD,
      PagePath.RESET_PASSWORD,
      PagePath.FORBIDDEN,
      PagePath.CAMP,
      PagePath.CAMP_DETAIL,
      PagePath.BLOG,
      PagePath.BLOG_DETAIL,
      PagePath.ABOUT,
      PagePath.HOME,
      PagePath.CONTACT,
    ];

    const isPublicRoute = publicRoutes.some((route) => {
      if (route.includes(":")) {
        return matchDynamicRoute(route, location.pathname);
      }
      return route === location.pathname;
    });

    // Check if current route is public
    if (isPublicRoute) {
      // If user is already logged in and tries to access login/register, redirect to appropriate dashboard
      if (
        user &&
        token &&
        (location.pathname === PagePath.LOGIN ||
          location.pathname === PagePath.REGISTER)
      ) {
        try {
          const decoded = jwtDecode<{ role: string }>(token);
          const userRole = decoded.role?.toLowerCase();

          if (userRole === "admin") {
            navigate(PagePath.ADMIN_DASHBOARD, { replace: true });
          } else if (userRole === "staff") {
            navigate(PagePath.STAFF_CALENDAR, { replace: true });
          } else if (userRole === "manager") {
            navigate(PagePath.MANAGER_DASHBOARD, { replace: true });
          } else if (userRole === "driver") {
            navigate(PagePath.DRIVER_CALENDAR, { replace: true });
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
      const userRole = decoded.role?.toLowerCase() as
        | "parent"
        | "staff"
        | "admin"
        | "manager"
        | "driver"
        | "user";

      // Default redirects for each role when accessing root
      const roleRedirects: Record<string, string> = {
        parent: PagePath.HOME,
        staff: PagePath.STAFF_CALENDAR,
        admin: PagePath.ADMIN_DASHBOARD,
        manager: PagePath.MANAGER_DASHBOARD,
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
          PagePath.STAFF_ATTENDANCE_CHECKING,
          PagePath.STAFF_ATTENDANCE_CAMPERS,
          PagePath.STAFF_CALENDAR,
          PagePath.STAFF_CAMP_DETAIL,
          PagePath.STAFF_LIVESTREAM_HOST,
          PagePath.STAFF_CHECKIN,
          "/staff/profile",
          "/staff/chat",
          "/profile",
        ],
        parent: [
          PagePath.HOME,
          PagePath.USER_LIVESTREAM_VIEW,
          "/checkout",
          "/payment-success",
          "/user/information",
          "/user/order-history",
          "/user/order-tracking/:orderId",
          "/user/promotion",
          "/payment-cancel",
          "/profile",
          PagePath.REGISTRATION_FORM,
          PagePath.REGISTER_SUCCESS,
        ],
        manager: [
          PagePath.MANAGER_DASHBOARD,
          PagePath.MANAGER_REGIS,
          PagePath.MANAGER_CAMPERS,
          PagePath.MANAGER_ACTIVITIES,
          PagePath.MANAGER_GROUPS,
          PagePath.MANAGER_TRANSPORTATION,
          PagePath.MANAGER_ACCOMODATION,
          PagePath.MANAGER_PAYMENTS,
          PagePath.MANAGER_CALENDAR,
          PagePath.MANAGER_INCIDENTS,
          PagePath.MANAGER_LOCATIONS,
          PagePath.MANAGER_STAFFS,
          "/profile",
        ],
        admin: [
          PagePath.ADMIN_DASHBOARD,
          PagePath.ADMIN_CAMPS,
          PagePath.ADMIN_CAMPS_DETAIL,
          PagePath.ADMIN_BLOGS,
          PagePath.ADMIN_ACCOUNTS,
          PagePath.ADMIN_VEHICLES,
          PagePath.ADMIN_VEHICLE_TYPES,
          PagePath.ADMIN_SETTINGS,
          PagePath.ADMIN_CAMPTYPES,
          PagePath.ADMIN_CAMP_LOCATIONS,
          PagePath.ADMIN_PROMOTIONS,
          PagePath.ADMIN_USERS,
          PagePath.ADMIN_FAQS,
          PagePath.ADMIN_TRANSACTIONS,
          PagePath.ADMIN_CALENDAR,
          PagePath.ADMIN_REPORTS,
          "/admin/profile",
          "/profile",
        ],
        user: [
          PagePath.HOME,
          PagePath.USER_LIVESTREAM_VIEW,
          "/profile",
          PagePath.REGISTRATION_FORM,
          "/checkout",
          "/payment-success",
          "/user/information",
          "/user/order-history",
          "/user/order-tracking/:orderId",
          "/user/promotion",
          "/payment-cancel",
          "/profile",
          PagePath.REGISTER_SUCCESS,
          PagePath.USER_MYPROFILE,
          PagePath.USER_MYREGISTRATIONS,
          PagePath.USER_PAYMENT_HISTORY,
          PagePath.USER_MYCAMPERS,
          PagePath.USER_MYREGISTRATIONS_DETAIL,
          PagePath.USER_CAMPER_DETAIL,
          PagePath.USER_CAMPER_EDIT,
          PagePath.USER_CAMPER_SCHEDULE,
          PagePath.USER_CAMPER_TRANSPORTSCHEDULE,
          PagePath.USER_PAYMENT_CALLBACK,
        ],
      };

      const allowedPages = restrictedPages[userRole] || [];

      const isAllowed =
        publicRoutes.some((route) => {
          if (route.includes(":")) {
            return matchDynamicRoute(route, location.pathname);
          }
          return route === location.pathname;
        }) ||
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
