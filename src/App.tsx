import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
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
import BlogList from "./pages/Blog/BlogList";
import BlogDetail from "./pages/Blog/BlogDetail";
import { AuthGuardProvider } from "./contexts/AuthGuardContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { PagePath } from "./enums/page-path.enum";
import VerifyOtp from "./pages/Otp/OtpVerification";
import MainLayout from "./layouts/MainLayout";
import ManagerLayout from "./layouts/ManagerLayout";
import ListCamp from "./pages/ListCamp/ListCamp";
import CampDetail from "./pages/CampDetail/CampDetail";
import About from "./pages/About/About";
import Contact from "./pages/Contact/Contact";
import ManagerDashboard from "./pages/Manager/Dashboard/ManagerDashboard";
import ManagerRegistrationsPage from "./pages/Manager/Registrations/ManagerRegistrationsPage";
import AdminLayout from "./layouts/AdminLayout";
import DriverLayout from "./layouts/DriverLayout";
import StaffLayout from "./layouts/StaffLayout";
import RegistrationPage from "./pages/Registration/RegistrationPage";
import RegistrationSuccess from "./pages/RegistrationSuccess/RegistrationSuccess";
import CampDetailPage from "./pages/Admin/CampManagement/CampDetailPage/CampDetailPage";
import InCampLocationManagement from "./pages/Manager/Locations/InCampLocationManagement";
import CamperManagement from "./pages/Manager/Campers/CamperManagement";
import GroupManagement from "./pages/Manager/Groups/GroupManagement";
import CampStaffManagement from "./pages/Manager/Staffs/CampStaffManagement";
import ActivityScheduleManagement from "./pages/Manager/Activities/activityScheduleManagement";
import AccommodationManagement from "./pages/Manager/Accomodation/AccommodationManagement";
import TransportationManagement from "./pages/Manager/Transportation";
import CampTypePage from "./pages/Admin/CampTypeManagement/CampTypePage";
import PromotionPage from "./pages/Admin/PromotionManagement/PromotionPage";
import TransactionPage from "./pages/Admin/TransactionManagement/TransactionPage";
import MyProfile from "./pages/Parent/MyProfile/MyProfile";
import MyRegistration from "./pages/Parent/MyRegistration/MyRegistration";
import RegistrationDetail from "./pages/Parent/MyRegistration/MyRegistrationDetail";
import PaymentCallback from "./pages/Parent/MyRegistration/PaymentCallback";
import MyCampers from "./pages/Parent/MyCampers/MyCampers";
import CamperDetail from "./pages/Parent/MyCampers/CamperDetail";
import CamperSchedule from "./pages/Parent/MyCampers/CamperSchedule";
import CamperTransportSchedule from "./pages/Parent/MyCampers/CamperTransportSchedule";
import MyTransaction from "./pages/Parent/MyTransaction/MyTransaction";
import AttendanceChecking from "./pages/Staff/AttendanceChecking/AttendanceChecking";
import AttendanceCamperList from "./pages/Staff/AttendanceChecking/AttendanceCamperList";
import MyCalendar from "./pages/Staff/MyCalendar/MyCalendar";
import HostLiveStream from "./pages/Staff/LiveStream/HostLiveStream";
import ViewLiveStream from "./pages/Parent/LiveStream/ViewLiveStream";
import CampTransaction from "./pages/Manager/Transaction/campTransaction";
import CheckIn from "./pages/Staff/CheckIn/CheckIn";
import UserManagement from "./pages/Admin/UserManagement/UserManagement";
import CampLocationPage from "./pages/Admin/CampLocationManagement/CampLocationPage";
import StaffCampDetail from "./pages/Staff/CampDetail/StaffCampDetail";

