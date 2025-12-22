import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, message, Modal, List } from "antd";
import {
  CalendarOutlined,
  EnvironmentOutlined,
  UsergroupAddOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  ArrowLeftOutlined,
  CheckCircleFilled,
  TagOutlined,
  GiftOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import campService, { type CampResponseDto } from "../../services/campService";
import activityScheduleService, { type ActivityScheduleResponseDto } from "../../services/activityScheduleService";
import { useAuthStore } from "../../services/userService";
import "./CampDetail.css";

const CampDetail: React.FC = () => {
  const { campId } = useParams<{ campId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [camp, setCamp] = useState<CampResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [schedules, setSchedules] = useState<ActivityScheduleResponseDto[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);

  useEffect(() => {
    console.log("🔍 [CampDetail] Component mounted, id:", campId);
    if (campId) {
      fetchCampDetail(parseInt(campId));
    } else {
      console.error("❌ [CampDetail] No ID provided!");
      setLoading(false);
    }
  }, [campId]);

  const fetchCampDetail = async (campId: number) => {
    try {
      console.log(`📤 [CampDetail] Fetching camp ${campId}`);
      setLoading(true);
      const data = await campService.getCampById(campId);
      console.log("✅ [CampDetail] Camp data received:", data);
      setCamp(data);
    } catch (error) {
      console.error("❌ [CampDetail] Error fetching camp detail:", error);
      message.error("Không thể tải thông tin hội trại");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end day
  };

  // Map status to display text and color
  const getStatusLabel = (status: string) => {
    const statusMap: {
      [key: string]: { label: string; color: string; canRegister: boolean };
    } = {
      Published: { label: "Sắp diễn ra", color: "#FFC107", canRegister: false },
      OpenForRegistration: {
        label: "Mở đăng ký",
        color: "#4CAF50",
        canRegister: true,
      },
      RegistrationClosed: {
        label: "Đã đóng đăng ký",
        color: "#F44336",
        canRegister: false,
      },
    };
    return (
      statusMap[status] || { label: status, color: "#999", canRegister: false }
    );
  };

  const handleRegister = () => {
    const statusInfo = getStatusLabel(camp?.status || "");

    if (!statusInfo.canRegister) {
      message.warning("Hiện tại chưa mở đăng ký cho hội trại này");
      return;
    }

    if (camp && camp.currentCapacity >= camp.maxParticipants) {
      message.warning("Hội trại đã đầy, không thể đăng ký thêm");
      return;
    }

    if (!user) {
      message.warning("Vui lòng đăng nhập để đăng ký");
      navigate("/login");
      return;
    }
    // Navigate to registration page
    navigate(`/register-camp/${camp?.campId}`);
  };

  const handleViewSchedules = async () => {
    if (!camp) return;
    try {
      setSchedulesLoading(true);
      setScheduleModalVisible(true);
      const data = await activityScheduleService.getActivitySchedulesByCamp(camp.campId);
      setSchedules(data);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      message.error("Không thể tải lịch trình hoạt động");
    } finally {
      setSchedulesLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600 font-semibold">
            Đang tải thông tin hội trại...
          </p>
        </div>
      </div>
    );
  }

  if (!camp) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="text-6xl mb-4 animate-bounce">🏕️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Không tìm thấy hội trại
        </h2>
        <p className="text-gray-600 mb-6">
          Hội trại không tồn tại hoặc đã bị xóa
        </p>
        <button
          onClick={() => navigate("/camp")}
          className="bg-[#FF8F50] text-white px-8 py-3 rounded-full hover:bg-[#ff7e3d] transition-all shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
        >
          ← Quay lại danh sách
        </button>
      </div>
    );
  }

  const duration = calculateDuration(camp.startDate, camp.endDate);

  return (
    <div className="camp-detail-page bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-1">
        <button
          onClick={() => navigate("/camp")}
          className="flex bg-[#FF8F50] text-white items-center gap-2 hover:text-[#ffffff] font-semibold group px-6 py-2 rounded-full hover:shadow-lg hover:bg-[#ff7e3d] transition-all"
        >
          <ArrowLeftOutlined className="group-hover:-translate-x-1 transition-transform" />
          <span>Quay lại danh sách</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="relative h-96 rounded-3xl overflow-hidden shadow-2xl group">
              <img
                src={
                  camp.image ||
                  "https://via.placeholder.com/1200x600?text=Summer+Camp"
                }
                alt={camp.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

              {/* Badges Container */}
              <div className="absolute top-6 right-6">
                {/* Camp Type Badge */}
                {camp.campType && (
                  <span className="bg-[#FF8F50] text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg border-2 border-white backdrop-blur-sm">
                    <TagOutlined className="mr-1" />
                    {camp.campType.name}
                  </span>
                )}
              </div>

              {/* Promotion Badge (bottom-left) */}
              {camp.promotion && (
                <div className="absolute bottom-6 left-6">
                  <div className="bg-green-500 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg border-2 border-white backdrop-blur-sm flex items-center gap-2">
                    <GiftOutlined />
                    <span>Khuyến mãi: {camp.promotion.name}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Title, Location & Description */}
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {camp.name}
              </h1>


              <p className="text-gray-700 leading-relaxed text-lg">
                {camp.description}
              </p>
            </div>

            {/* Camp Details */}
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Thông tin chi tiết
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Date */}
                <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-orange-50 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-orange-200 flex items-center justify-center flex-shrink-0">
                    <CalendarOutlined className="text-[#FF8F50] text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Ngày bắt đầu</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatDate(camp.startDate)}
                    </p>
                  </div>
                </div>

                {/* End Date */}
                <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-orange-50 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-orange-200 flex items-center justify-center flex-shrink-0">
                    <CalendarOutlined className="text-[#FF8F50] text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Ngày kết thúc</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatDate(camp.endDate)}
                    </p>
                  </div>
                </div>

                {/* Duration */}
                <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-orange-50 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-orange-200 flex items-center justify-center flex-shrink-0">
                    <ClockCircleOutlined className="text-[#FF8F50] text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Thời gian</p>
                    <p className="text-lg font-bold text-gray-900">
                      {duration} ngày{" "}
                      {duration > 1 ? `${duration - 1} đêm` : ""}
                    </p>
                  </div>
                </div>

                {/* Participants */}
                <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-orange-50 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-orange-200 flex items-center justify-center flex-shrink-0">
                    <UsergroupAddOutlined className="text-[#FF8F50] text-xl" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Số lượng</p>
                    <p className="text-lg font-bold text-gray-900">
                      {camp.minParticipants} - {camp.maxParticipants} trẻ
                    </p>
                    <div className="mt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-gray-600">Đã đăng ký:</span>
                        <span className={`text-sm font-bold ${
                          camp.currentCapacity >= camp.maxParticipants 
                            ? 'text-red-600' 
                            : camp.currentCapacity >= camp.maxParticipants * 0.8
                            ? 'text-orange-600'
                            : 'text-green-600'
                        }`}>
                          {camp.currentCapacity}/{camp.maxParticipants}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            camp.currentCapacity >= camp.maxParticipants
                              ? 'bg-red-500'
                              : camp.currentCapacity >= camp.maxParticipants * 0.8
                              ? 'bg-orange-500'
                              : 'bg-green-500'
                          }`}
                          style={{
                            width: `${Math.min((camp.currentCapacity / camp.maxParticipants) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="mt-8 p-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl border-2 border-orange-200">
                <div className="flex items-start gap-4">
                  <EnvironmentOutlined className="text-2xl mt-1" style={{ color: '#6B7280' }} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-2">
                      Địa điểm tổ chức
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {camp.location?.name || camp.place} - {camp.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Section */}
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                ✨ Điểm nổi bật
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Hoạt động ngoài trời phong phú",
                  "Đội ngũ hướng dẫn viên chuyên nghiệp",
                  "An toàn tuyệt đối cho trẻ",
                  "Phát triển kỹ năng sống",
                  "Kết bạn và giao lưu",
                  "Trải nghiệm khó quên",
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 transition-colors group"
                  >
                    <CheckCircleFilled className="text-xl group-hover:scale-110 transition-transform" style={{ color: '#10b981' }} />
                    <span className="text-gray-700 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Pricing Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-8 shadow-xl sticky top-24 border-2 border-orange-100 hover:shadow-2xl transition-shadow space-y-6">
              {/* Price */}
              <div className="text-center pb-6 border-b-2 border-gray-100">
                <p className="text-gray-500 text-sm mb-2 uppercase tracking-wide">
                  Giá hội trại
                </p>
                <div className="flex items-center justify-center gap-2">
                  <DollarOutlined className="text-[#FF8F50] text-2xl" />
                  <span className="text-5xl font-bold text-[#FF8F50]">
                    {camp.price.toLocaleString("vi-VN")}
                  </span>
                  <span className="text-xl text-gray-600 font-semibold">đ</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">/ 1 trẻ</p>
              </div>

              {/* Quick Info */}
              <div className="space-y-4 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Thời gian:</span>
                  <span className="font-bold text-gray-900">
                    {duration} ngày
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Số lượng:</span>
                  <span className="font-bold text-gray-900">
                    {camp.minParticipants}-{camp.maxParticipants} trẻ
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Còn trống:</span>
                  <span className={`font-bold ${
                    camp.currentCapacity >= camp.maxParticipants
                      ? 'text-red-600'
                      : camp.currentCapacity >= camp.maxParticipants * 0.8
                      ? 'text-orange-600'
                      : 'text-green-600'
                  }`}>
                    {camp.maxParticipants - camp.currentCapacity} chỗ
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Trạng thái:</span>
                  <div
                    className="px-3 py-1 rounded-full text-white text-sm font-bold"
                    style={{
                      backgroundColor: getStatusLabel(camp.status).color,
                    }}
                  >
                    {getStatusLabel(camp.status).label}
                  </div>
                </div>
                {camp.campType && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">
                      Loại trại:
                    </span>
                    <span className="font-bold text-gray-900 text-right">
                      {camp.campType.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Registration Period */}
              <div className="p-4 bg-blue-50 rounded-2xl border-2 border-blue-200">
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <CalendarOutlined className="text-blue-500" />
                  Thời gian đăng ký
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-600 text-xs mb-0.5">Mở đăng ký</p>
                    <p className="font-bold text-gray-900">
                      {formatDateTime(camp.registrationStartDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs mb-0.5">Đóng đăng ký</p>
                    <p className="font-bold text-gray-900">
                      {formatDateTime(camp.registrationEndDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Register Button */}
              <button
                onClick={handleRegister}
                disabled={!getStatusLabel(camp.status).canRegister || camp.currentCapacity >= camp.maxParticipants}
                className="w-full bg-gradient-to-r from-[#FF8F50] to-[#ff7e3d] hover:from-[#ff7e3d] hover:to-[#FF8F50] text-white font-bold py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-lg disabled:from-gray-400 disabled:to-gray-500"
              >
                {camp.currentCapacity >= camp.maxParticipants
                  ? "❌ Đã đầy chỗ"
                  : !getStatusLabel(camp.status).canRegister
                  ? "🔒 Chưa mở đăng ký"
                  : user
                  ? "🎯 Đăng ký ngay"
                  : "🔑 Đăng nhập để đăng ký"}
              </button>

              {/* Info Text */}
              {camp.currentCapacity >= camp.maxParticipants ? (
                <p className="text-center text-sm text-red-600 font-semibold">
                  ⚠️ Hội trại đã hết chỗ
                </p>
              ) : getStatusLabel(camp.status).canRegister && !user ? (
                <p className="text-center text-sm text-gray-500">
                  Bạn cần đăng nhập để đăng ký hội trại
                </p>
              ) : camp.currentCapacity >= camp.maxParticipants * 0.8 && getStatusLabel(camp.status).canRegister ? (
                <p className="text-center text-sm text-orange-600 font-semibold">
                  ⚡ Chỉ còn {camp.maxParticipants - camp.currentCapacity} chỗ!
                </p>
              ) : null}

              {/* View Schedule Button (only when logged in) */}
              {user && (
                <div className="pt-6 border-t-2 border-gray-100">
                  <button
                    onClick={handleViewSchedules}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-full transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <UnorderedListOutlined />
                    Xem lịch trình hoạt động
                  </button>
                </div>
              )}

              {/* Additional Info */}
              <div className="p-4">
                <p className={`text-sm text-center font-medium ${
                  camp.currentCapacity >= camp.maxParticipants
                    ? 'text-red-500'
                    : camp.currentCapacity >= camp.maxParticipants * 0.8
                    ? 'text-orange-500'
                    : 'text-gray-400'
                }`}>
                  {camp.currentCapacity >= camp.maxParticipants
                    ? '🚫 Hội trại đã hết chỗ'
                    : camp.currentCapacity >= camp.maxParticipants * 0.8
                    ? '⚡ Sắp hết chỗ! Đăng ký ngay!'
                    : '✨ Số lượng có hạn, đăng ký sớm để đảm bảo chỗ!'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Schedule Modal */}
      <Modal
        title="Lịch trình hoạt động"
        open={scheduleModalVisible}
        onCancel={() => setScheduleModalVisible(false)}
        footer={null}
        width={700}
      >
        {schedulesLoading ? (
          <div className="flex justify-center py-8">
            <Spin size="large" />
          </div>
        ) : (
          <List
            dataSource={schedules}
            locale={{ emptyText: "Chưa có lịch trình hoạt động nào" }}
            renderItem={(schedule) => (
              <List.Item className="hover:bg-gray-50 transition-colors px-4 rounded-lg">
                <div className="w-full">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-base mb-1">
                        {schedule.activity?.name || "Hoạt động"}
                      </h4>
                      <p className="text-sm text-gray-600">
                        📅 {new Date(schedule.startTime).toLocaleString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {" - "}
                        {new Date(schedule.endTime).toLocaleString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
      </Modal>
    </div>
  );
};

export default CampDetail;
