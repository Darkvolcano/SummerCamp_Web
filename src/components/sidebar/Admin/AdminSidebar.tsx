import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Tent,
  Users,
  FileText,
  HelpCircle,
  CreditCard,
  Calendar,
  AlertTriangle,
  ChevronDown,
  LogOut,
  UserCircle,
  Shield,
  Logs,
  MapPin,
  Tag,
} from "lucide-react";
import { useAuthStore } from "../../../services/userService";
import "./AdminSidebar.css";
import { PagePath } from "../../../enums/page-path.enum";

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

interface AdminSidebarProps {
  onCollapsedChange?: (isCollapsed: boolean) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ onCollapsedChange }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const mainMenuItems: MenuItem[] = [
    {
      path: PagePath.ADMIN_DASHBOARD,
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      path: PagePath.ADMIN_CAMPS,
      label: "Chương Trình Trại",
      icon: <Tent size={20} />,
    },
        {
      path: PagePath.ADMIN_CAMPTYPES,
      label: "Phân Loại Hội Trại",
      icon: <Logs size={20} />,
    },
    {
      path: PagePath.ADMIN_CAMP_LOCATIONS,
      label: "Địa Điểm Trại",
      icon: <MapPin size={20} />,
    },
    {
      path: PagePath.ADMIN_PROMOTIONS,
      label: "Khuyến Mãi",
      icon: <Tag size={20} />,
    },
    {
      path: PagePath.ADMIN_USERS,
      label: "Người Dùng",
      icon: <Users size={20} />,
    },
    {
      path: PagePath.ADMIN_BLOGS,
      label: "Bài Viết Blog",
      icon: <FileText size={20} />,
    },
    {
      path: PagePath.ADMIN_FAQS,
      label: "FAQs",
      icon: <HelpCircle size={20} />,
    },
    {
      path: PagePath.ADMIN_TRANSACTIONS,
      label: "Giao Dịch",
      icon: <CreditCard size={20} />,
    },
  ];

  const bottomMenuItems: MenuItem[] = [
    {
      path: PagePath.ADMIN_CALENDAR,
      label: "Lịch",
      icon: <Calendar size={20} />,
    },
    {
      path: PagePath.ADMIN_REPORTS,
      label: "Báo Cáo Sự Cố",
      icon: <AlertTriangle size={20} />,
    },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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

  // Notify parent when collapsed state changes
  useEffect(() => {
    if (onCollapsedChange) {
      onCollapsedChange(isCollapsed);
    }
  }, [isCollapsed, onCollapsedChange]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    if (!isCollapsed) {
      setShowUserDropdown(false);
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserDropdown(false);
    navigate(PagePath.LOGIN);
  };

  return (
    <div className={`admin-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* Toggle Button */}
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isCollapsed ? ">" : "<"}
      </button>

      {/* Logo & Title */}
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-hexagon">
            <Shield size={24} strokeWidth={2.5} />
          </div>
          {!isCollapsed && <span className="logo-text">Admin</span>}
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="sidebar-nav">
        <ul className="menu-list">
          {mainMenuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`menu-item ${
                  location.pathname === item.path ? "active" : ""
                }`}
                title={isCollapsed ? item.label : ""}
              >
                <span className="menu-icon">{item.icon}</span>
                {!isCollapsed && (
                  <span className="menu-label">{item.label}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* Divider */}
        <div className="sidebar-divider"></div>

        {/* Bottom Navigation */}
        <ul className="menu-list">
          {bottomMenuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`menu-item ${
                  location.pathname === item.path ? "active" : ""
                }`}
                title={isCollapsed ? item.label : ""}
              >
                <span className="menu-icon">{item.icon}</span>
                {!isCollapsed && (
                  <span className="menu-label">{item.label}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info */}
      <div className="sidebar-footer" ref={dropdownRef}>
        <div
          className="user-info"
          onClick={() => !isCollapsed && setShowUserDropdown(!showUserDropdown)}
        >
          <div className="user-avatar admin-avatar">
            {user?.fullName?.charAt(0).toUpperCase() || "A"}
          </div>
          {!isCollapsed && (
            <>
              <div className="user-details">
                <div className="user-name">{user?.fullName || "Admin"}</div>
                <div className="user-role">Quản Trị Viên Hệ Thống</div>
              </div>
              <button className="user-menu-toggle">
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${
                    showUserDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>
            </>
          )}
        </div>

        {/* User Dropdown Menu */}
        {showUserDropdown && !isCollapsed && (
          <div className="user-dropdown-menu">
            <button
              onClick={() => {
                setShowUserDropdown(false);
                navigate(PagePath.ROOT + "profile");
              }}
              className="user-dropdown-item"
            >
              <UserCircle size={18} />
              <span>Cài Đặt Hồ Sơ</span>
            </button>
            <div className="user-dropdown-divider"></div>
            <button
              onClick={handleLogout}
              className="user-dropdown-item logout"
            >
              <LogOut size={18} />
              <span>Đăng Xuất</span>
            </button>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default AdminSidebar;