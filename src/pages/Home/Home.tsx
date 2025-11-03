import React, { Suspense, lazy } from "react";
import { Card, Row, Col } from "antd";
import { StarFilled, SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../services/userService";
import "./Home.css";
import supporticon from "../../assets/support icon.png";
import gradicon from "../../assets/grad icon.png";
import lightbulb from "../../assets/lightbulb icon.png";
import safeicon from "../../assets/safe icon.png";
import teamicon from "../../assets/team icon.png";

const CampingScene = lazy(() => import("../../components/3d/CampingScene"));

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleSignUpClick = () => {
    navigate("/register");
  };

  // Features data
  // const features = [
  //   {
  //     icon: <SafetyCertificateOutlined className="text-4xl text-orange-500" />,
  //     title: 'An toàn tuyệt đối',
  //     description: 'Môi trường an toàn với đội ngũ giám sát 24/7 và các biện pháp bảo vệ nghiêm ngặt',
  //   },
  //   {
  //     icon: <TeamOutlined className="text-4xl text-orange-500" />,
  //     title: 'Đội ngũ chuyên nghiệp',
  //     description: 'Huấn luyện viên giàu kinh nghiệm và tâm huyết với trẻ em',
  //   },
  //   {
  //     icon: <TrophyOutlined className="text-4xl text-orange-500" />,
  //     title: 'Chương trình đa dạng',
  //     description: 'Nhiều hoạt động thú vị phát triển toàn diện cho trẻ',
  //   },
  //   {
  //     icon: <HeartOutlined className="text-4xl text-orange-500" />,
  //     title: 'Chăm sóc tận tình',
  //     description: 'Quan tâm đến từng trẻ với sự yêu thương và trách nhiệm',
  //   },
  // ];

  // Camp categories
  const campCategories = [
    {
      image: "/images/2Explore.jpg",
      title: "Trại khám phá",
      description: "Khám phá thiên nhiên và môi trường xung quanh",
    },
    {
      image: "/images/2Game.jpg",
      title: "Trại trò chơi",
      description: "Học tập qua các trò chơi vận động và tư duy",
    },
    {
      image: "/images/3Game.jpg",
      title: "Trại thể thao",
      description: "Rèn luyện sức khỏe và kỹ năng thể thao",
    },
    {
      image: "/images/3GirlRead.jpg",
      title: "Trại đọc sách",
      description: "Nuôi dưỡng tình yêu đọc sách và học hỏi",
    },
    {
      image: "/images/3hill.jpg",
      title: "Trại leo núi",
      description: "Chinh phục đỉnh cao và rèn luyện ý chí",
    },
    {
      image: "/images/4talk.jpg",
      title: "Trại giao tiếp",
      description: "Phát triển kỹ năng mềm và giao tiếp",
    },
  ];

  // Activities data
  const activities = [
    {
      image:
        "https://res.cloudinary.com/da9zmbssb/image/upload/v1760070571/act_treasure_eujrrv.jpg",
      title: "Truy tìm kho báu",
      description:
        'Trò chơi lớn đòi hỏi sự hợp tác của cả đội để giải mật thư và tìm ra "kho báu".',
    },
    {
      image:
        "https://res.cloudinary.com/da9zmbssb/image/upload/v1760070863/act_obsticle_hajyc3.jpg",
      title: "Vượt chướng ngại vật đồng đội",
      description:
        "Cùng nhau vượt qua các thử thách như đi chung trên ván gỗ, nhảy bao bố tiếp sức.",
    },
    {
      image:
        "https://res.cloudinary.com/da9zmbssb/image/upload/v1760070617/act_folk_game_cn8d7z.jpg",
      title: "Trò chơi dân gian",
      description: "Bịt mắt bắt dê, rồng rắn lên mây, nhảy sạp, ô ăn quan.",
    },
    {
      image:
        "https://res.cloudinary.com/da9zmbssb/image/upload/v1760070573/act_sport_nlvm53.jpg",
      title: "Các môn thể thao",
      description: "Tổ chức các trận đấu bóng đá mini, bóng rổ, cầu lông.",
    },
    {
      image:
        "https://res.cloudinary.com/da9zmbssb/image/upload/v1760070572/act_survive_g1iga1.jpg",
      title: "Học kỹ năng sinh tồn",
      description:
        "Dựng lều trại mini, học cách xem la bàn, buộc các nút dây đơn giản.",
    },
    {
      image:
        "https://res.cloudinary.com/da9zmbssb/image/upload/v1760070573/act_painting_cxlhpw.jpg",
      title: "Vẽ tranh và tô màu",
      description:
        'Theo chủ đề tự do hoặc chủ đề của trại hè như "Mùa hè của em", "Bảo vệ môi trường".',
    },
    {
      image:
        "https://res.cloudinary.com/da9zmbssb/image/upload/v1760070572/act_origami_bn1qk5.jpg",
      title: "Gấp giấy Origami",
      description: "Học nghệ thuật gấp giấy Nhật Bản với nhiều mẫu thú vị.",
    },
    {
      image:
        "https://res.cloudinary.com/da9zmbssb/image/upload/v1760070573/act_science_sqr0fo.jpg",
      title: "Thí nghiệm khoa học vui",
      description:
        "Làm núi lửa phun trào, tạo chất dẻo ma quái (slime), trồng cây trong chai.",
    },
    {
      image:
        "https://res.cloudinary.com/da9zmbssb/image/upload/v1760070572/act_cooking_hdzjaq.jpg",
      title: "Lớp học nấu ăn cơ bản",
      description:
        "Tự làm bánh quy, trang trí bánh cupcake, pha các loại nước đơn giản.",
    },
    {
      image:
        "https://res.cloudinary.com/da9zmbssb/image/upload/v1760079360/act_cinema_ks3gmw.jpg",
      title: "Rạp chiếu phim ngoài trời",
      description: "Thưởng thức phim hay dưới bầu trời đêm cùng bạn bè.",
    },
    {
      image:
        "https://res.cloudinary.com/da9zmbssb/image/upload/v1760079351/act_campfire_xftcdh.jpg",
      title: "Đốt lửa trại",
      description: "Tụ tập quanh lửa trại, hát và kể chuyện cùng nhau.",
    },
  ];

  // Testimonials
  const testimonials = [
    {
      name: "Nguyễn Thị Mai",
      role: "Phụ huynh",
      rating: 5,
      content:
        "Con tôi đã có những trải nghiệm tuyệt vời tại trại hè. Các hoạt động rất bổ ích và an toàn. Đội ngũ huấn luyện viên rất tận tâm.",
    },
    {
      name: "Trần Văn Hùng",
      role: "Phụ huynh",
      rating: 5,
      content:
        "Trại hè đã giúp con tôi trở nên tự tin và độc lập hơn. Các kỹ năng sống mà con học được rất hữu ích.",
    },
    {
      name: "Lê Thị Hương",
      role: "Phụ huynh",
      rating: 5,
      content:
        "Tôi rất hài lòng với chất lượng dịch vụ. Cơ sở vật chất hiện đại và đội ngũ nhân viên chuyên nghiệp.",
    },
  ];

  return (
    <div className="home-page">
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
                Khám phá, học hỏi và kết bạn
              </span>
              <span className="text-white block mt-2">
                trong môi trường trại hè an toàn
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
      <div className="relative -mt-10 z-40 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-full shadow-2xl p-2 flex flex-col md:flex-row items-center gap-2">
            {/* Địa điểm */}
            <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-full hover:bg-gray-50 transition-all cursor-pointer min-w-[200px]">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-orange-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium">Địa điểm</p>
                <input
                  type="text"
                  placeholder="Chọn địa điểm"
                  className="w-full text-sm font-semibold text-gray-800 border-none outline-none bg-transparent"
                />
              </div>
            </div>

            <div className="hidden md:block w-px h-8 bg-gray-200"></div>

            {/* Độ tuổi */}
            <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-full hover:bg-gray-50 transition-all cursor-pointer min-w-[200px]">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-orange-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium">Độ tuổi</p>
                <input
                  type="text"
                  placeholder="Chọn độ tuổi"
                  className="w-full text-sm font-semibold text-gray-800 border-none outline-none bg-transparent"
                />
              </div>
            </div>

            <div className="hidden md:block w-px h-8 bg-gray-200"></div>

            {/* Thời gian */}
            <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-full hover:bg-gray-50 transition-all cursor-pointer min-w-[200px]">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-orange-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium">Thời gian</p>
                <input
                  type="text"
                  placeholder="Chọn thời gian"
                  className="w-full text-sm font-semibold text-gray-800 border-none outline-none bg-transparent"
                />
              </div>
            </div>

            <button
              onClick={() => navigate("/camps")}
              className="bg-[#FF8F50] text-white rounded-[105px] px-8 py-4 font-bold hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 whitespace-nowrap hover:bg-[#ff7e3d]"
            >
              <SearchOutlined className="text-lg" />
              <span>Tìm kiếm</span>
            </button>
          </div>
        </div>
      </div>
      {/* Tại sao nên chọn CampEase Section */}
      <section className="py-20 ">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
            Tại sao nên chọn CampEase?
          </h2>

          <div className="">
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
              CampEase đặc biệt chú trọng việc{" "}
              <span className="font-bold text-orange-600">
                truyền tải kiến thức thông qua các hoạt động thực hành thú vị
              </span>{" "}
              và{" "}
              <span className="font-bold text-orange-600">
                ứng dụng các bài học lý thuyết vào cuộc sống thường thức
              </span>{" "}
              để tạo ra được những sản phẩm trong cuộc sống hằng ngày.
            </p>
          </div>
        </div>

        {/* Grid Layout - 3 rows x 3 columns */}
        <div className="max-w-[1000px] mx-auto px-4 mt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 justify-center">
            {/* Row 1: Photo 1 + Card 1 + Card 2 */}

            <div className="w-full md:w-[300px] h-[300px] mx-auto">
              <div className="w-full h-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <img
                  src="https://res.cloudinary.com/da9zmbssb/image/upload/v1760070779/3hill_w9bdwb.jpg"
                  alt="Trẻ em leo núi"
                  className="w-full h-full object-cover object-bottom"
                />
              </div>
            </div>

            <div className="w-full md:w-[300px] h-[300px] mx-auto bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-all">
              <div className="flex flex-col items-center text-center h-full justify-center space-y-3">
                <div className="w-16 h-16 flex items-center justify-center flex-shrink-0">
                  <img
                    src={supporticon}
                    alt="Support"
                    className="w-full h-full"
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold text-orange-500 mb-2">
                    Hợp tác và hỗ trợ lẫn nhau
                  </h3>
                  <ul className="text-gray-600 text-xs space-y-1 text-left">
                    <li>✓ Tư duy phản biện được trau dồi</li>
                    <li>✓ Xem việc thất bại là cơ hội để học hỏi</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="w-full md:w-[300px] h-[300px] mx-auto bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-all">
              <div className="flex flex-col items-center text-center h-full justify-center space-y-3">
                <div className="w-16 h-16 flex items-center justify-center flex-shrink-0">
                  <img
                    src={lightbulb}
                    alt="Lightbulb"
                    className="w-full h-full"
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold text-orange-500 mb-2">
                    Sáng tạo
                  </h3>
                  <ul className="text-gray-600 text-xs space-y-1 text-left">
                    <li>✓ Tư duy sáng tạo</li>
                    <li>✓ Hoạt động khám phá thực tế</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Row 2: Card 3 + Card 4 + Photo 2 */}
            <div className="w-full md:w-[300px] h-[300px] mx-auto bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-all">
              <div className="flex flex-col items-center text-center h-full justify-center space-y-3">
                <div className="w-16 h-16 flex items-center justify-center flex-shrink-0">
                  <img src={safeicon} alt="Safety" className="w-full h-full" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-orange-500 mb-2">
                    An toàn
                  </h3>
                  <ul className="text-gray-600 text-xs space-y-1 text-left">
                    <li>✓ Đề cao sự an toàn trong mọi hoạt động</li>
                    <li>✓ Ăn uống được đảm bảo chất lượng</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="w-full md:w-[300px] h-[300px] mx-auto bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-all">
              <div className="flex flex-col items-center text-center h-full justify-center space-y-3">
                <div className="w-16 h-16 flex items-center justify-center flex-shrink-0">
                  <img src={teamicon} alt="Team" className="w-full h-full" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-orange-500 mb-2">
                    Đội ngũ chuyên nghiệp
                  </h3>
                  <ul className="text-gray-600 text-xs space-y-1 text-left">
                    <li>✓ Giáo viên giàu kinh nghiệm</li>
                    <li>✓ Ứng dụng nội dung thực tế</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="w-full md:w-[300px] h-[300px] mx-auto">
              <div className="w-full h-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <img
                  src="https://res.cloudinary.com/da9zmbssb/image/upload/v1760070767/2game_jxscts.jpg"
                  alt="Trẻ em chơi trò chơi"
                  className="w-full h-full object-cover object-left"
                />
              </div>
            </div>

            {/* Row 3: Card 5 + Photo 3 spans 2 columns */}
            <div className="w-full md:w-[300px] h-[300px] mx-auto bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-all">
              <div className="flex flex-col items-center text-center h-full justify-center space-y-3">
                <div className="w-16 h-16 flex items-center justify-center flex-shrink-0">
                  <img
                    src={gradicon}
                    alt="Graduation"
                    className="w-full h-full"
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold text-orange-500 mb-2">
                    Phát triển toàn diện
                  </h3>
                  <ul className="text-gray-600 text-xs space-y-1 text-left">
                    <li>✓ Đa dạng lứa tuổi và sở thích</li>
                    <li>✓ Kết hợp học và chơi</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="w-full md:col-span-2 h-[300px] mx-auto">
              <div className="w-full h-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <img
                  src="https://res.cloudinary.com/da9zmbssb/image/upload/v1760070766/3read_njn2wc.jpg"
                  alt="Các bé gái đọc sách"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-yellow-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Các hoạt động nổi bật
            </h2>
            <p className="text-gray-600 text-lg">
              Khám phá những trải nghiệm thú vị và bổ ích tại trại hè
            </p>
          </div>

          {/* Scrollable Container */}
          <div className="relative">
            {/* Scroll Left Button */}
            <button
              onClick={() => {
                const container = document.getElementById("activities-scroll");
                if (container)
                  container.scrollBy({ left: -400, behavior: "smooth" });
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all duration-300 hover:scale-110"
            >
              <svg
                className="w-6 h-6 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Activities Grid - Horizontal Scroll */}
            <div
              id="activities-scroll"
              className="overflow-x-auto scrollbar-hide"
              style={{
                scrollSnapType: "x mandatory",
                WebkitOverflowScrolling: "touch",
              }}
            >
              <div className="flex gap-6 px-12">
                {activities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-[280px]"
                    style={{ scrollSnapAlign: "start" }}
                  >
                    <div className="group cursor-pointer">
                      {/* Image */}
                      <div className="overflow-hidden rounded-xl mb-3 shadow-md hover:shadow-xl transition-all duration-300">
                        <img
                          src={activity.image}
                          alt={activity.title}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.src = "/images/placeholder.jpg";
                          }}
                        />
                      </div>

                      {/* Title */}
                      <h4 className="font-semibold text-gray-800 group-hover:text-orange-500 transition-colors mb-1">
                        {activity.title}
                      </h4>

                      {/* Description */}
                      <p className="text-sm text-gray-600">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scroll Right Button */}
            <button
              onClick={() => {
                const container = document.getElementById("activities-scroll");
                if (container)
                  container.scrollBy({ left: 400, behavior: "smooth" });
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all duration-300 hover:scale-110"
            >
              <svg
                className="w-6 h-6 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* About Section - Sticky Background */}
      <section className="relative bg-[#FFE37A] py-20">
        {/* Content Container */}
        <div className="relative py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Left Side - 3D Model */}
              <div className="hidden lg:block sticky top-24 h-[calc(90vh-6rem)]">
                <div className="w-full h-full flex items-center justify-center relative -mx-16">
                  <div className="w-[120%] aspect-square rounded-3xl ">
                    <Suspense
                      fallback={
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-700 font-semibold">
                              Đang tải mô hình 3D...
                            </p>
                          </div>
                        </div>
                      }
                    >
                      <CampingScene autoRotate={false} />
                    </Suspense>
                  </div>
                </div>
              </div>

              {/* Right Side */}
              <div className="space-y-8">
                <div className="space-y-6">
                  <h2 className="text-4xl md:text-4xl font-bold text-gray-900 leading-tight">
                    Hãy để Trại hè CampEase 2025 trở thành dấu ấn rực rỡ trên
                    hành trình trưởng thành của con!
                  </h2>

                  <p className="text-xl text-gray-800 leading-relaxed">
                    Một mùa hè tràn đầy cảm hứng, năng lượng và khám phá, nơi
                    mỗi ngày con được học hỏi điều mới, tự do thể hiện bản thân
                    và phát triển toàn diện về trí tuệ, thể chất, nghệ thuật và
                    kỹ năng sống.
                  </p>
                </div>

                <div className="space-y-6 bg-white/40 backdrop-blur-sm rounded-2xl p-8 border border-white/50">
                  <h3 className="text-3xl font-bold text-gray-900 mb-6">
                    TẠI SAO NÊN CHỌN TRẠI HÈ CampEase?
                  </h3>

                  <div className="space-y-5">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                        1
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">
                          Học tập qua trải nghiệm thực tiễn
                        </h4>
                        <p className="text-gray-700">
                          Học tập thông qua các dự án sáng tạo, hoạt động khám
                          phá thực tế – từ đó phát triển khả năng thích nghi và
                          tính tự lập.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                        2
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">
                          Phát triển toàn diện kỹ năng thế kỷ 21
                        </h4>
                        <p className="text-gray-700">
                          Tư duy phản biện, sáng tạo, thuyết trình, làm việc
                          nhóm và giải quyết vấn đề – tất cả được lồng ghép
                          trong từng hoạt động giúp con tự tin hơn mỗi ngày.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                        3
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">
                          Khơi dậy đam mê – Đánh thức tiềm năng
                        </h4>
                        <p className="text-gray-700">
                          Dù con yêu sân khấu, đam mê thể thao hay say mê công
                          nghệ – trại hè có nhiều lựa chọn đa dạng để con tự do
                          khám phá bản thân và phát triển thế mạnh riêng.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                        4
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">
                          Đội ngũ chuyên gia và giáo viên đồng hành
                        </h4>
                        <p className="text-gray-700">
                          Dày dặn kinh nghiệm giảng dạy và dẫn dắt đội tuyển,
                          tận tâm hướng dẫn và truyền cảm hứng suốt hành trình.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                        5
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">
                          Tỏa sáng cuối mỗi hành trình
                        </h4>
                        <p className="text-gray-700">
                          Thi đấu thể thao, trình diễn nghệ thuật, triển lãm sản
                          phẩm sáng tạo – mỗi học sinh đều có sân khấu riêng để
                          thể hiện sự tiến bộ và tài năng sau từng giai đoạn học
                          tập.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 bg-white/40 backdrop-blur-sm rounded-2xl p-8 border border-white/50">
                  <h3 className="text-2xl font-bold text-gray-900">
                    CÁC CHƯƠNG TRÌNH HÈ ĐẶC SẮC – ĐA DẠNG LỰA CHỌN
                  </h3>
                  <p className="text-gray-700 text-lg">
                    Dành cho học sinh chuẩn bị vào lớp 1 đến lớp 5.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-yellow-400 rounded-2xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-3">ƯU ĐÃI ĐẶC BIỆT</h3>
                  <p className="text-lg">
                    Hưởng ưu đãi giảm giá{" "}
                    <span className="text-3xl font-bold">20%</span> đối với
                    thành viên đã tham gia
                  </p>
                </div>

                {/* Image Stack scroll*/}
                <div className="relative">
                  <div className="min-h-screen flex items-center justify-center sticky top-0">
                    <div
                      className="relative origin-top transition-all duration-300"
                      style={{
                        top: "calc(0px - 5vh)",
                        transform: "scale(1) rotate(-8deg)",
                      }}
                    >
                      <div
                        className="w-[380px] h-[290px] rounded-2xl shadow-2xl overflow-hidden"
                        style={{
                          transform: "scale(1.3)",
                        }}
                      >
                        <img
                          src="https://res.cloudinary.com/da9zmbssb/image/upload/v1760080622/cookrice_fxethy.jpg"
                          alt="Nấu ăn"
                          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="min-h-screen flex items-center justify-center sticky top-0">
                    <div
                      className="relative origin-top transition-all duration-300"
                      style={{
                        top: "calc(25px - 5vh)",
                        transform: "scale(0.98) rotate(5deg)",
                      }}
                    >
                      <div
                        className="w-[400px] h0-[300px] rounded-2xl shadow-2xl overflow-hidden"
                        style={{
                          transform: "scale(1.3)",
                        }}
                      >
                        <img
                          src="https://res.cloudinary.com/da9zmbssb/image/upload/v1760080623/dance_zefd35.jpg"
                          alt="Khiêu vũ"
                          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="min-h-screen flex items-center justify-center sticky top-0">
                    <div
                      className="relative origin-top transition-all duration-300"
                      style={{
                        top: "calc(50px - 5vh)",
                        transform: "scale(0.96) rotate(-3deg)",
                      }}
                    >
                      <div
                        className="w-[400px] h-[300px] rounded-2xl shadow-2xl overflow-hidden"
                        style={{
                          transform: "scale(1.3)",
                        }}
                      >
                        <img
                          src="https://res.cloudinary.com/da9zmbssb/image/upload/v1760080623/onsticleteam_nxdrxr.jpg"
                          alt="Vượt chướng ngại vật"
                          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="min-h-screen flex items-center justify-center sticky top-0">
                    <div
                      className="relative origin-top transition-all duration-300"
                      style={{
                        top: "calc(75px - 5vh)",
                        transform: "scale(0.94) rotate(7deg)",
                      }}
                    >
                      <div
                        className="w-[400px] h-[300px] rounded-2xl shadow-2xl overflow-hidden"
                        style={{
                          transform: "scale(1.3)",
                        }}
                      >
                        <img
                          src="https://res.cloudinary.com/da9zmbssb/image/upload/v1760080805/makecar_akap6v.jpg"
                          alt="Làm xe"
                          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chuong trinh Section */}
      <section></section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Khám phá danh mục
          </h2>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Các loại trại hè
            </h3>
            <Row gutter={[24, 24]}>
              {campCategories.map((category, index) => (
                <Col xs={12} sm={8} md={6} key={index}>
                  <div className="group cursor-pointer">
                    <div className="overflow-hidden rounded-xl mb-3 shadow-md hover:shadow-xl transition-all duration-300">
                      <img
                        src={category.image}
                        alt={category.title}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <h4 className="font-semibold text-gray-800 group-hover:text-orange-500 transition-colors">
                      {category.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {category.description}
                    </p>
                  </div>
                </Col>
              ))}
            </Row>
            <div className="text-right mt-4">
              <button
                onClick={() => navigate("/camp")}
                className="bg-[#FF8F50] text-white rounded-[105px] px-8 py-4 font-bold hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 whitespace-nowrap hover:bg-[#ff7e3d]"
              >
                Xem tất cả chương trình trại hè →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Phản hồi từ phụ huynh
            </h2>
            <p className="text-gray-600 text-lg">
              Những trải nghiệm thực tế từ cộng đồng của chúng tôi
            </p>
          </div>

          <Row gutter={[32, 32]}>
            {testimonials.map((testimonial, index) => (
              <Col xs={24} md={8} key={index}>
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarFilled key={i} className="text-yellow-400 text-lg" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Sẵn sàng cho mùa hè tuyệt vời?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Đăng ký ngay để con bạn có cơ hội trải nghiệm những hoạt động bổ ích
            và thú vị trong mùa hè này!
          </p>
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleSignUpClick}
                className="bg-white text-orange-600 font-bold px-10 py-4 rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Đăng ký ngay
              </button>
              <button
                onClick={() => navigate("/camp")}
                className="bg-transparent border-2 border-white text-white font-bold px-10 py-4 rounded-xl hover:bg-white hover:text-orange-600 transition-all duration-300"
              >
                Xem các trại hè
              </button>
            </div>
          )}
          {user && (
            <button
              onClick={() => navigate("/camp")}
              className="bg-white text-orange-600 font-bold px-10 py-4 rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Khám phá các trại hè →
            </button>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
