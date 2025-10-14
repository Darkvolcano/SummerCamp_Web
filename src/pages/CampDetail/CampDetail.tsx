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
} from "@ant-design/icons";
import campService, { type CampResponseDto } from "../../services/campService";
import { useAuthStore } from "../../services/userService";
import "./CampDetail.css";

const CampDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [camp, setCamp] = useState<CampResponseDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCampDetail(parseInt(id));
    }
  }, [id]);

  const fetchCampDetail = async (campId: number) => {
    try {
      setLoading(true);
      const data = await campService.getCampById(campId);
      setCamp(data);
    } catch (error) {
      console.error("Error fetching camp detail:", error);
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

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!camp) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-6xl mb-4">🏕️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Không tìm thấy trại hè
        </h2>
        <button
          onClick={() => navigate("/camp")}
          className="mt-4 bg-[#FF8F50] text-white px-6 py-2 rounded-full hover:bg-[#ff7e3d] transition-all"
        >
          Quay lại danh sách
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
          className="flex items-center gap-2 text-gray-600 hover:text-[#FF8F50] transition-colors font-semibold"
        >
          <ArrowLeftOutlined />
          <span>Quay lại danh sách</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="relative h-96 rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={camp.image || "https://via.placeholder.com/1200x600?text=Summer+Camp"}
                alt={camp.name}
                className="w-full h-full object-cover"
              />
              {/* Status Badge - Only show status */}
              <div className="absolute top-6 left-6">
                <Tag
                  color={camp.status === "active" ? "success" : "default"}
                  className="px-4 py-1 text-sm font-semibold rounded-full"
                >
                  {camp.status === "active" ? "Đang mở" : "Sắp mở"}
                </Tag>
              </div>
            </div>

            {/* Title & Location */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {camp.name}
              </h1>
              <div className="flex items-center gap-2 text-gray-600 mb-6">
                <EnvironmentOutlined className="text-[#FF8F50] text-xl" />
                <span className="text-lg font-semibold">{camp.place}</span>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg">
                {camp.description}
              </p>
            </div>

            {/* Camp Details */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Thông tin chi tiết
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Date */}
                <div className="flex items-start gap-4">
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
                <div className="flex items-start gap-4">
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
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <ClockCircleOutlined className="text-[#FF8F50] text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Thời gian</p>
                    <p className="text-lg font-bold text-gray-900">
                      {duration} ngày
                    </p>
                  </div>
                </div>

                {/* Participants */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <UsergroupAddOutlined className="text-[#FF8F50] text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Số lượng</p>
                    <p className="text-lg font-bold text-gray-900">
                      {camp.minParticipants} - {camp.maxParticipants} người
                    </p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="mt-8 p-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl">
                <div className="flex items-start gap-4">
                  <EnvironmentOutlined className="text-[#FF8F50] text-2xl mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Địa điểm tổ chức</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {camp.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Section */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Điểm nổi bật
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Hoạt động ngoài trời phong phú",
                  "Đội ngũ hướng dẫn viên chuyên nghiệp",
                  "An toàn tuyệt đối",
                  "Phát triển kỹ năng sống",
                  "Kết bạn và giao lưu",
                  "Trải nghiệm khó quên",
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircleFilled className="text-green-500 text-xl" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Pricing Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-8 shadow-xl sticky top-24 border-2 border-orange-100">
              {/* Price */}
              <div className="text-center mb-8">
                <p className="text-gray-500 text-sm mb-2">Giá trại hè</p>
                <div className="flex items-center justify-center gap-2">
                  <DollarOutlined className="text-[#FF8F50] text-2xl" />
                  <span className="text-5xl font-bold text-[#FF8F50]">
                    {camp.price.toLocaleString("vi-VN")}
                  </span>
                  <span className="text-xl text-gray-600">đ</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">/ 1 trẻ</p>
              </div>

              {/* Quick Info */}
              <div className="space-y-4 mb-8 p-6 bg-gray-50 rounded-2xl">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Thời gian:</span>
                  <span className="font-semibold text-gray-900">
                    {duration} ngày
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Số lượng:</span>
                  <span className="font-semibold text-gray-900">
                    {camp.minParticipants}-{camp.maxParticipants} người
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Trạng thái:</span>
                  <Tag
                    color={camp.status === "active" ? "success" : "warning"}
                    className="font-semibold"
                  >
                    {camp.status === "active" ? "Đang mở" : "Sắp mở"}
                  </Tag>
                </div>
              </div>

              {/* Register Button */}
              <button
                onClick={handleRegister}
                disabled={camp.status !== "active"}
                className="w-full bg-gradient-to-r from-[#FF8F50] to-[#ff7e3d] hover:from-[#ff7e3d] hover:to-[#FF8F50] text-white font-bold py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-lg"
              >
                {user ? "Đăng ký ngay" : "Đăng nhập để đăng ký"}
              </button>

              {/* Contact Info */}
              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Cần hỗ trợ thêm thông tin?
                </p>
                <button
                  onClick={() => navigate("/contact")}
                  className="text-[#FF8F50] font-semibold hover:underline"
                >
                  Liên hệ với chúng tôi
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampDetail;