import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, message, Tag } from "antd";
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
} from "@ant-design/icons";
import campService, { type CampResponseDto } from "../../services/campService";
import { useAuthStore } from "../../services/userService";
import "./CampDetail.css";

const CampDetail: React.FC = () => {
  const { campId } = useParams<{ campId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [camp, setCamp] = useState<CampResponseDto | null>(null);
  const [loading, setLoading] = useState(true);

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
      message.error("Không thể tải thông tin trại hè");
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

  const handleRegister = () => {
    if (!user) {
      message.warning("Vui lòng đăng nhập để đăng ký");
      navigate("/login");
      return;
    }
    // Navigate to registration page
    navigate(`/register-camp/${camp?.campId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600 font-semibold">Đang tải thông tin trại hè...</p>
        </div>
      </div>
    );
  }

  if (!camp) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="text-6xl mb-4 animate-bounce">🏕️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Không tìm thấy trại hè
        </h2>
        <p className="text-gray-600 mb-6">
          Trại hè không tồn tại hoặc đã bị xóa
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
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-4">
        <button
          onClick={() => navigate("/camp")}
          className="flex items-center gap-2 text-gray-600 hover:text-[#FF8F50] transition-colors font-semibold group"
        >
          <ArrowLeftOutlined className="group-hover:-translate-x-1 transition-transform" />
          <span>Quay lại danh sách</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="relative h-96 rounded-3xl overflow-hidden shadow-2xl group">
              <img
                src={camp.image || "https://via.placeholder.com/1200x600?text=Summer+Camp"}
                alt={camp.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              
              {/* Badges Container */}
              <div className="absolute top-6 left-6 right-6 flex items-start justify-between">
                {/* Status Badge */}
                <Tag
                  color={camp.status === "Active" ? "success" : "warning"}
                  className="px-4 py-2 text-sm font-bold rounded-full border-2 border-white shadow-lg backdrop-blur-sm"
                >
                  {camp.status === "Active" ? "🟢 Đang mở đăng ký" : "🟡 Sắp mở"}
                </Tag>

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

            {/* Title & Location */}
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {camp.name}
              </h1>
              
              {/* Location & Place */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <EnvironmentOutlined className="text-[#FF8F50] text-xl" />
                  <span className="text-lg font-semibold">
                    {camp.location?.name || camp.place}
                  </span>
                </div>
                {camp.location && camp.place !== camp.location.name && (
                  <span className="text-gray-500">•</span>
                )}
                {camp.location && camp.place !== camp.location.name && (
                  <span className="text-gray-600 text-base">{camp.place}</span>
                )}
              </div>

              <p className="text-gray-700 leading-relaxed text-lg">
                {camp.description}
              </p>
            </div>

            {/* Registration Period Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-6 shadow-lg border-2 border-blue-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CalendarOutlined className="text-blue-500" />
                Thời gian đăng ký
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Mở đăng ký</p>
                  <p className="text-base font-bold text-gray-900">
                    {formatDateTime(camp.registrationStartDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Đóng đăng ký</p>
                  <p className="text-base font-bold text-gray-900">
                    {formatDateTime(camp.registrationEndDate)}
                  </p>
                </div>
              </div>
            </div>

            {/* Camp Details */}
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Thông tin chi tiết
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Date */}
                <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-orange-50 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
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
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
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
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <ClockCircleOutlined className="text-[#FF8F50] text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Thời gian</p>
                    <p className="text-lg font-bold text-gray-900">
                      {duration} ngày {duration > 1 ? `${duration - 1} đêm` : ""}
                    </p>
                  </div>
                </div>

                {/* Participants */}
                <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-orange-50 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <UsergroupAddOutlined className="text-[#FF8F50] text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Số lượng</p>
                    <p className="text-lg font-bold text-gray-900">
                      {camp.minParticipants} - {camp.maxParticipants} trẻ
                    </p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="mt-8 p-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl border-2 border-orange-200">
                <div className="flex items-start gap-4">
                  <EnvironmentOutlined className="text-[#FF8F50] text-2xl mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-2">Địa điểm tổ chức</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {camp.address}
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
                    <CheckCircleFilled className="text-green-500 text-xl group-hover:scale-110 transition-transform" />
                    <span className="text-gray-700 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Pricing Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-8 shadow-xl sticky top-24 border-2 border-orange-100 hover:shadow-2xl transition-shadow">
              {/* Price */}
              <div className="text-center mb-8 pb-6 border-b-2 border-gray-100">
                <p className="text-gray-500 text-sm mb-2 uppercase tracking-wide">Giá trại hè</p>
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
              <div className="space-y-4 mb-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
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
                  <span className="text-gray-600 font-medium">Trạng thái:</span>
                  <Tag
                    color={camp.status === "Active" ? "success" : "warning"}
                    className="font-semibold"
                  >
                    {camp.status === "Active" ? "Đang mở" : "Sắp mở"}
                  </Tag>
                </div>
                {camp.campType && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Loại trại:</span>
                    <span className="font-bold text-gray-900 text-right">
                      {camp.campType.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Register Button */}
              <button
                onClick={handleRegister}
                disabled={camp.status !== "Active"}
                className="w-full bg-gradient-to-r from-[#FF8F50] to-[#ff7e3d] hover:from-[#ff7e3d] hover:to-[#FF8F50] text-white font-bold py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-lg disabled:from-gray-400 disabled:to-gray-500"
              >
                {camp.status !== "Active" 
                  ? "🔒 Chưa mở đăng ký" 
                  : user 
                    ? "🎯 Đăng ký ngay" 
                    : "🔑 Đăng nhập để đăng ký"
                }
              </button>

              {/* Info Text */}
              {camp.status === "Active" && !user && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  Bạn cần đăng nhập để đăng ký trại hè
                </p>
              )}

              {/* Contact Info */}
              <div className="mt-6 pt-6 border-t-2 border-gray-100 text-center">
                <p className="text-sm text-gray-600 mb-3 font-medium">
                  💬 Cần hỗ trợ thêm thông tin?
                </p>
                <button
                  onClick={() => navigate("/contact")}
                  className="text-[#FF8F50] font-bold hover:underline hover:text-[#ff7e3d] transition-colors"
                >
                  Liên hệ với chúng tôi →
                </button>
              </div>

              {/* Additional Info */}
              <div className="mt-6 p-4 bg-blue-50 rounded-2xl border-2 border-blue-200">
                <p className="text-xs text-blue-800 text-center font-semibold">
                  ℹ️ Số lượng có hạn, đăng ký sớm để đảm bảo chỗ!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampDetail;