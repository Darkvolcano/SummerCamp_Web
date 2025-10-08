import { Link } from "react-router-dom";
import Logo from "../../assets/LogoBlack.png";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="bg-[#191919] text-white py-16 px-4 md:px-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
        <div>
          <img src={Logo} alt="CampEase Logo" className="h-12 mb-6" />

          {/* Company Information */}
          <div className="mb-6 space-y-3">
            <div className="flex items-center space-x-2 text-gray-300">
              <svg
                className="w-4 h-4 text-orange-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-sm">TP. Hồ Chí Minh, Việt Nam</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <svg
                className="w-4 h-4 text-orange-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <a
                href="mailto:contact@campease.vn"
                className="text-sm hover:text-orange-400 transition-colors"
              >
                contact@campease.vn
              </a>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <svg
                className="w-4 h-4 text-orange-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <span className="text-sm">1900-6789</span>
            </div>
          </div>

          {/* Social Media */}
          <div className="flex space-x-4">
            <a
              href="https://www.facebook.com/campease"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 hover:text-orange-400 transition-colors"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Facebook_logo_36x36.svg/1024px-Facebook_logo_36x36.svg.png"
                alt="Facebook"
                className="h-6 w-6 rounded"
              />
              <span className="text-sm">Facebook</span>
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-4">Dành cho Phụ huynh</h4>
          <ul className="space-y-3">
            <li>
              <Link
                to="/camps"
                className="text-gray-300 hover:text-orange-400 transition-colors text-sm"
              >
                Tìm trại hè
              </Link>
            </li>
            <li>
              <Link
                to="/how-to-register"
                className="text-gray-300 hover:text-orange-400 transition-colors text-sm"
              >
                Hướng dẫn đăng ký
              </Link>
            </li>
            <li>
              <Link
                to="/safety"
                className="text-gray-300 hover:text-orange-400 transition-colors text-sm"
              >
                An toàn trẻ em
              </Link>
            </li>
            <li>
              <Link
                to="/faqs"
                className="text-gray-300 hover:text-orange-400 transition-colors text-sm"
              >
                Câu hỏi thường gặp
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-4">Dành cho Tổ chức</h4>
          <ul className="space-y-3">
            <li>
              <Link
                to="/partner"
                className="text-gray-300 hover:text-orange-400 transition-colors text-sm"
              >
                Trở thành đối tác
              </Link>
            </li>
            <li>
              <Link
                to="/management"
                className="text-gray-300 hover:text-orange-400 transition-colors text-sm"
              >
                Quản lý trại hè
              </Link>
            </li>
            <li>
              <Link
                to="/guidelines"
                className="text-gray-300 hover:text-orange-400 transition-colors text-sm"
              >
                Hướng dẫn tổ chức
              </Link>
            </li>
            <li>
              <Link
                to="/resources"
                className="text-gray-300 hover:text-orange-400 transition-colors text-sm"
              >
                Tài nguyên
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-4">Về CampEase</h4>
          <ul className="space-y-3">
            <li>
              <Link
                to="/about"
                className="text-gray-300 hover:text-orange-400 transition-colors text-sm"
              >
                Về chúng tôi
              </Link>
            </li>
            <li>
              <Link
                to="/news"
                className="text-gray-300 hover:text-orange-400 transition-colors text-sm"
              >
                Tin tức
              </Link>
            </li>
            <li>
              <Link
                to="/careers"
                className="text-gray-300 hover:text-orange-400 transition-colors text-sm"
              >
                Tuyển dụng
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="text-gray-300 hover:text-orange-400 transition-colors text-sm"
              >
                Liên hệ
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-12 pt-6 text-sm">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-gray-400">
            © 2024 - 2025 CampEase. Tất cả quyền được bảo lưu.
          </p>
          <div className="flex space-x-6">
            <Link
              to="/terms"
              className="text-gray-400 hover:text-orange-400 transition-colors"
            >
              Điều khoản dịch vụ
            </Link>
            <Link
              to="/privacy"
              className="text-gray-400 hover:text-orange-400 transition-colors"
            >
              Chính sách bảo mật
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
