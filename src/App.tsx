import {
  BrowserRouter as Router,
  Routes,
  Route,
  // Outlet,
} from "react-router-dom";
// import Navbar from "./components/Navbar";
// import Footer from "./components/Footer";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
// import VerifyEmail from "./pages/VerifyEmail";
// import VerifyOTP from "./pages/VerifyOTP";
// import ManagerDashboard from "./pages/manager/ManagerDashboard";
// import HomePage from "./pages/HomePage";
import Forbidden from "./pages/Forbidden/Forbidden";
import { AuthGuardProvider } from "./contexts/AuthGuardContext";
import { PagePath } from "./enums/page-path.enum";
import AdminSidebar from "./components/sidebar/Admin/Admin";
import StaffSidebar from "./components/sidebar/Staff/Staff";
import VerifyOtp from "./pages/Otp/OtpVerification";
// const LayoutWithNavFooter = () => (
//   <>
//     <Navbar />
//     <div style={{ paddingTop: "72px", overflow: "hidden" }}>
//       <Outlet />
//     </div>
//     <Footer />
//   </>
// );

// 2 cái layout sidebar này là ví dụ có thể sửa lại
const LayoutWithSidebarAdmin = () => (
  <>
    <AdminSidebar />
  </>
);

const LayoutWithSidebarStaff = () => (
  <>
    <StaffSidebar />
  </>
);

function App() {
  return (
    <Router>
      <AuthGuardProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/forbidden" element={<Forbidden />} />
          {/* <Route element={<LayoutWithNavFooter />}> */}
          {/* <Route path="/" element={<HomePage />} /> */}
          <Route path={PagePath.LOGIN} element={<Login />} />
          <Route path={PagePath.REGISTER} element={<Register />} />
          <Route path={PagePath.VERIFY_OTP} element={<VerifyOtp />} />
          {/* <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/forgot-password" element={<ForgotPassword />} /> */}
          {/* <Route
                path="order-tracking/:orderId"
                element={<OrderTracking />}
              />
              <Route path="promotion" element={<Promotion />} /> */}
          {/* </Route> */}

          <Route element={<LayoutWithSidebarAdmin />}>
            {/* Lưu ý: cái này dùng bỏ vào những trang quản lý mà admin quản lý */}
            {/* <Route path="/admin/dashboard" element={<ReportManagement />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route
              path="/admin/system-issues"
              element={<SystemIssuesReport />}
            />
            <Route path="/admin/chat" element={<ChatAdmin />} />
            <Route path="/admin/profile" element={<AdminProfile />} /> */}
          </Route>

          <Route element={<LayoutWithSidebarStaff />}>
            {/* Lưu ý: cái này dùng bỏ vào những trang mà staff quản lý và xem*/}
            {/* <Route path="/staff/orders" element={<StaffOrderManagement />} />
            <Route path="/staff/profile" element={<StaffProfile />} />
            <Route path="/staff/chat" element={<StaffChat />} /> */}
          </Route>
        </Routes>
      </AuthGuardProvider>
    </Router>
  );
}

export default App;
