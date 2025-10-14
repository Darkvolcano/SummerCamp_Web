import React, { useEffect, useState } from "react";
import { Card, Spin, message } from "antd";
import { SearchOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { useAuthStore } from "../../services/userService"; 
import { useNavigate } from "react-router-dom";
import campService, {
  type CampResponseDto,
  type CampType,
} from "../../services/campService";
import "./ListCamp.css";

const ListCamp: React.FC = () => {
  const navigate = useNavigate();
  const [camps, setCamps] = useState<CampResponseDto[]>([]);
  const [campTypes, setCampTypes] = useState<CampType[]>([]);
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuthStore(); 

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [campsData, typesData] = await Promise.all([
        campService.getAllCamps(),
        campService.getAllCampTypes(),
      ]);
      console.log("Fetched camps:", campsData);
      console.log("Fetched camp types:", typesData);
      setCamps(campsData);
      setCampTypes(typesData);
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Không thể tải dữ liệu trại hè");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpClick = () => {
    navigate("/register");
  };

  // Filter camps
  const filteredCamps = camps.filter((camp) => {
    const matchesType =
      selectedType === null || camp.campTypeId === selectedType;
    const matchesSearch =
      camp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camp.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });


  // Get camp type name
  const getCampTypeName = (campTypeId: number | null) => {
    const campType = campTypes.find((type) => type.campTypeId === campTypeId);
    return campType?.name || "Chưa phân loại";
  };

  return (
    <div className="listCamp-page">
      {/* Hero Section */}
      <section
        className="relative min-h-[700px] flex items-center justify-center overflow-hidden"
        style={{
          background:
            "linear-gradient(270deg, rgba(83, 83, 83, 0.86) 0%, rgba(25, 25, 25, 0.688) 33.5%, rgba(25, 25, 25, 0.86) 100%), url(https://res.cloudinary.com/da9zmbssb/image/upload/v1760079496/GroupLearn_a1codk.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Content */}
        <div className="relative z-10 px-4 max-w-6xl mx-auto pt-20 pb-32">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-5xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                Tìm kiếm trại hè phù hợp
              </span>
              <span className="text-white text-4xl block mt-2">
                Cho trẻ phát huy tối đa tiềm năng
              </span>
            </h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Tham gia trại hè để con bạn có cơ hội phát triển toàn diện về kỹ
              năng, kiến thức và trải nghiệm những kỷ niệm đáng nhớ cùng bạn bè
              mới.
            </p>
            {!user && (
              <button
                onClick={handleSignUpClick}
                className="bg-[#FF8F50] text-white rounded-[105px] px-8 py-4 font-bold hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 whitespace-nowrap hover:bg-[#ff7e3d]"
              >
                Đăng ký ngay
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <div className="relative -mt-10 z-30 px-4 mb-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-full shadow-2xl p-2 flex items-center">
            <div className="flex-1 px-6">
              <input
                type="text"
                placeholder="Tìm kiếm trại hè..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-base font-semibold text-gray-800 border-none outline-none bg-transparent py-3"
              />
            </div>
            <button className="bg-[#FF8F50] text-white rounded-full px-8 py-4 font-bold hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 whitespace-nowrap hover:bg-[#ff7e3d]">
              <SearchOutlined className="text-lg" />
              <span>Tìm kiếm</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Categories */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-[#FF8F50]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                Danh mục
              </h3>

              <div className="space-y-2">
                <button
                  onClick={() => setSelectedType(null)}
                  className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    selectedType === null
                      ? "bg-gradient-to-r from-[#FF8F50] to-[#ff7e3d] text-white shadow-lg"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>Tất cả</span>
                    <span className="text-sm opacity-80">({camps.length})</span>
                  </div>
                </button>

                {campTypes.map((type) => {
                  const count = camps.filter(
                    (c) => c.campTypeId === type.campTypeId
                  ).length;
                  return (
                    <button
                      key={type.campTypeId}
                      onClick={() => setSelectedType(type.campTypeId)}
                      className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                        selectedType === type.campTypeId
                          ? "bg-gradient-to-r from-[#FF8F50] to-[#ff7e3d] text-white shadow-lg"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{type.name}</span>
                        <span className="text-sm opacity-80">({count})</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Camp Cards */}
          <main className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center min-h-[400px]">
                <Spin size="large" />
              </div>
            ) : filteredCamps.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🏕️</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Không tìm thấy trại hè
                </h3>
                <p className="text-gray-600">
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedType === null
                      ? "Tất cả trại hè"
                      : campTypes.find((t) => t.campTypeId === selectedType)
                          ?.name}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Hiển thị {filteredCamps.length} trại hè
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredCamps.map((camp) => (
                    <Card
                      key={camp.campId}
                      hoverable
                      className="camp-card overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                      cover={
                        <div className="relative h-48 overflow-hidden">
                          <img
                            alt={camp.name}
                            src={
                              camp.image ||
                              "https://via.placeholder.com/400x300?text=Summer+Camp"
                            }
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                          />
                          <div className="absolute top-4 right-4">
                            <span className="bg-[#FF8F50] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                              {getCampTypeName(camp.campTypeId)}
                            </span>
                          </div>
                        </div>
                      }
                      onClick={() => navigate(`/camp/${camp.campId}`)}
                    >
                      <div className="p-1">
                        <div className="flex items-center gap-2 text-[#FF8F50] mb-2">
                          <EnvironmentOutlined className="text-sm" />
                          <span className="text-xs font-semibold">
                            {camp.place}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 min-h-[2.5 rem]">
                          {camp.name}
                        </h3>

                        <p className="text-gray-600 text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
                          {camp.description}
                        </p>
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">
                              Giá từ
                            </p>
                            <p className="text-xl font-bold text-[#FF8F50]">
                              {camp.price.toLocaleString("vi-VN")}đ
                            </p>
                          </div>
                          <button className="bg-gradient-to-r from-[#FF8F50] to-[#ff7e3d] text-white px-4 py-1.5 rounded-full text-sm font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105">
                            Chi tiết
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ListCamp;
