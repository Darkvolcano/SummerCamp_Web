import React, { useEffect, useState, useMemo } from "react";
import { Spin, Empty } from "antd";
import {
  SearchOutlined,
  UserAddOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../services/userService";
import { useNotification } from "../../../contexts/NotificationContext";
import { PagePath } from "../../../enums/page-path.enum";
import camperService, {
  type CamperResponseDto,
} from "../../../services/camperService";

const MyCampers: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toastError } = useNotification();
  const [campers, setCampers] = useState<CamperResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Fetch campers
  useEffect(() => {
    const fetchCampers = async () => {
      try {
        setLoading(true);
        const data = await camperService.getMyCampers();
        setCampers(data);
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || "Không thể tải danh sách trại viên";
        toastError("Lỗi", errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCampers();
    } else {
      navigate("/login");
    }
  }, [user, navigate, toastError]);

  // Filter campers
  const filteredCampers = useMemo(() => {
    return campers.filter((camper) => {
      const matchSearch = (camper.camperName || "")
        .toLowerCase()
        .includes(searchText.toLowerCase());
      return matchSearch;
    });
  }, [campers, searchText]);

  // Get gender display
  const getGenderDisplay = (gender: string) => {
    const genderMap: { [key: string]: string } = {
      Male: "Nam",
      Female: "Nữ",
      Other: "Khác",
    };
    return genderMap[gender] || gender;
  };

  // Calculate age from DOB
  const calculateAge = (dob: string) => {
    return dayjs().diff(dayjs(dob), "year");
  };

  if (loading && campers.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white py-20">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600 font-medium">
            Đang tải danh sách trại viên...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-20">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-5xl font-bold text-gray-900 mb-2">
          Danh sách trại viên của tôi
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Quản lý trạng thái các trại viên của bạn
        </p>

        {/* Search & Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          {/* Search */}
          <div className="mb-6">
            <p className="text-sm font-bold text-gray-900 mb-3">Tìm kiếm:</p>
            <div className="relative">
              <SearchOutlined
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg"
                style={{ color: "gray" }}
              />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên trại viên..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF8F50] focus:border-transparent"
              />
            </div>
          </div>

          {/* Add New Camper Button */}
          <button
            onClick={() => navigate("/user/my-campers/add")}
            className="w-full px-6 py-3 bg-[#FF8F50] text-white rounded-lg font-medium hover:bg-[#ff7e3d] transition-colors flex items-center justify-center gap-2"
          >
            <UserAddOutlined />
            Thêm trại viên mới
          </button>
        </div>

        {/* List */}
        {filteredCampers.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <Empty
              description="Không tìm thấy trại viên"
              style={{ marginBottom: 0 }}
            />
            <button
              onClick={() => navigate("/user/my-campers/add")}
              className="mt-6 px-6 py-2 bg-[#FF8F50] text-white rounded-full font-medium hover:bg-[#ff7e3d] transition-colors"
            >
              Tạo trại viên đầu tiên
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCampers.map((camper, index) => (
              <div
                key={camper.camperId}
                className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between gap-6">
                  {/* Left Section - Avatar & Info */}
                  <div className="flex items-center gap-4 flex-1">
                    {/* Number */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <p className="text-sm font-bold text-gray-600">
                        {index + 1}
                      </p>
                    </div>

                    {/* Avatar */}
                    {camper.avatar ? (
                      <img
                        src={camper.avatar}
                        alt={camper.camperName}
                        className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-[#FF8F50] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {camper.camperName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {camper.camperName}
                      </h3>
                    </div>
                  </div>

                  {/* Middle Section - Details */}
                  <div className="hidden md:grid md:grid-cols-3 gap-6 flex-1">
                    {/* Gender */}
                    <div className="text-center">
                      <p className="text-xs text-gray-500 font-medium mb-2">
                        GIỚI TÍNH
                      </p>
                      <span className="inline-block text-xs font-medium px-3 py-1.5 rounded-full bg-blue-100 text-blue-700">
                        {getGenderDisplay(camper.gender)}
                      </span>
                    </div>

                    {/* DOB */}
                    <div className="text-center">
                      <p className="text-xs text-gray-500 font-medium mb-2">
                        NGÀY SINH
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {dayjs(camper.dob).format("DD/MM/YYYY")}
                      </p>
                    </div>

                    {/* Age */}
                    <div className="text-center">
                      <p className="text-xs text-gray-500 font-medium mb-2">
                        TUỔI
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {calculateAge(camper.dob)} tuổi
                      </p>
                    </div>
                  </div>

                  {/* Right Section - Action Button */}
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => navigate(PagePath.USER_CAMPER_DETAIL.replace(":camperId", camper.camperId.toString()))}
                      className="flex items-center justify-center gap-1 bg-blue-500 text-white font-medium py-2 px-4 rounded-full text-sm hover:bg-blue-600 transition-colors whitespace-nowrap"
                    >
                      <EyeOutlined />
                      Xem chi tiết
                    </button>
                  </div>
                </div>

                {/* Mobile Section - Details */}
                <div className="md:hidden mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4">
                  {/* Gender */}
                  <div className="text-center">
                    <p className="text-xs text-gray-500 font-medium mb-1">
                      GIỚI TÍNH
                    </p>
                    <span className="inline-block text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                      {getGenderDisplay(camper.gender)}
                    </span>
                  </div>

                  {/* DOB */}
                  <div className="text-center">
                    <p className="text-xs text-gray-500 font-medium mb-1">
                      NGÀY SINH
                    </p>
                    <p className="text-xs font-medium text-gray-900">
                      {dayjs(camper.dob).format("DD/MM/YY")}
                    </p>
                  </div>

                  {/* Age */}
                  <div className="text-center">
                    <p className="text-xs text-gray-500 font-medium mb-1">
                      TUỔI
                    </p>
                    <p className="text-xs font-medium text-gray-900">
                      {calculateAge(camper.dob)} tuổi
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCampers;