function App() {
  return (
    <Router>
      <NotificationProvider>
        <AuthGuardProvider>
          <Routes>
            {/* Public Routes */}
            <Route path={PagePath.LOGIN} element={<Login />} />
            <Route path={PagePath.REGISTER} element={<Register />} />
            <Route path={PagePath.VERIFY_OTP} element={<VerifyOtp />} />
            <Route path={PagePath.FORGOT_PASSWORD} element={<ForgotPassword />} />
            <Route path={PagePath.RESET_PASSWORD} element={<ResetPassword />} />
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
              path={PagePath.CONTACT}
              element={
                <MainLayout>
                  <Contact />
                </MainLayout>
              }
            />
            <Route
              path={PagePath.BLOG}
              element={
                <MainLayout>
                  <BlogList />
                </MainLayout>
              }
            />
            <Route
              path={PagePath.BLOG_DETAIL}
              element={
                <MainLayout>
                  <BlogDetail />
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
              <Route path={PagePath.ADMIN_CAMPTYPES} element={<CampTypePage />} />
              <Route path={PagePath.ADMIN_CAMP_LOCATIONS} element={<CampLocationPage />} />
              <Route path={PagePath.ADMIN_PROMOTIONS} element={<PromotionPage />} />
              <Route path={PagePath.ADMIN_TRANSACTIONS} element={<TransactionPage />} />
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
              <Route
                path={PagePath.ADMIN_USERS}
                element={<UserManagement />}
              />
            </Route>

            {/* Staff Routes - Protected */}
            <Route element={<StaffLayout />}>
              <Route path={PagePath.STAFF_SCHEDULE} element={<StaffSchedule />} />
              <Route path={PagePath.STAFF_CALENDAR} element={<MyCalendar />} />
              <Route path={PagePath.STAFF_CAMP_DETAIL} element={<StaffCampDetail />} />
              <Route path={PagePath.STAFF_ATTENDANCE_CHECKING} element={<AttendanceChecking />} />
              <Route path={PagePath.STAFF_ATTENDANCE_CAMPERS} element={<AttendanceCamperList />} />
              <Route path={PagePath.STAFF_CHECKIN} element={<CheckIn />} />
              <Route path={PagePath.STAFF_LIVESTREAM_HOST} element={<HostLiveStream />} />
            </Route>
            <Route path={PagePath.STAFF_CAMPS} element={<MyCamps />} />
            <Route path={PagePath.STAFF_BLOGS} element={<MyBlogs />} />

            {/* Manager Routes - Protected */}
            <Route element={<ManagerLayout />}>
              <Route
                path={PagePath.MANAGER_DASHBOARD}
                element={<ManagerDashboard />}
              />
              <Route
                path={PagePath.MANAGER_STAFFS}
                element={<CampStaffManagement />}
              />
              <Route
                path={PagePath.MANAGER_REGIS}
                element={<ManagerRegistrationsPage />}
              />
              <Route
                path={PagePath.MANAGER_CAMPERS}
                element={<CamperManagement />}
              />
              <Route
                path={PagePath.MANAGER_ACTIVITIES}
                element={<ActivityScheduleManagement />}
              />
              <Route
                path={PagePath.MANAGER_GROUPS}
                element={<GroupManagement />}
              />
              <Route
                path={PagePath.MANAGER_TRANSPORTATION}
                element={<TransportationManagement />}
              />
              <Route
                path={PagePath.MANAGER_LOCATIONS}
                element={<InCampLocationManagement />}
              />
              <Route
                path={PagePath.MANAGER_ACCOMODATION}
                element={<AccommodationManagement />}
              />
              <Route
                path={PagePath.MANAGER_PAYMENTS}
                element={<CampTransaction />}
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
            <Route
              path={PagePath.USER_MYPROFILE}
              element={
                <MainLayout>
                  <MyProfile />
                </MainLayout>
              }
            />
            <Route
              path={PagePath.USER_MYREGISTRATIONS}
              element={
                <MainLayout>
                  <MyRegistration />
                </MainLayout>
              }
            />
            <Route
              path={PagePath.USER_MYREGISTRATIONS_DETAIL}
              element={
                <MainLayout>
                  <RegistrationDetail />
                </MainLayout>
              }
            />
            <Route
              path={PagePath.USER_PAYMENT_CALLBACK}
              element={
                <MainLayout>
                  <PaymentCallback />
                </MainLayout>
              }
            />
            <Route
              path={PagePath.USER_MYCAMPERS}
              element={
                <MainLayout>
                  <MyCampers />
                </MainLayout>
              }
            />
            <Route
              path={PagePath.USER_CAMPER_DETAIL}
              element={
                <MainLayout>
                  <CamperDetail />
                </MainLayout>
              }
            />
            <Route
              path={PagePath.USER_CAMPER_SCHEDULE}
              element={
                <MainLayout>
                  <CamperSchedule />
                </MainLayout>
              }
            />
            <Route
              path={PagePath.USER_CAMPER_TRANSPORTSCHEDULE}
              element={
                <MainLayout>
                  <CamperTransportSchedule />
                </MainLayout>
              }
            />
            <Route
              path={PagePath.USER_PAYMENT_HISTORY}
              element={
                <MainLayout>
                  <MyTransaction />
                </MainLayout>
              }
            />
            <Route
              path={PagePath.USER_LIVESTREAM_VIEW}
              element={
                <MainLayout>
                  <ViewLiveStream />
                </MainLayout>
              }
            />
            {/* User Profile Route - Protected */}
            <Route path="/profile" element={<UserProfile />} />
          </Routes>
        </AuthGuardProvider>
      </NotificationProvider>
    </Router>
  );
}

export default App;
