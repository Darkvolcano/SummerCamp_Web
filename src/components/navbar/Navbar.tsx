import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import {
  LogOut,
  ChevronDown,
  UserCircle,
  Calendar,
  FileText,
  CreditCard,
} from "lucide-react";
import Logoforblack from "../../assets/Logo.png";
import { useAuthStore } from "../../services/userService";
import { PagePath } from "../../enums/page-path.enum";

export default function Navbar() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleMobileLinkClick = () => setShowMobileMenu(false);

  // Close mobile menu and dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setShowMobileMenu(false);
      }
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // navbar scroll change
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Navigation links
  const navLinks = [
    { to: "/", label: "Trang chủ" },
    { to: "/camp", label: "Chương trình" },
    { to: "/blogs", label: "Tin tức" },
    { to: "/about", label: "Giới thiệu" },
    { to: "/contact", label: "Liên hệ" },
  ];

  // Desktop Navigation
  const renderDesktopNavigationLinks = () => (
    <div className="hidden md:flex space-x-2 lg:space-x-4 text-xs lg:text-lg font-medium">
      {navLinks.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className="text-white hover:text-orange-400 transition-colors duration-300 relative group px-2 py-1"
        >
          {link.label}
          <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-orange-400 transition-all duration-300 group-hover:w-full"></span>
        </Link>
      ))}
    </div>
  );

  // Mobile Navigation
  const renderMobileNavigationLinks = () => (
    <>
      {navLinks.map((link, index) => (
        <Link
          key={link.to}
          to={link.to}
          onClick={handleMobileLinkClick}
          className={`block px-3 py-2 text-white hover:bg-orange-500/20 hover:text-orange-400 transition-colors text-xs ${
            index < navLinks.length - 1 ? "border-b border-gray-700/50" : ""
          }`}
        >
          {link.label}
        </Link>
      ))}
      <div className="px-3 py-2 border-t border-gray-700/50">
        {user ? (
          <>
            <div className="mb-2 p-2 bg-orange-500/10 rounded-md">
              <p className="text-white text-xs font-semibold truncate">
                {user?.fullName || "User"}
              </p>
              <p className="text-gray-300 text-xs truncate">
                {user?.email || ""}
              </p>
            </div>
            <button
              onClick={() => {
                handleMobileLinkClick();
                navigate(PagePath.ROOT + "profile");
              }}
              className="block w-full text-center bg-gradient-to-r from-orange-400 to-yellow-400 hover:from-orange-500 hover:to-yellow-500 text-white font-bold py-1.5 rounded-md transition-all duration-300 shadow-lg text-xs mb-2"
            >
              Thông tin cá nhân
            </button>
            <button
              onClick={() => {
                logout();
                handleMobileLinkClick();
                navigate(PagePath.ROOT);
              }}
              className="block w-full text-center bg-red-500 hover:bg-red-600 text-white font-bold py-1.5 rounded-md transition-all duration-300 shadow-lg text-xs"
            >
              Đăng xuất
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="block w-full text-center bg-gradient-to-r from-orange-400 to-yellow-400 hover:from-orange-500 hover:to-yellow-500 text-white font-bold py-1.5 rounded-md transition-all duration-300 shadow-lg text-xs"
            onClick={handleMobileLinkClick}
          >
            Đăng nhập / Đăng ký
          </Link>
        )}
      </div>
    </>
  );

  return (
    <nav
      className={`text-white px-2 md:px-4 py-1 md:py-2 flex justify-between items-center fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-[#0F0E0E]/90 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      {/* Logo*/}
      <div className="text-lg font-bold transition-transform duration-300 hover:scale-105">
        <Link to="/">
          <img
            src={Logoforblack}
            alt="CampEase Logo"
            className="h-6 md:h-8 lg:h-10 transition-all duration-300"
          />
        </Link>
      </div>

      {/* Desktop Navigation */}
      {renderDesktopNavigationLinks()}

      {/* Login button or User Info */}
      <div className="hidden md:flex items-center space-x-2">
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 bg-transparent text-white font-semibold py-2 px-4 rounded-full border-2 border-white/30 hover:border-orange-400 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
            >
              <UserCircle size={18} className="text-orange-400" />
              <span className="text-sm">
                {user?.fullName || user?.email || "User"}
              </span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-300 text-orange-400 ${
                  showUserDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl py-2 z-50 animate-fadeIn border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {user?.fullName || "User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email || ""}
                  </p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      navigate(PagePath.ROOT + "profile");
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-800 bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-3"
                  >
                    <UserCircle size={18} className="text-gray-600" />
                    <span>Thông tin cá nhân</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      navigate(PagePath.ROOT + "my-registrations");
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-800 bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-3"
                  >
                    <Calendar size={18} className="text-gray-600" />
                    <span>Đăng ký của tôi</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      navigate(PagePath.ROOT + "transaction-history");
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-800 bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-3"
                  >
                    <FileText size={18} className="text-gray-600" />
                    <span>Lịch sử giao dịch</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      navigate(PagePath.ROOT + "camper-status");
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-800 bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-3"
                  >
                    <CreditCard size={18} className="text-gray-600" />
                    <span>Trạng thái trại viên</span>
                  </button>
                </div>

                <div className="px-4 py-2 border-t border-gray-100">
                  <button
                    onClick={() => {
                      logout();
                      setShowUserDropdown(false);
                      navigate(PagePath.ROOT);
                    }}
                    className="w-full bg-[#FF8F50] hover:bg-[#ff7e3d] hover:scale-105 text-white font-semibold py-2 rounded-full transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                  >
                    <LogOut size={16} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="bg-transparent border-2 border-white/30 hover:border-orange-400 hover:bg-white/10 text-white font-semibold py-2 px-5 rounded-full transition-all duration-300 backdrop-blur-sm text-sm"
          >
            Đăng nhập / Đăng ký
          </Link>
        )}
      </div>

      {/* Mobile Menu Toggle*/}
      <div ref={mobileMenuRef} className="md:hidden">
        <button
          onClick={() => setShowMobileMenu((prev) => !prev)}
          className="focus:outline-none focus:ring-2 focus:ring-orange-400 rounded-md p-1 transition-all duration-300 hover:bg-white/10"
          aria-label="Toggle menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 text-white transition-transform duration-300 ${
              showMobileMenu ? "rotate-90" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {showMobileMenu ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Mobile Menu Dropdown */}
        {showMobileMenu && (
          <div className="absolute top-full left-0 w-full bg-[#0F0E0E]/95 backdrop-blur-md shadow-2xl animate-fadeIn">
            {renderMobileNavigationLinks()}
          </div>
        )}
      </div>
    </nav>
  );
}
