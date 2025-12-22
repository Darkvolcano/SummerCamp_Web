import React, { useEffect, useState } from "react";
import { Spin } from "antd";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Users,
  DollarSign,
  Tent,
  UserCheck,
  MapPin,
  Calendar,
  AlertCircle,
  Eye,
  CheckCircle,
  Clock,
} from "lucide-react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import dashboardService, {
  type AdminSummaryResponseDto,
  type AdminUserAnalyticsResponseDto,
  type AdminLocationAnalyticsResponseDto,
  type AdminCampAnalyticsResponseDto,
  type AdminPriorityActionsResponseDto,
} from "../../../services/dashboardService";
import { useNotification } from "../../../contexts/NotificationContext";
import dayjs from "dayjs";

const COLORS = {
  primary: "#6366F1",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
  purple: "#8B5CF6",
  pink: "#EC4899",
  teal: "#14B8A6",
  orange: "#F97316",
  cyan: "#06B6D4",
};

const CAMP_STATUS_COLORS: { [key: string]: string } = {
  Active: COLORS.success,
  Completed: "#6B7280",
  Draft: "#9CA3AF",
  InProgress: COLORS.info,
  OpenForRegistration: COLORS.teal,
  PendingApproval: COLORS.warning,
  RegistrationClosed: COLORS.orange,
  UnderEnrolled: COLORS.danger,
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toastError } = useNotification();
  const [summary, setSummary] = useState<AdminSummaryResponseDto | null>(null);
  const [userAnalytics, setUserAnalytics] = useState<AdminUserAnalyticsResponseDto | null>(null);
  const [locationAnalytics, setLocationAnalytics] = useState<AdminLocationAnalyticsResponseDto | null>(null);
  const [campAnalytics, setCampAnalytics] = useState<AdminCampAnalyticsResponseDto | null>(null);
  const [priorityActions, setPriorityActions] = useState<AdminPriorityActionsResponseDto | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [summaryData, userData, locationData, campData, priorityData] = await Promise.all([
          dashboardService.getAdminSummary(),
          dashboardService.getAdminUserAnalytics(),
          dashboardService.getAdminLocationAnalytics(),
          dashboardService.getAdminCampAnalytics(),
          dashboardService.getAdminPriorityActions(),
        ]);
        setSummary(summaryData);
        setUserAnalytics(userData);
        setLocationAnalytics(locationData);
        setCampAnalytics(campData);
        setPriorityActions(priorityData);
      } catch (error: any) {
        console.error("Failed to load admin dashboard:", error);
        const errorMessage = error.response?.data?.message || "Không thể tải dashboard";
        toastError('Cảnh báo', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toastError]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" tip="Đang tải dashboard..." />
      </div>
    );
  }

  const customerGrowthData = userAnalytics?.newCustomerGrowth.map((item) => ({
    date: dayjs(item.date).format("DD/MM"),
    "Người dùng mới": item.count,
  })) || [];

  const workforceData = userAnalytics?.workforceDistribution
    ? Object.entries(userAnalytics.workforceDistribution).map(([role, count]) => ({
        name: role === "Manager" ? "Quản lý" : role === "Staff" ? "Nhân viên" : "Tài xế",
        value: count,
        role,
      }))
    : [];

  const locationData = locationAnalytics?.topLocationsByCampCount.slice(0, 10) || [];

  const campStatusData = campAnalytics?.statusOverview
    ? Object.entries(campAnalytics.statusOverview).map(([status, count]) => ({
        name: status,
        value: count,
      }))
    : [];

  const monthlyRevenueData = campAnalytics?.monthlyRevenue.map((item) => ({
    month: item.month,
    "Doanh thu (k₫)": item.revenue / 1000,
    revenueRaw: item.revenue,
  })) || [];

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#111827]">Admin Dashboard</h1>
        <p className="text-[#6B7280] mt-1">Tổng quan hệ thống CampEase</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-white/20 rounded-lg">
              <DollarSign size={22} />
            </div>
            {summary?.totalRevenue.growth !== null && (
              <div className="flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded-full">
                <TrendingUp size={14} />
                <span>{summary?.totalRevenue.growth.toFixed(1)}%</span>
                <p className="text-xs opacity-75 ">{summary?.totalRevenue.label}</p>
              </div>
            )}
          </div>
          <p className="text-xs font-medium opacity-90 mb-1">Tổng Doanh Thu Hệ Thống</p>
          <p className="text-2xl font-bold">
            {summary?.totalRevenue.value.toLocaleString("vi-VN")} ₫
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-5 text-white hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-white/20 rounded-lg">
              <Users size={22} />
            </div>
          </div>
          <p className="text-xs font-medium opacity-90 mb-1">Người Dùng (Phụ Huynh)</p>
          <p className="text-2xl font-bold">{summary?.totalCustomers.value || 0}</p>
          <p className="text-xs opacity-75 mt-1">{summary?.totalCustomers.label}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-5 text-white hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-white/20 rounded-lg">
              <UserCheck size={22} />
            </div>
          </div>
          <p className="text-xs font-medium opacity-90 mb-1">Tổng Nhân Lực</p>
          <p className="text-2xl font-bold">{summary?.totalWorkforce.value || 0}</p>
          <p className="text-xs opacity-75 mt-1">{summary?.totalWorkforce.label}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-5 text-white hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-white/20 rounded-lg">
              <Tent size={22} />
            </div>
          </div>
          <p className="text-xs font-medium opacity-90 mb-1">Trại Đang Hoạt Động</p>
          <p className="text-2xl font-bold">{summary?.totalActiveCamps || 0}</p>
          <p className="text-xs opacity-75 mt-1">Trại đang diễn ra hoặc mở đăng ký</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Growth Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6">
          <h3 className="text-lg font-bold text-[#111827] mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-green-500" />
            Tăng Trưởng Người Dùng Mới
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={customerGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6B7280" />
              <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  padding: "12px",
                }}
              />
              <Line
                dataKey="Người dùng mới"
                stroke={COLORS.success}
                strokeWidth={3}
                dot={{ fill: COLORS.success, r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Workforce Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6">
          <h3 className="text-lg font-bold text-[#111827] mb-4 flex items-center gap-2">
            <UserCheck size={20} className="text-purple-500" />
            Phân Bố Nhân Lực
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={workforceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} (${percent ? (percent * 100).toFixed(0) : 0}%)`}
              >
                {workforceData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.role === "Manager"
                        ? COLORS.purple
                        : entry.role === "Staff"
                        ? COLORS.info
                        : COLORS.teal
                    }
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Locations by Camp Count */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6">
          <h3 className="text-lg font-bold text-[#111827] mb-4 flex items-center gap-2">
            <MapPin size={20} className="text-orange-500" />
            Top Địa Điểm Tổ Chức Trại
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={locationData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="#6B7280" />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 11 }}
                stroke="#6B7280"
                width={150}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                }}
                formatter={(value: any, name?: string, props?: any) => {
                  if (name === "Tổng số trại") {
                    return [
                      <div key="tooltip" className="space-y-1">
                        <div className="font-semibold text-orange-600">
                          Tổng số trại: {value}
                        </div>
                        <div className="text-green-600">
                          Đang hoạt động: {props.payload.activeCamps}
                        </div>
                      </div>,
                      "",
                    ];
                  }
                  return [value, name];
                }}
              />
              <Bar dataKey="campCount" fill={COLORS.orange} radius={[0, 8, 8, 0]} name="Tổng số trại" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Camp Status Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6">
          <h3 className="text-lg font-bold text-[#111827] mb-4 flex items-center gap-2">
            <Tent size={20} className="text-teal-500" />
            Trạng Thái Trại
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={campStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${percent ? (percent * 100).toFixed(0) : 0}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {campStatusData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CAMP_STATUS_COLORS[entry.name] || COLORS.info}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-[#111827] mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-blue-500" />
            Doanh Thu Theo Tháng
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#6B7280" />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#6B7280"
                label={{
                  value: "Doanh thu (k₫)",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 12 },
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  padding: "12px",
                }}
                formatter={(value: any, name?: string, props?: any) => {
                  if (name === "Doanh thu (k₫)" && props?.payload) {
                    const rawRevenue = props.payload.revenueRaw;
                    return [
                      <div key="tooltip" className="font-semibold text-blue-600">
                        {rawRevenue.toLocaleString("vi-VN")} ₫
                      </div>,
                      "",
                    ];
                  }
                  return [value, name || ""];
                }}
              />
              <Bar dataKey="Doanh thu (k₫)" fill={COLORS.primary} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Priority Actions */}
      {priorityActions && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Camps */}
          <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E7EB] bg-amber-50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                <AlertCircle size={20} />
                Trại Chờ Duyệt
                {priorityActions.pendingCamps.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded-full">
                    {priorityActions.pendingCamps.length}
                  </span>
                )}
              </h3>
              <button
                onClick={() => navigate("/admin/camps")}
                className="text-sm bg-white border border-amber-600 text-amber-700 hover:bg-amber-50 font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors"
              >
                Xem tất cả
                <Eye size={16} />
              </button>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {priorityActions.pendingCamps.length === 0 ? (
                <div className="p-8 text-center text-[#6B7280]">
                  <CheckCircle size={48} className="mx-auto mb-3 text-green-500" />
                  <p className="font-medium">Không có trại chờ duyệt</p>
                  <p className="text-sm mt-1">Tất cả trại đã được xử lý</p>
                </div>
              ) : (
                <div className="divide-y divide-[#E5E7EB]">
                  {priorityActions.pendingCamps.map((camp) => (
                    <div
                      key={camp.campId}
                      className="p-4 hover:bg-amber-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/camps`)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-[#111827] mb-1 truncate">
                            {camp.name}
                          </h4>
                          <p className="text-sm text-[#6B7280] mb-2">
                            Quản lý: {camp.managerName}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                            <Clock size={14} />
                            <span>
                              Gửi lúc: {dayjs(camp.submittedDate).format("DD/MM/YYYY HH:mm")}
                            </span>
                          </div>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 flex-shrink-0">
                          {camp.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                <Users size={20} className="text-blue-500" />
                Người Dùng Mới
              </h3>
              <button
                onClick={() => navigate("/admin/users")}
                className="text-sm bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors"
              >
                Xem tất cả
                <Eye size={16} />
              </button>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              <div className="divide-y divide-[#E5E7EB]">
                {priorityActions.recentUsers.slice(0, 10).map((user) => (
                  <div
                    key={user.userId}
                    className="p-4 hover:bg-[#F9FAFB] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {user.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#111827] truncate">
                          {user.fullName}
                        </p>
                        <p className="text-xs text-[#6B7280] truncate">{user.email}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-[#6B7280]">
                          {dayjs(user.registeredDate).format("DD/MM/YYYY")}
                        </p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 mt-1">
                          {user.role}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
