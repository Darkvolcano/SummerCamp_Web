import React, { useState, useRef, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  SmilePlus,
  UsersRound,
  UserRoundPlus,
  Bus,
  Bed,
  CreditCard,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  LogOut,
  UserCircle,
  MapPinHouse,
} from "lucide-react";
import { useAuthStore } from "../../../services/userService";
import { ManagerContext } from "../../../contexts/ManagerContext";
import "./ManagerSidebar.css";
import { PagePath } from "../../../enums/page-path.enum";

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

interface ManagerSidebarProps {
  onCollapsedChange?: (isCollapsed: boolean) => void;
}

const ManagerSidebar: React.FC<ManagerSidebarProps> = ({
  onCollapsedChange,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const context = useContext(ManagerContext);

  const [selectedCamp, setSelectedCamp] = useState("Chọn chương trình trại");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get camps and loading state from context
  const camps = context?.camps || [];
  const isLoadingCamps = context?.isLoadingCamps || false;

  // Restore selected camp name 
  useEffect(() => {
    if (camps.length > 0) {
      const savedCampName = localStorage.getItem("selectedCampName");
      if (savedCampName) {
        setSelectedCamp(savedCampName);
        console.log("[ManagerSidebar] Restored selected camp from localStorage:", savedCampName);
      }
    }
  }, [camps.length]);

  const mainMenuItems: MenuItem[] = [
    {
      path: PagePath.MANAGER_DASHBOARD,
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      path: PagePath.MANAGER_STAFFS,
      label: "Nhân Viên",
      icon: <UserRoundPlus size={20} />,
    },
    {
      path: PagePath.MANAGER_REGIS,
      label: "Đăng Ký",
      icon: <ClipboardList size={20} />,
    },
    {
      path: PagePath.MANAGER_CAMPERS,
      label: "Trại Viên",
      icon: <Users size={20} />,
    },
    {
      path: PagePath.MANAGER_ACTIVITIES,
      label: "Hoạt Động",
      icon: <SmilePlus  size={20} />,
    },
    {
      path: PagePath.MANAGER_GROUPS,
      label: "Nhóm",
      icon: <UsersRound size={20} />,
    },
    {
      path: PagePath.MANAGER_TRANSPORTATION,
      label: "Đưa Đón",
      icon: <Bus size={20} />,
    },
    {
      path: PagePath.MANAGER_LOCATIONS,
      label: "Địa Điểm",
      icon: <MapPinHouse  size={20} />,
    },
    {
      path: PagePath.MANAGER_ACCOMODATION,
      label: "Chỗ Ở",
      icon: <Bed size={20} />,
    },
    {
      path: PagePath.MANAGER_PAYMENTS,
      label: "Giao Dịch",
      icon: <CreditCard size={20} />,
    },
  ];

  const bottomMenuItems: MenuItem[] = [
    {
      path: PagePath.MANAGER_INCIDENTS,
      label: "Báo Cáo Sự Cố",
      icon: <AlertTriangle size={20} />,
    },
  ];

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

  useEffect(() => {
    if (onCollapsedChange) {
      onCollapsedChange(isCollapsed);
    }
  }, [isCollapsed, onCollapsedChange]);

  const handleCampSelect = (campId: number, campName: string) => {
    console.log("[ManagerSidebar] handleCampSelect called with:", { campId, campName });
    console.log("[ManagerSidebar] context:", context);

    if (context?.setSelectedCampId) {
      context.setSelectedCampId(campId);
      console.log("[ManagerSidebar] Camp ID set in context");
    } else {
      console.warn("[ManagerSidebar] context.setSelectedCampId is not available!");
    }

    setSelectedCamp(campName);
    localStorage.setItem("selectedCampName", campName);
    console.log("[ManagerSidebar] Selected camp updated to:", campName);
    setIsDropdownOpen(false);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    if (!isCollapsed) {
      setIsDropdownOpen(false);
      setShowUserDropdown(false);
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserDropdown(false);
    navigate(PagePath.LOGIN);
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
          <label className="camp-label">Quản lý chương trình trại</label>
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
                {isLoadingCamps ? (
                  <div className="dropdown-item text-gray-500">
                    Đang tải trại...
                  </div>
                ) : camps.length === 0 ? (
                  <div className="dropdown-item text-gray-500">
                    Không có trại được phân công
                  </div>
                ) : (
                  camps.map((camp) => (
                    <button
                      key={camp.id}
                      className="dropdown-item"
                      onClick={() => handleCampSelect(camp.id, camp.name)}
                    >
                      {camp.name}
                    </button>
                  ))
                )}
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
      <div className="sidebar-footer" ref={dropdownRef}>
        <div
          className="user-info"
          onClick={() => !isCollapsed && setShowUserDropdown(!showUserDropdown)}
        >
          <div className="user-avatar">
            {user?.fullName?.charAt(0).toUpperCase() || "M"}
          </div>
          {!isCollapsed && (
            <>
              <div className="user-details">
                <div className="user-name">{user?.fullName || "Manager"}</div>
                <div className="user-role">Quản Lý Dự Án</div>
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

export default ManagerSidebar;
