import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Activity,
  UsersRound,
  Bus,
  Bed,
  CreditCard,
  Calendar,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAuthStore } from "../../../services/userService";
import "./ManagerSidebar.css";
import { PagePath } from "../../../enums/page-path.enum";

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const ManagerSidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const [selectedCamp, setSelectedCamp] = useState("Chọn trại hè");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const camps = [
    { id: 1, name: "Trại hè Mùa Hè 2024" },
    { id: 2, name: "Trại hè Phiêu Lưu" },
    { id: 3, name: "Trại hè Khám Phá" },
  ];

  const mainMenuItems: MenuItem[] = [
    {
      path: PagePath.MANAGER_DASHBOARD,
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      path: PagePath.MANAGER_REGIS,
      label: "Đăng ký",
      icon: <ClipboardList size={20} />,
    },
    {
      path: PagePath.MANAGER_CAMPERS,
      label: "Trại viên",
      icon: <Users size={20} />,
    },
    {
      path: PagePath.MANAGER_ACTIVITIES,
      label: "Hoạt động",
      icon: <Activity size={20} />,
    },
    {
      path: PagePath.MANAGER_GROUPS,
      label: "Phân nhóm",
      icon: <UsersRound size={20} />,
    },
    {
      path: PagePath.MANAGER_TRANSPORTATION,
      label: "Quản lý đưa đón",
      icon: <Bus size={20} />,
    },
    {
      path: PagePath.MANAGER_ACCOMODATION,
      label: "Quản lý phòng ngủ",
      icon: <Bed size={20} />,
    },
    {
      path: PagePath.MANAGER_PAYMENTS,
      label: "Thanh toán",
      icon: <CreditCard size={20} />,
    },
  ];

  const bottomMenuItems: MenuItem[] = [
    {
      path: PagePath.MANAGER_CALENDAR,
      label: "Lịch",
      icon: <Calendar size={20} />,
    },
    {
      path: PagePath.Manager_INCIDENTS,
      label: "Báo cáo sự cố",
      icon: <AlertTriangle size={20} />,
    },
  ];

  const handleCampSelect = (campName: string) => {
    setSelectedCamp(campName);
    setIsDropdownOpen(false);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    if (!isCollapsed) {
      setIsDropdownOpen(false);
    }
  };

  return (
    <div className={`manager-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* Toggle Button */}
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isCollapsed ? ">" : "<"}
      </button>

      {/* Logo & Title */}
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-hexagon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                fill="currentColor"
                fillOpacity="0.3"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          {!isCollapsed && <span className="logo-text">Manager</span>}
        </div>
      </div>

      {/* Camp Dropdown */}
      {!isCollapsed && (
        <div className="camp-selector-section">
          <label className="camp-label">Quản lý trại hè</label>
          <div className="camp-dropdown">
            <button
              className="dropdown-toggle"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="dropdown-text">{selectedCamp}</span>
              {isDropdownOpen ? (
                <ChevronUp size={16} className="dropdown-icon" />
              ) : (
                <ChevronDown size={16} className="dropdown-icon" />
              )}
            </button>

            {isDropdownOpen && (
              <div className="dropdown-menu">
                {camps.map((camp) => (
                  <button
                    key={camp.id}
                    className="dropdown-item"
                    onClick={() => handleCampSelect(camp.name)}
                  >
                    {camp.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            {user?.fullName?.charAt(0).toUpperCase() || "M"}
          </div>
          {!isCollapsed && (
            <>
              <div className="user-details">
                <div className="user-name">{user?.fullName || "Manager"}</div>
                <div className="user-role">Project Manager</div>
              </div>
              <button className="user-menu-toggle">
                <ChevronDown size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerSidebar;