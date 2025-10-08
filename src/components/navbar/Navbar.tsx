import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import Logoforblack from "../../assets/Logo.png";

export default function Navbar() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const handleMobileLinkClick = () => setShowMobileMenu(false);

  // Đóng mobile menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Theo dõi scroll để thay đổi background navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Navigation links data
  const navLinks = [
    { to: "/", label: "Trang chủ" },
    { to: "/programs", label: "Chương trình" },
    { to: "/blogs", label: "Tin tức" },
    { to: "/about", label: "Giới thiệu" },
    { to: "/contact", label: "Liên hệ" },
  ];

  // Desktop Navigation Links 
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
      <Link
        to="/find-work"
        className="text-white hover:text-yellow-400 transition-colors px-2 py-1"
      >
        Find Work
      </Link>
    </div>
  );

  // Mobile Navigation Links 
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
        <Link
          to="/login"
          className="block w-full text-center bg-gradient-to-r from-orange-400 to-yellow-400 hover:from-orange-500 hover:to-yellow-500 text-white font-bold py-1.5 rounded-md transition-all duration-300 shadow-lg text-xs"
          onClick={handleMobileLinkClick}
        >
          Đăng nhập / Đăng ký
        </Link>
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

      {/* Login button */}
      <div className="hidden md:flex items-center space-x-2">
        <Link
          to="/login"
          className="bg-gradient-to-r from-orange-400 to-yellow-400 hover:from-orange-500 hover:to-yellow-500 text-white font-bold py-1 px-3 rounded-md transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 text-sm"
        >
          Đăng nhập / Đăng ký
        </Link>
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