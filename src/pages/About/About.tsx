import React, { useState } from "react";
import { Modal } from "antd";
import {
  RocketOutlined,
  EyeOutlined,
  SafetyOutlined,
  TrophyOutlined,
  TeamOutlined,
  SmileOutlined,
  HeartOutlined,
  BulbOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../services/userService";
import "./About.css";

const About: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [selectedValue, setSelectedValue] = useState<number | null>(null);

  const handleSignUpClick = () => {
    navigate("/register");
  };

  const coreValues = [
    {
      id: 1,
      icon: <SafetyOutlined />,
      emoji: "🛡️",
      title: "AN TOÀN",
      slogan: "Safety First, Always",
      subtitle: "Ưu tiên số 1 là an toàn",
      image:
        "https://res.cloudinary.com/da9zmbssb/image/upload/v1760070571/act_treasure_eujrrv.jpg",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-500",
      content: `An toàn của học sinh luôn là ưu tiên hàng đầu trong mọi hoạt động tại CampEase. Chúng tôi duy trì hệ thống giám sát 24/7 với camera an ninh, nhân viên y tế chuyên nghiệp túc trực, và quy trình quản lý rủi ro nghiêm ngặt theo tiêu chuẩn quốc tế. 

Tất cả giáo viên đều được đào tạo về sơ cứu cấp cứu và xử lý tình huống khẩn cấp. Chúng tôi có bảo hiểm toàn diện cho mọi học sinh và duy trì tỉ lệ 1 giáo viên cho 8 học sinh để đảm bảo giám sát tối ưu.`,
      highlights: [
        "Giám sát 24/7 với camera an ninh",
        "Y tế chuyên nghiệp túc trực",
        "Quy trình quản lý rủi ro quốc tế",
        "Giáo viên đào tạo sơ cứu",
        "Bảo hiểm toàn diện",
        "Tỉ lệ 1:8 (giáo viên:học sinh)",
      ],
    },
    {
      id: 2,
      icon: <HeartOutlined />,
      emoji: "❤️",
      title: "YÊU THƯƠNG",
      slogan: "Every Child Matters",
      subtitle: "Mỗi em đều quan trọng",
      image:
        "https://res.cloudinary.com/da9zmbssb/image/upload/v1760070572/act_survive_g1iga1.jpg",
      color: "from-pink-500 to-rose-600",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-500",
      content: `Tại CampEase, mỗi học sinh đều được tôn trọng, lắng nghe và quan tâm như một cá nhân độc đáo với những sở thích và nhu cầu riêng. Chúng tôi xây dựng môi trường ấm áp, thân thiện, nơi các em được tự do thể hiện bản thân mà không sợ bị phán xét.

Đội ngũ giáo viên được đào tạo về tâm lý học trẻ em, biết cách động viên, khuyến khích và xây dựng lòng tự tin cho học sinh. Chúng tôi tin rằng sự yêu thương và sự đồng cảm là nền tảng cho sự phát triển bền vững.`,
      highlights: [
        "Tôn trọng cá tính riêng",
        "Môi trường ấm áp, thân thiện",
        "Tự do thể hiện bản thân",
        "Giáo viên đào tạo tâm lý học",
        "Động viên và khuyến khích",
        "Xây dựng lòng tự tin",
      ],
    },
    {
      id: 3,
      icon: <BulbOutlined />,
      emoji: "💡",
      title: "SÁNG TẠO",
      slogan: "Inspire Innovation",
      subtitle: "Truyền cảm hứng sáng tạo",
      image:
        "https://res.cloudinary.com/da9zmbssb/image/upload/v1760070573/3rain_up98nh.jpg",
      color: "from-yellow-500 to-orange-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-500",
      content: `CampEase khuyến khích tư duy độc lập, sáng tạo và giải quyết vấn đề thông qua phương pháp học tập trải nghiệm (learning by doing). Các em được tự do khám phá, thử nghiệm, mắc sai lầm và học hỏi từ trải nghiệm thực tế.

Chương trình của chúng tôi tập trung vào phát triển tư duy phản biện, khả năng đổi mới và sự tò mò tự nhiên của trẻ. Chúng tôi không chỉ dạy kiến thức mà còn dạy cách tư duy, cách đặt câu hỏi và cách tìm kiếm giải pháp.`,
      highlights: [
        "Tư duy độc lập & sáng tạo",
        "Learning by doing",
        "Tự do khám phá & thử nghiệm",
        "Phát triển tư duy phản biện",
        "Khả năng đổi mới",
        "Dạy cách tư duy & đặt câu hỏi",
      ],
    },
    {
      id: 4,
      icon: <UsergroupAddOutlined />,
      emoji: "🤝",
      title: "CỘNG ĐỒNG",
      slogan: "Together We Grow",
      subtitle: "Cùng nhau lớn lên",
      image:
        "https://res.cloudinary.com/da9zmbssb/image/upload/v1760070573/act_sport_nlvm53.jpg",
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-500",
      content: `CampEase xây dựng tinh thần cộng đồng, nơi các em học cách làm việc nhóm, chia sẻ, hỗ trợ lẫn nhau và tôn trọng sự khác biệt. Chúng tôi tổ chức các hoạt động teambuilding, dự án nhóm và trò chơi hợp tác để phát triển kỹ năng giao tiếp, leadership và trách nhiệm xã hội.

Học sinh từ nhiều nền tảng khác nhau được khuyến khích kết bạn, học hỏi văn hóa đa dạng và xây dựng tình bạn lâu dài. Chúng tôi dạy các em không chỉ sống cho bản thân mà còn biết đóng góp cho cộng đồng.`,
      highlights: [
        "Tinh thần làm việc nhóm",
        "Hoạt động teambuilding",
        "Phát triển kỹ năng giao tiếp",
        "Leadership & trách nhiệm xã hội",
        "Học hỏi văn hóa đa dạng",
        "Xây dựng tình bạn lâu dài",
      ],
    },
  ];

  return (
    <div className="about-page">
      {/* Hero Section - Content Left */}
      <section className="hero-section relative min-h-[700px] flex items-center overflow-hidden">
        <div
          className="hero-background"
          style={{
            background:
              "linear-gradient(270deg, rgba(83, 83, 83, 0.86) 0%, rgba(25, 25, 25, 0.688) 33.5%, rgba(25, 25, 25, 0.86) 100%), url(https://res.cloudinary.com/da9zmbssb/image/upload/v1760642836/laughingKid_yzv7sw.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>

        <div className="relative z-10 w-full px-4 max-w-7xl mx-auto pt-24 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="hero-content">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                  Chào mừng đến với
                </span>
                <span className="text-white block mt-2">CampEase</span>
              </h1>

              <p className="text-2xl text-white font-semibold mb-4">
                "Nơi mỗi bạn trẻ được khám phá tiềm năng và tỏa sáng"
              </p>

              <p className="text-lg text-white/90 mb-8 leading-relaxed">
                CampEase không chỉ là một hội trại - đây là nơi ươm mầm những ước
                mơ, xây dựng tính cách và tạo ra những kỷ niệm đáng nhớ nhất
                trong tuổi thơ của các bé.
              </p>

              <div className="flex flex-wrap gap-4">
                {!user && (
                  <button
                    onClick={handleSignUpClick}
                    className="bg-gradient-to-r from-[#FF8F50] to-[#ff7e3d] text-white rounded-full px-8 py-4 font-bold hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
                  >
                    <RocketOutlined className="text-xl" />
                    Đăng ký ngay
                  </button>
                )}
                <button
                  onClick={() => navigate("/camp")}
                  className="bg-white/10 backdrop-blur-sm text-white border-2 border-white rounded-full px-8 py-4 font-bold hover:bg-white hover:text-[#FF8F50] transition-all duration-300 hover:scale-105"
                >
                  Khám phá hội trại
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section py-20 bg-gradient-to-br from-orange-50 via-white to-yellow-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Icon & Title */}
            <div className="mission-left">
              <div className="inline-block mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-[#FF8F50] to-[#ff7e3d] rounded-3xl flex items-center justify-center transform rotate-12 hover:rotate-0 transition-all duration-500 shadow-2xl">
                  <RocketOutlined className="text-4xl text-white transform -rotate-12" />
                </div>
              </div>

              <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Sứ mệnh của
                <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent block">
                  chúng tôi
                </span>
              </h2>

              <div className="grid grid-cols-2 gap-4 mt-8">
                {[
                  { icon: <SafetyOutlined />, label: "An toàn" },
                  { icon: <SmileOutlined />, label: "Vui vẻ" },
                  { icon: <TrophyOutlined />, label: "Bổ ích" },
                  { icon: <TeamOutlined />, label: "Kết nối" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="mission-badge flex items-center gap-3 bg-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="text-2xl text-[#FF8F50]">{item.icon}</div>
                    <span className="font-bold text-gray-900">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Content */}
            <div className="mission-right">
              <div className="mission-card bg-white p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 border-2 border-orange-100">
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Tạo ra những trải nghiệm đáng nhớ{" "}
                  <span className="font-bold text-[#FF8F50]">an toàn</span>,{" "}
                  <span className="font-bold text-green-500">vui vẻ</span> và{" "}
                  <span className="font-bold text-blue-500">bổ ích</span>, giúp
                  mỗi đứa trẻ khám phá bản thân, phát triển kỹ năng sống và xây
                  dựng những kỷ niệm đáng nhớ.
                </p>

                <p className="text-lg text-gray-700 leading-relaxed">
                  CampEase cam kết mang đến chương trình giáo dục ngoại khóa
                  chất lượng cao, kết hợp giữa học tập và vui chơi, giúp trẻ
                  phát triển toàn diện về{" "}
                  <span className="font-bold text-purple-500">thể chất</span>,{" "}
                  <span className="font-bold text-blue-500">trí tuệ</span>,{" "}
                  <span className="font-bold text-pink-500">cảm xúc</span> và{" "}
                  <span className="font-bold text-green-500">
                    kỹ năng xã hội
                  </span>
                  .
                </p>

              </div>
            </div>
          </div>
        </div>
      </section>

      
      {/* Core Values */}
      <section className="core-values-section pt-10 bg-white">
        <div className="max-w-[1600px] mx-auto px-4 mb-16">
          <div className="text-center pl-30 mb-16">
            <div className="inline-block mb-4">
              <span className="bg-gradient-to-r from-[#FF8F50] to-[#ff7e3d] text-white px-6 py-3 rounded-full text-sm font-bold">
                Giá trị cốt lõi
              </span>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                Nền tảng giáo dục
              </span>
              <span className="block mt-2">của CampEase</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Bốn trụ cột định hình phương pháp giáo dục và môi
              trường học tập tại CampEase
            </p>
          </div>
        </div>

        {/* 8 Square Grid */}
        <div className="core-values-grid">
          {/* Row 1 */}
          {/* Card 1*/}
          <div className="core-value-image" onClick={() => setSelectedValue(1)}>
            <img
              src="https://res.cloudinary.com/da9zmbssb/image/upload/v1760070571/act_treasure_eujrrv.jpg"
              alt="An toàn"
            />
            <div className="image-overlay">
            </div>
          </div>

          <div className="core-value-content bg-green-50">
            <div className="content-inner">
              <div className="content-header">
                <div>
                  <h3 className="content-title">🛡️ AN TOÀN</h3>
                  <p className="content-slogan">"Safety First, Always"</p>
                </div>
              </div>
              <p className="content-subtitle">Ưu tiên số 1 là an toàn</p>
              <button
                onClick={() => setSelectedValue(1)}
                className="content-button bg-gradient-to-r from-green-500 to-emerald-600"
              >
                <span>Tìm hiểu thêm</span>
                <span className="button-arrow">→</span>
              </button>
            </div>
          </div>

          {/* Card 2*/}
          <div className="core-value-image" onClick={() => setSelectedValue(2)}>
            <img
              src="https://res.cloudinary.com/da9zmbssb/image/upload/v1760070572/act_survive_g1iga1.jpg"
              alt="Yêu thương"
            />
            <div className="image-overlay">

            </div>
          </div>

          <div className="core-value-content bg-pink-50">
            <div className="content-inner">
              <div className="content-header">
                <div>
                  <h3 className="content-title">❤️ YÊU THƯƠNG</h3>
                  <p className="content-slogan">"Every Child Matters"</p>
                </div>
              </div>
              <p className="content-subtitle">Mỗi em đều quan trọng</p>
              <button
                onClick={() => setSelectedValue(2)}
                className="content-button bg-gradient-to-r from-pink-500 to-rose-600"
              >
                <span>Tìm hiểu thêm</span>
                <span className="button-arrow">→</span>
              </button>
            </div>
          </div>

          {/* Row 2: Content - Image - Content - Image */}
          {/* Card 3 */}
          <div className="core-value-content bg-yellow-50">
            <div className="content-inner">
              <div className="content-header">
                <div>
                  <h3 className="content-title">💡 SÁNG TẠO</h3>
                  <p className="content-slogan">"Inspire Innovation"</p>
                </div>
              </div>
              <p className="content-subtitle">Truyền cảm hứng sáng tạo</p>
              <button
                onClick={() => setSelectedValue(3)}
                className="content-button bg-gradient-to-r from-yellow-500 to-orange-600"
              >
                <span>Tìm hiểu thêm</span>
                <span className="button-arrow">→</span>
              </button>
            </div>
          </div>

          <div className="core-value-image" onClick={() => setSelectedValue(3)}>
            <img
              src="https://res.cloudinary.com/da9zmbssb/image/upload/v1760070573/3rain_up98nh.jpg"
              alt="Sáng tạo"
            />
            <div className="image-overlay">
            </div>
          </div>

          {/* Card 4 */}
          <div className="core-value-content bg-blue-50">
            <div className="content-inner">
              <div className="content-header">
                <div>
                  <h3 className="content-title">🤝 CỘNG ĐỒNG</h3>
                  <p className="content-slogan">"Together We Grow"</p>
                </div>
              </div>
              <p className="content-subtitle">Cùng nhau lớn lên</p>
              <button
                onClick={() => setSelectedValue(4)}
                className="content-button bg-gradient-to-r from-blue-500 to-indigo-600"
              >
                <span>Tìm hiểu thêm</span>
                <span className="button-arrow">→</span>
              </button>
            </div>
          </div>

          <div className="core-value-image" onClick={() => setSelectedValue(4)}>
            <img
              src="https://res.cloudinary.com/da9zmbssb/image/upload/v1760070573/act_sport_nlvm53.jpg"
              alt="Cộng đồng"
            />
            <div className="image-overlay">
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="vision-section py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        <div className="vision-bg-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="vision-left order-2 lg:order-1">
              <div className="vision-card bg-white/90 backdrop-blur-lg p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 border-2 border-blue-200">
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Trở thành{" "}
                  <span className="font-bold text-blue-600">
                    hệ thống giáo dục ngoại khóa hàng đầu Đông Nam Á
                  </span>
                  , tiên phong trong việc ứng dụng công nghệ vào giáo dục ngoại
                  khóa, mang đến trải nghiệm học tập thế hệ mới cho trẻ em.
                </p>

                <div className="vision-stats grid grid-cols-2 gap-4 my-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl">
                  <div className="stat-box text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      2030
                    </div>
                    <div className="text-sm text-gray-600">Mục tiêu năm</div>
                  </div>
                  <div className="stat-box text-center">
                    <div className="text-4xl font-bold text-purple-600 mb-2">
                      20+
                    </div>
                    <div className="text-sm text-gray-600">Thành phố</div>
                  </div>
                  <div className="stat-box text-center">
                    <div className="text-4xl font-bold text-indigo-600 mb-2">
                      10K+
                    </div>
                    <div className="text-sm text-gray-600">Học sinh/năm</div>
                  </div>
                  <div className="stat-box text-center">
                    <div className="text-4xl font-bold text-pink-600 mb-2">
                      AI
                    </div>
                    <div className="text-sm text-gray-600">Công nghệ</div>
                  </div>
                </div>

                <p className="text-lg text-gray-700 leading-relaxed">
                  Đến năm 2030, CampEase sẽ có mặt tại{" "}
                  <span className="font-bold text-indigo-600">
                    20 thành phố lớn
                  </span>{" "}
                  trong khu vực, phục vụ hơn{" "}
                  <span className="font-bold text-purple-600">
                    10,000 học sinh
                  </span>{" "}
                  mỗi năm, với nền tảng công nghệ{" "}
                  <span className="font-bold text-blue-600">AI</span> giúp cá
                  nhân hóa trải nghiệm học tập cho từng em.
                </p>
              </div>
            </div>

            <div className="vision-right order-1 lg:order-2">
              <div className="inline-block mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center transform -rotate-12 hover:rotate-0 transition-all duration-500 shadow-2xl">
                  <EyeOutlined className="text-4xl text-white transform rotate-12" />
                </div>
              </div>

              <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Tầm nhìn
                <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent block">
                  đột phá
                </span>
              </h2>

              <div className="space-y-4">
                {[
                  {
                    icon: "🚀",
                    title: "Tiên phong công nghệ",
                    desc: "AI & Machine Learning",
                  },
                  {
                    icon: "🌏",
                    title: "Mở rộng khu vực",
                    desc: "20 thành phố SEA",
                  },
                  {
                    icon: "👨‍👩‍👧‍👦",
                    title: "Phục vụ hàng vạn gia đình",
                    desc: "10,000+ học sinh/năm",
                  },
                  {
                    icon: "🎯",
                    title: "Cá nhân hóa học tập",
                    desc: "Trải nghiệm độc đáo cho từng em",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="vision-feature flex items-start gap-4 bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-l-4 border-blue-500"
                  >
                    <div className="text-4xl">{item.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Core Value Details */}
      <Modal
        open={selectedValue !== null}
        onCancel={() => setSelectedValue(null)}
        footer={null}
        width={900}
        centered
        className="core-value-modal"
      >
        {selectedValue && (
          <div className="p-8">
            {(() => {
              const value = coreValues.find((v) => v.id === selectedValue);
              if (!value) return null;

              return (
                <>
                  <div className="flex items-center gap-6 mb-8 pb-6 border-b-2 border-gray-100">
                    <div
                      className={`w-20 h-20 bg-gradient-to-br ${value.color} rounded-3xl flex items-center justify-center shadow-2xl transform -rotate-6`}
                    >
                      <span className="text-5xl transform rotate-6">
                        {value.emoji}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-4xl font-bold text-gray-900 mb-2">
                        {value.title}
                      </h2>
                      <p className="text-lg text-gray-600 italic">
                        "{value.slogan}"
                      </p>
                      <p className="text-xl font-semibold text-gray-800 mt-2">
                        {value.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="mb-8 rounded-3xl overflow-hidden shadow-2xl">
                    <img
                      src={value.image}
                      alt={value.title}
                      className="w-full h-80 object-cover"
                    />
                  </div>

                  <div className="space-y-6">
                    <div
                      className={`${value.bgColor} p-6 rounded-2xl border-l-4 ${value.borderColor}`}
                    >
                      <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                        {value.content}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {value.highlights.map((highlight, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl hover:shadow-md transition-all duration-300"
                        >
                          <span className="text-lg">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </>
              );
            })()}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default About;
