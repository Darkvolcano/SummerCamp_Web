import React, { useEffect, useState } from "react";
import { Spin, Button, Progress } from "antd";
import { useNavigate } from "react-router-dom";
import { 
  TrendingUp, 
  Users, 
  AlertCircle, 
  DollarSign, 
  UserCheck,
  Calendar,
  Eye,
  FileDown
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
import { useManagerContext } from "../../../hooks/useManagerContext";
import campService, { type CampResponseDto } from "../../../services/campService";
import dashboardService, {
  type ManagerSummaryResponseDto,
  type ManagerAnalyticsResponseDto,
  type ManagerOperationsResponseDto,
} from "../../../services/dashboardService";
import campReportService from "../../../services/campReportService";
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
};

const STATUS_COLORS: { [key: string]: string } = {
  Confirmed: COLORS.success,
  PendingPayment: COLORS.warning,
  PendingApproval: COLORS.info,
  Canceled: COLORS.danger,
  Rejected: COLORS.danger,
  Approved: COLORS.success,
  OnGoing: COLORS.purple,
};

const ManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { selectedCampId } = useManagerContext();
  const { toastError } = useNotification();
  const [camp, setCamp] = useState<CampResponseDto | null>(null);
  const [summary, setSummary] = useState<ManagerSummaryResponseDto | null>(null);
  const [analytics, setAnalytics] = useState<ManagerAnalyticsResponseDto | null>(null);
  const [operations, setOperations] = useState<ManagerOperationsResponseDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    if (!selectedCampId) {
      setCamp(null);
      setSummary(null);
      setAnalytics(null);
      setOperations(null);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const campData = await campService.getCampById(selectedCampId);
        setCamp(campData);

        const isDraft = campData.status === "DRAFT" || campData.status === "Draft";
        const isRejected = campData.status === "REJECTED" || campData.status === "Rejected";

        if (!isDraft && !isRejected) {
          setDashboardLoading(true);
          const [summaryData, analyticsData, operationsData] = await Promise.all([
            dashboardService.getManagerSummary(selectedCampId),
            dashboardService.getManagerAnalytics(selectedCampId),
            dashboardService.getManagerOperations(selectedCampId),
          ]);
          setSummary(summaryData);
          setAnalytics(analyticsData);
          setOperations(operationsData);
        }
      } catch (error: any) {
        console.error("Failed to load dashboard:", error);
        const errorMessage = error.response?.data?.message || "Không thể tải dashboard";
        toastError("Lỗi", errorMessage);
      } finally {
        setLoading(false);
        setDashboardLoading(false);
      }
    };

    fetchData();
  }, [selectedCampId, toastError]);

  const handleSubmitForApproval = async () => {
    if (!camp) return;

    try {
      setLoading(true);
      const updatedCamp = await campService.submitCampForApproval(camp.campId);
      setCamp(updatedCamp);
      toastError("Thành công", "Gửi trại hè để phê duyệt");
    } catch (error: any) {
      console.error("Failed to submit camp:", error);
      const errorMessage = error.response?.data?.message || "Không thể gửi duyệt";
      toastError("Lỗi", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    if (!selectedCampId || !camp) return;

    try {
      setExportLoading(true);
      const result = await campReportService.exportToExcel(selectedCampId);

      if (result instanceof Blob) {
        const fileName = `Bao_Cao_${camp.name}_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`;
        campReportService.downloadFile(result, fileName);
        toastError("Thành công", "Đã tải xuống báo cáo thành công");
      } else {
        await campReportService.downloadFromUrl(result.downloadUrl, result.fileName);
        toastError("Thành công", "Đã tải xuống báo cáo thành công");
      }
    } catch (error: any) {
      console.error("Failed to export report:", error);
      const errorMessage = error.response?.data?.message || "Không thể xuất báo cáo";
      toastError("Lỗi", errorMessage);
    } finally {
      setExportLoading(false);
    }
  };

  if (!selectedCampId) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[500px]">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-indigo-200 p-12 rounded-2xl text-center shadow-lg hover:shadow-xl transition-shadow duration-300 max-w-md">
          <h3 className="text-xl font-bold text-indigo-900 mb-2">Chọn Trại</h3>
          <p className="text-indigo-700 text-base leading-relaxed">
            Vui lòng chọn một trại từ thanh bên trái để xem Dashboard
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  const isDraft = camp && (camp.status === "DRAFT" || camp.status === "Draft");
  const isRejected = camp && (camp.status === "REJECTED" || camp.status === "Rejected");

  if (isDraft || isRejected) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-center">
          <div
            className={`rounded-lg p-4 w-full max-w-2xl ${
              isRejected
                ? "bg-red-50 border-2 border-red-200"
                : "bg-blue-50 border-2 border-blue-200"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <h3
                  className={`text-base font-bold mb-1 ${
                    isRejected ? "text-red-900" : "text-blue-900"
                  }`}
                >
                  {isRejected ? "⚠️ Approval Required" : "📋 Camp Not Published"}
                </h3>
                <p
                  className={`text-md mb-3 ${
                    isRejected ? "text-red-700" : "text-blue-700"
                  }`}
                >
                  {isRejected
                    ? "Bị từ chối - kiểm tra và hoàn thành tất cả thiết lập để gửi duyệt"
                    : "Hoàn thành tất cả thiết lập để gửi duyệt"}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
                  {[
                    { label: "Phân Công NV", path: "/manager/staffs" },
                    { label: "Địa Điểm", path: "/manager/locations" },
                    { label: "Nhóm", path: "/manager/groups" },
                    { label: "Chỗ Ở", path: "/manager/accommodation" },
                    { label: "Hoạt Động", path: "/manager/activities" },
                    { label: "Đưa Đón", path: "/manager/transportation" },
                  ].map((item, index) => (
                    <button
                      key={index}
                      onClick={() => navigate(item.path)}
                      className={`${
                        isRejected
                          ? "bg-red-100 hover:bg-red-200 border-red-300"
                          : "bg-blue-100 hover:bg-blue-200 border-blue-300"
                      } border rounded-lg p-2 text-left transition-all group flex items-center gap-2`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          isRejected ? "bg-red-600 text-white" : "bg-blue-600 text-white"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          isRejected
                            ? "text-red-900 group-hover:text-red-700"
                            : "text-blue-900 group-hover:text-blue-700"
                        }`}
                      >
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <Button
                type="primary"
                onClick={handleSubmitForApproval}
                loading={loading}
                size="middle"
                className={
                  isRejected
                    ? "bg-red-600 hover:bg-red-700 text-white flex-shrink-0"
                    : "bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0"
                }
              >
                Gửi Duyệt
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-[#111827] mb-2">{camp?.name}</h1>
              <p className="text-[#6B7280] text-sm mb-4 line-clamp-2">{camp?.description}</p>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    isRejected ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {camp?.status}
                </span>
                <span className="text-[#6B7280] text-xs">
                  📍 {camp?.location?.name || "Không có"}
                </span>
              </div>
            </div>
            {camp?.image && (
              <img
                src={camp.image}
                alt={camp.name}
                className="w-32 h-32 rounded-lg object-cover flex-shrink-0"
              />
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-6 border-t border-[#E5E7EB]">
            <div>
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1">
                Thời Gian
              </p>
              <p className="text-sm font-bold text-[#111827]">
                {camp && new Date(camp.startDate).toLocaleDateString("vi-VN")}
              </p>
              <p className="text-xs text-[#6B7280]">
                đến {camp && new Date(camp.endDate).toLocaleDateString("vi-VN")}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1">
                Giá
              </p>
              <p className="text-sm font-bold text-[#111827]">
                {camp?.price.toLocaleString()} VND
              </p>
              <p className="text-xs text-[#6B7280]">Mỗi người</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1">
                Số Người
              </p>
              <p className="text-sm font-bold text-[#111827]">
                {camp?.minParticipants}-{camp?.maxParticipants}
              </p>
              <p className="text-xs text-[#6B7280]">Tối thiểu-Tối đa</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1">
                Độ Tuổi
              </p>
              <p className="text-sm font-bold text-[#111827]">
                {camp?.minAge} - {camp?.maxAge}
              </p>
              <p className="text-xs text-[#6B7280]">tuổi</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (dashboardLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" tip="Đang tải dashboard..." />
      </div>
    );
  }

  const registrationTrendData = analytics?.registrationTrend.map((item) => ({
    date: dayjs(item.date).format("DD/MM"),
    "Số lượng đăng ký": item.count,
    "Doanh thu (k₫)": item.revenue / 1000,
    revenueRaw: item.revenue,
  })) || [];

  const statusDistributionData = analytics?.statusDistribution
    ? Object.entries(analytics.statusDistribution).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  const genderData = analytics?.camperProfile.gender
    ? Object.entries(analytics.camperProfile.gender).map(([name, value]) => ({
        name: name === "Male" ? "Nam" : name === "Female" ? "Nữ" : "Khác",
        value,
      }))
    : [];

  const ageData = analytics?.camperProfile.ageGroups
    ? Object.entries(analytics.camperProfile.ageGroups).map(([age, count]) => ({
        age: `${age} tuổi`,
        count,
      }))
    : [];

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6 space-y-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#111827]">Dashboard</h1>
          <p className="text-[#6B7280] mt-1">Tổng quan trại hè {camp?.name}</p>
        </div>
        <Button
          type="primary"
          icon={<FileDown size={18} />}
          onClick={handleExportReport}
          loading={exportLoading}
          size="large"
          className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
        >
          {exportLoading ? "Đang xuất báo cáo..." : "Xuất Báo Cáo Excel"}
        </Button>
      </div>

      {/* Compact Camp Info */}
      <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {camp?.image && (
              <img
                src={camp.image}
                alt={camp.name}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-[#111827] truncate">{camp?.name}</h2>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  {camp?.status}
                </span>
                <span className="text-xs text-[#6B7280]">📍 {camp?.location?.name || "N/A"}</span>
                <span className="text-xs text-[#6B7280]">
                  👥 {camp?.minParticipants}-{camp?.maxParticipants} người
                </span>
                <span className="text-xs text-[#6B7280]">
                  🎂 {camp?.minAge}-{camp?.maxAge} tuổi
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-4 flex-shrink-0">
            <div className="text-right">
              <p className="text-xs text-[#6B7280] mb-0.5">Bắt đầu</p>
              <p className="text-sm font-semibold text-[#111827]">
                {camp && dayjs(camp.startDate).format("DD/MM/YYYY")}
              </p>
              <p className="text-xs text-[#6B7280]">
                {camp && dayjs(camp.startDate).format("HH:mm")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#6B7280] mb-0.5">Kết thúc</p>
              <p className="text-sm font-semibold text-[#111827]">
                {camp && dayjs(camp.endDate).format("DD/MM/YYYY")}
              </p>
              <p className="text-xs text-[#6B7280]">
                {camp && dayjs(camp.endDate).format("HH:mm")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-white/20 rounded-lg">
              <DollarSign size={22} />
            </div>
            <TrendingUp size={18} className="opacity-75" />
          </div>
          <p className="text-xs font-medium opacity-90 mb-1">Doanh Thu Thực Tế</p>
          <p className="text-2xl font-bold">
            {summary?.totalRevenue.toLocaleString("vi-VN")} ₫
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-5 text-white hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-white/20 rounded-lg">
              <Users size={22} />
            </div>
            <div className="text-right">
              <p className="text-xs opacity-75">
                {summary?.occupancy.current}/{summary?.occupancy.max}
              </p>
            </div>
          </div>
          <p className="text-xs font-medium opacity-90 mb-1">Tỉ Lệ Lấp Đầy</p>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold">{summary?.occupancy.percentage.toFixed(1)}%</p>
          </div>
          <Progress
            percent={summary?.occupancy.percentage || 0}
            showInfo={false}
            strokeColor="#fff"
            trailColor="rgba(255,255,255,0.3)"
            className="mt-2"
            size="small"
          />
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-5 text-white hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-white/20 rounded-lg">
              <AlertCircle size={22} />
            </div>
            {summary && summary.pendingApprovals > 0 && (
              <span className="px-2 py-0.5 bg-white/30 rounded-full text-xs font-bold">
                Cần xử lý!
              </span>
            )}
          </div>
          <p className="text-xs font-medium opacity-90 mb-1">Đăng Ký Chờ Duyệt</p>
          <p className="text-2xl font-bold">{summary?.pendingApprovals || 0}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-5 text-white hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-white/20 rounded-lg">
              <UserCheck size={22} />
            </div>
          </div>
          <p className="text-xs font-medium opacity-90 mb-1">Tổng Số Trại Viên</p>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold">{summary?.totalCampers || 0}</p>
            <p className="text-xs opacity-75 mb-0.5">trại viên</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-5 text-white hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-white/20 rounded-lg">
              <AlertCircle size={22} />
            </div>
          </div>
          <p className="text-xs font-medium opacity-90 mb-1">Tỉ Lệ Hủy</p>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold">{summary?.cancellationRate.toFixed(1) || 0}%</p>
          </div>
          <Progress
            percent={summary?.cancellationRate || 0}
            showInfo={false}
            strokeColor="#fff"
            trailColor="rgba(255,255,255,0.3)"
            className="mt-2"
            size="small"
            status={summary && summary.cancellationRate > 15 ? "exception" : "normal"}
          />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6">
          <h3 className="text-lg font-bold text-[#111827] mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-500" />
            Xu Hướng Đăng Ký
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={registrationTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6B7280" />
              <YAxis 
                tick={{ fontSize: 12 }} 
                stroke="#6B7280"
                label={{ value: 'Doanh thu (k₫)', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
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
                    const count = props.payload["Số lượng đăng ký"];
                    return [
                      <div key="tooltip" className="space-y-1">
                        <div className="font-semibold text-green-600">
                          Doanh thu: {rawRevenue.toLocaleString("vi-VN")} ₫
                        </div>
                        <div className="text-blue-600">
                          Số lượng đăng ký: {count}
                        </div>
                      </div>,
                      ""
                    ];
                  }
                  return [value, name || ""];
                }}
                labelFormatter={(label) => `Ngày ${label}`}
              />
              <Line 
                dataKey="Doanh thu (k₫)" 
                stroke={COLORS.success}
                strokeWidth={3}
                dot={{ fill: COLORS.success, r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6">
          <h3 className="text-lg font-bold text-[#111827] mb-4">Trạng Thái Đơn Đăng Ký</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${percent ? (percent * 100).toFixed(0) : 0}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistributionData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={STATUS_COLORS[entry.name] || COLORS.info}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6">
          <h3 className="text-lg font-bold text-[#111827] mb-4">Phân Bố Giới Tính</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label
              >
                {genderData.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={[COLORS.primary, COLORS.pink, COLORS.teal][index % 3]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6">
          <h3 className="text-lg font-bold text-[#111827] mb-4">Phân Bố Độ Tuổi</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="age" tick={{ fontSize: 12 }} stroke="#6B7280" />
              <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="count" fill={COLORS.purple} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Registrations */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#111827] flex items-center gap-2">
            <Calendar size={20} className="text-blue-500" />
            Đăng Ký Gần Đây
          </h3>
          <button
            onClick={() => navigate("/manager/registrations")}
            className="text-sm bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors"
          >
            Xem tất cả
            <Eye size={16} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Trại Viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Ngày Đăng Ký
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Trạng Thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Số Tiền
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Thao Tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {operations?.recentRegistrations.slice(0, 5).map((reg) => (
                <tr key={reg.registrationId} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {reg.avatar ? (
                        <img
                          src={reg.avatar}
                          alt={reg.camperName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {reg.camperName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-[#111827]">{reg.camperName}</p>
                        <p className="text-xs text-[#6B7280]">ID: #{reg.registrationId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#374151]">
                    {dayjs(reg.registrationDate).format("DD/MM/YYYY HH:mm")}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${STATUS_COLORS[reg.status] || COLORS.info}20`,
                        color: STATUS_COLORS[reg.status] || COLORS.info,
                      }}
                    >
                      {reg.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-[#111827]">
                    {reg.amount.toLocaleString("vi-VN")} ₫
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => navigate(`/manager/registrations`)}
                      className="bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 text-sm font-medium px-3 py-1 rounded-lg transition-colors"
                    >
                      Xem
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Capacity Alerts */}
      {operations?.capacityAlerts && operations.capacityAlerts.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
            <AlertCircle size={20} />
            Cảnh Báo Sức Chứa
          </h3>
          <div className="space-y-3">
            {operations.capacityAlerts.map((alert: any, index: number) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-amber-200">
                <p className="text-sm text-amber-900">{alert.message || "Cảnh báo sức chứa"}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
