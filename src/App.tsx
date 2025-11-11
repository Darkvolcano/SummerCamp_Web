import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Home from "./pages/Home/Home";
import Forbidden from "./pages/Forbidden/Forbidden";
import UserProfile from "./pages/Profile/UserProfile";
import AdminDashboard from "./pages/Admin/Dashboard/AdminDashboard";
import CampManagement from "./pages/Admin/CampManagement/CampPrograms";
import BlogManagement from "./pages/Admin/BlogManagement/BlogManagement";
import VehicleManagement from "./pages/Admin/VehicleManagement/VehicleManagement";
import VehicleTypeManagement from "./pages/Admin/VehicleTypeManagement/VehicleTypeManagement";
import StaffSchedule from "./pages/Staff/MySchedule/MySchedule";
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
import ManagerRegistrationsPage from "./pages/Manager/Registrations/ManagerRegistrationsPage";
import AdminLayout from "./layouts/AdminLayout";
import DriverLayout from "./layouts/DriverLayout";
import StaffLayout from "./layouts/StaffLayout";
import RegistrationPage from "./pages/Registration/RegistrationPage";
import RegistrationSuccess from "./pages/RegistrationSuccess/RegistrationSuccess";
import CampDetailPage from "./pages/Admin/CampManagement/CampDetailPage/CampDetailPage";

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
          <Route
            path={PagePath.REGISTRATION_FORM}
            element={
              <MainLayout>
                <RegistrationPage />
              </MainLayout>
            }
          />
          <Route
            path={PagePath.REGISTER_SUCCESS}
            element={
              <MainLayout>
                <RegistrationSuccess />
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
              path={PagePath.ADMIN_CAMPS_DETAIL}
              element={<CampDetailPage />}
            />
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
          <Route element={<StaffLayout />}>
            <Route path={PagePath.STAFF_SCHEDULE} element={<StaffSchedule />} />
          </Route>
          <Route path={PagePath.STAFF_SCHEDULE} element={<StaffSchedule />} />
          <Route path={PagePath.STAFF_CAMPS} element={<MyCamps />} />
          <Route path={PagePath.STAFF_BLOGS} element={<MyBlogs />} />

          {/* Manager Routes - Protected */}
          <Route element={<ManagerLayout />}>
            <Route
              path={PagePath.MANAGER_DASHBOARD}
              element={<ManagerDashboard />}
            />
            <Route
              path={PagePath.MANAGER_REGIS}
              element={<ManagerRegistrationsPage />}
            />
            <Route
              path={PagePath.MANAGER_CAMPERS}
              element={<div>Manager Campers</div>}
            />
            <Route
              path={PagePath.MANAGER_ACTIVITIES}
              element={<div>Manager Activities</div>}
            />
            <Route
              path={PagePath.MANAGER_GROUPS}
              element={<div>Manager Groups</div>}
            />
            <Route
              path={PagePath.MANAGER_TRANSPORTATION}
              element={<div>Manager Transportation</div>}
            />
            <Route
              path={PagePath.MANAGER_LOCATIONS}
              element={<div>Manager Locations</div>}
            />
            <Route
              path={PagePath.MANAGER_ACCOMODATION}
              element={<div>Manager Accommodation</div>}
            />
            <Route
              path={PagePath.MANAGER_PAYMENTS}
              element={<div>Manager Payments</div>}
            />
            <Route
              path={PagePath.MANAGER_CALENDAR}
              element={<div>Manager Calendar</div>}
            />
            <Route
              path={PagePath.MANAGER_INCIDENTS}
              element={<div>Manager Incidents</div>}
            />
          </Route>

          {/* Driver Route - Protected */}
          <Route element={<DriverLayout />}>
            <Route
              path={PagePath.DRIVER_CALENDAR}
              element={<div>DRIVER_CALENDAR</div>}
            />
          </Route>

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
