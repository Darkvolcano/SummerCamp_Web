import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Home from "./pages/Home/Home";
import Forbidden from "./pages/Forbidden/Forbidden";
import { AuthGuardProvider } from "./contexts/AuthGuardContext";
import { PagePath } from "./enums/page-path.enum";
import AdminSidebar from "./components/sidebar/Admin/Admin";
import StaffSidebar from "./components/sidebar/Staff/Staff";
import VerifyOtp from "./pages/Otp/OtpVerification";
import MainLayout from "./layouts/MainLayout";
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
          {/* Public Routes */}
          <Route path={PagePath.LOGIN} element={<Login />} />
          <Route path={PagePath.REGISTER} element={<Register />} />
          <Route path={PagePath.VERIFY_OTP} element={<VerifyOtp />} />
          <Route path={PagePath.FORBIDDEN} element={<Forbidden />} />

          {/* Home Route - Protected */}
          <Route path={PagePath.HOME} element={<MainLayout><Home /></MainLayout>} />
          <Route path={PagePath.ROOT} element={<MainLayout><Home /></MainLayout>} />

          {/* Admin Routes */}
          <Route element={<LayoutWithSidebarAdmin />}>
            {/* Add admin routes here */}
            {/* <Route path="/admin/dashboard" element={<ReportManagement />} /> */}
            {/* <Route path="/admin/users" element={<UserManagement />} /> */}
          </Route>

          {/* Staff Routes */}
          <Route element={<LayoutWithSidebarStaff />}>
            {/* Add staff routes here */}
            {/* <Route path="/staff/orders" element={<StaffOrderManagement />} /> */}
            {/* <Route path="/staff/profile" element={<StaffProfile />} /> */}
          </Route>
        </Routes>
      </AuthGuardProvider>
    </Router>
  );
}

export default App;