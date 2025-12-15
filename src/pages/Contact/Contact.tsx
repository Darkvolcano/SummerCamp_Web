import React from "react";
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  FacebookOutlined,
  YoutubeOutlined,
  InstagramOutlined,
} from "@ant-design/icons";
import "./Contact.css";

const Contact: React.FC = () => {
  const contactInfo = [
    {
      icon: <PhoneOutlined />,
      emoji: "📞",
      title: "Điện thoại",
      content: "+84 (028) 3822 1234",
      subContent: "+84 (028) 3822 5678",
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: <MailOutlined />,
      emoji: "✉️",
      title: "Email",
      content: "info@campease.vn",
      subContent: "support@campease.vn",
      color: "from-orange-500 to-red-600",
      bgColor: "bg-orange-50",
    },
    {
      icon: <EnvironmentOutlined />,
      emoji: "📍",
      title: "Địa chỉ",
      content: "268 Lý Thường Kiệt, Phường 14",
      subContent: "Quận 10, TP. Hồ Chí Minh",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
    },
    {
      icon: <ClockCircleOutlined />,
      emoji: "🕐",
      title: "Giờ làm việc",
      content: "Thứ 2 - Thứ 6: 8:00 - 18:00",
      subContent: "Thứ 7: 8:00 - 12:00",
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-50",
    },
  ];

  const socialMedia = [
    {
      icon: <FacebookOutlined />,
      name: "Facebook",
      link: "https://facebook.com/campease",
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      icon: <YoutubeOutlined />,
      name: "YouTube",
      link: "https://youtube.com/@campease",
      color: "bg-red-600 hover:bg-red-700",
    },
    {
      icon: <InstagramOutlined />,
      name: "Instagram",
      link: "https://instagram.com/campease",
      color: "bg-pink-600 hover:bg-pink-700",
    },
  ];

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="hero-section relative min-h-[500px] flex items-center overflow-hidden">
        <div
          className="hero-background"
          style={{
            background:
              "linear-gradient(270deg, rgba(83, 83, 83, 0.86) 0%, rgba(25, 25, 25, 0.688) 33.5%, rgba(25, 25, 25, 0.86) 100%), url(https://res.cloudinary.com/da9zmbssb/image/upload/v1760070573/act_sport_nlvm53.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>

        <div className="relative z-10 w-full px-4 max-w-7xl mx-auto pt-24 pb-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                Liên hệ với
              </span>
              <span className="text-white block mt-2">CampEase</span>
            </h1>

            <p className="text-2xl text-white font-semibold mb-4">
              "Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn"
            </p>

            <p className="text-lg text-white/90 max-w-3xl mx-auto leading-relaxed">
              Hãy liên hệ với chúng tôi để được tư vấn chi tiết về các chương
              trình trại hè, đăng ký tham gia hoặc giải đáp mọi thắc mắc.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="contact-info-section py-20 bg-gradient-to-br from-orange-50 via-white to-yellow-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="bg-gradient-to-r from-[#FF8F50] to-[#ff7e3d] text-white px-6 py-3 rounded-full text-sm font-bold">
                Thông tin liên hệ
              </span>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                Kết nối
              </span>
              <span className="block mt-2">với chúng tôi</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nhiều cách để bạn có thể liên hệ và tương tác với CampEase
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <div
                key={index}
                className={`${info.bgColor} p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 border-transparent hover:border-orange-300`}
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${info.color} rounded-2xl flex items-center justify-center mb-4 transform -rotate-6 hover:rotate-0 transition-all duration-500 shadow-xl`}
                  >
                    <span className="text-4xl transform rotate-6">
                      {info.emoji}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {info.title}
                  </h3>
                  <p className="text-base font-semibold text-gray-700 mb-1">
                    {info.content}
                  </p>
                  <p className="text-sm text-gray-600">{info.subContent}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map & Form Section */}
      <section className="map-form-section py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Map */}
            <div className="map-container">
              <div className="mb-6">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                    Vị trí
                  </span>{" "}
                  của chúng tôi
                </h3>
                <p className="text-gray-600">
                  Ghé thăm văn phòng CampEase để được tư vấn trực tiếp
                </p>
              </div>
              <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-orange-100">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.3193500261737!2d106.66408647570755!3d10.794933589357537!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752ed2392c44df%3A0xd2ecb62e0d050fe9!2sFPT-Aptech%20Computer%20Education%20HCM!5e0!3m2!1sen!2s!4v1734085200000!5m2!1sen!2s"
                  width="100%"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="CampEase Location"
                ></iframe>
              </div>
            </div>

            {/* Contact Form */}
            <div className="form-container">
              <div className="mb-6">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                    Gửi tin nhắn
                  </span>{" "}
                  cho chúng tôi
                </h3>
                <p className="text-gray-600">
                  Điền thông tin bên dưới, chúng tôi sẽ phản hồi sớm nhất
                </p>
              </div>

              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nguyễn Văn A"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 transition-all duration-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="0901234567"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="example@email.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 transition-all duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Chủ đề
                  </label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 transition-all duration-300">
                    <option>Tư vấn chương trình trại hè</option>
                    <option>Đăng ký tham gia</option>
                    <option>Hỗ trợ kỹ thuật</option>
                    <option>Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Nội dung <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Nhập nội dung tin nhắn của bạn..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 transition-all duration-300 resize-none"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#FF8F50] to-[#ff7e3d] text-white rounded-xl px-8 py-4 font-bold hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <MailOutlined className="text-xl" />
                  Gửi tin nhắn
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="social-section py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="mb-12">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Theo dõi
              </span>{" "}
              chúng tôi
            </h3>
            <p className="text-xl text-gray-600">
              Cập nhật tin tức và hoạt động mới nhất từ CampEase
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {socialMedia.map((social, index) => (
              <a
                key={index}
                href={social.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`${social.color} text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-110 hover:shadow-2xl flex items-center gap-3`}
              >
                <span className="text-2xl">{social.icon}</span>
                <span>{social.name}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Quick Links */}
      <section className="faq-section py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                Câu hỏi
              </span>{" "}
              thường gặp
            </h3>
            <p className="text-xl text-gray-600">
              Tìm câu trả lời nhanh chóng cho các thắc mắc phổ biến
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                question: "Độ tuổi tham gia trại hè?",
                answer: "CampEase phục vụ trẻ em từ 6-15 tuổi",
              },
              {
                question: "Thời gian diễn ra?",
                answer: "Các khóa từ 3-7 ngày trong mùa hè",
              },
              {
                question: "Chi phí tham gia?",
                answer: "Từ 3-8 triệu tùy chương trình",
              },
              {
                question: "An toàn như thế nào?",
                answer: "Giám sát 24/7, y tế chuyên nghiệp",
              },
              {
                question: "Đăng ký khi nào?",
                answer: "Mở đăng ký từ tháng 3 hàng năm",
              },
              {
                question: "Hoàn tiền được không?",
                answer: "Có chính sách hoàn tiền linh hoạt",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-orange-50 to-yellow-50 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-orange-100"
              >
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  {faq.question}
                </h4>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
