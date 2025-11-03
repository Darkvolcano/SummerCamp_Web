import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Home from "./pages/Home/Home";
import Forbidden from "./pages/Forbidden/Forbidden";
import UserProfile from "./pages/Profile/UserProfile";
import AdminDashboard from "./pages/Admin/Dashboard/AdminDashboard";
import CampManagement from "./pages/Admin/CampManagement/CampManagement";
import BlogManagement from "./pages/Admin/BlogManagement/BlogManagement";
import VehicleManagement from "./pages/Admin/VehicleManagement/VehicleManagement";
import VehicleTypeManagement from "./pages/Admin/VehicleTypeManagement/VehicleTypeManagement";
import MySchedule from "./pages/Staff/MySchedule/MySchedule";
import MyCamps from "./pages/Staff/MyCamps/MyCamps";
import MyBlogs from "./pages/Staff/MyBlogs/MyBlogs";
import { AuthGuardProvider } from "./contexts/AuthGuardContext";
import { PagePath } from "./enums/page-path.enum";
import VerifyOtp from "./pages/Otp/OtpVerification";
import MainLayout from "./layouts/MainLayout";
import ManagerLayout from "./layouts/ManagerLayout";
import ListCamp from "./pages/ListCamp/ListCamp";
import CampDetail from "./pages/CampDetail/CampDetail";
import About from "./pages/About/About";
import ManagerDashboard from "./pages/Manager/Dashboard/ManagerDashboard";
import AdminLayout from "./layouts/AdminLayout";

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
          <Route
            path={PagePath.CAMP}
            element={
              <MainLayout>
                <ListCamp />
              </MainLayout>
            }
          />
          <Route
            path={PagePath.CAMP_DETAIL}
            element={
              <MainLayout>
                <CampDetail />
              </MainLayout>
            }
          />
          <Route
            path={PagePath.ABOUT}
            element={
              <MainLayout>
                <About />
              </MainLayout>
            }
          />

          {/* Admin Routes - Protected */}
          <Route element={<AdminLayout />}>
            <Route
              path={PagePath.ADMIN_DASHBOARD}
              element={<AdminDashboard />}
            />
            <Route path={PagePath.ADMIN_CAMPS} element={<CampManagement />} />
            <Route path={PagePath.ADMIN_BLOGS} element={<BlogManagement />} />
            <Route
              path={PagePath.ADMIN_VEHICLES}
              element={<VehicleManagement />}
            />
            <Route
              path={PagePath.ADMIN_VEHICLE_TYPES}
              element={<VehicleTypeManagement />}
            />
          </Route>

          {/* Staff Routes - Protected */}
          <Route path={PagePath.STAFF_SCHEDULE} element={<MySchedule />} />
          <Route path={PagePath.STAFF_CAMPS} element={<MyCamps />} />
          <Route path={PagePath.STAFF_BLOGS} element={<MyBlogs />} />

          {/*Manager Routes*/}
          <Route
            path={PagePath.MANAGER_DASHBOARD}
            element={
              <ManagerLayout>
                <ManagerDashboard />
              </ManagerLayout>
            }
          />

          {/* Home Route - Protected */}
          <Route
            path={PagePath.HOME}
            element={
              <MainLayout>
                <Home />
              </MainLayout>
            }
          />
          <Route
            path={PagePath.ROOT}
            element={
              <MainLayout>
                <Home />
              </MainLayout>
            }
          />

          {/* User Profile Route - Protected */}
          <Route path="/profile" element={<UserProfile />} />
        </Routes>
      </AuthGuardProvider>
    </Router>
  );
}

export default App;
