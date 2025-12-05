import React, { useState, useRef, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ClipboardCheck,
  Calendar,
  Image,
  LogIn,
  ChevronDown,
  ChevronUp,
  LogOut,
  UserCircle,
  Briefcase,
} from "lucide-react";
import { useAuthStore } from "../../../services/userService";
import { StaffContext } from "../../../contexts/StaffContext";
import "./StaffSidebar.css";
import { PagePath } from "../../../enums/page-path.enum";

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

interface StaffSidebarProps {
  onCollapsedChange?: (isCollapsed: boolean) => void;
}

const StaffSidebar: React.FC<StaffSidebarProps> = ({ onCollapsedChange }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const context = useContext(StaffContext);
  
  const [selectedCamp, setSelectedCamp] = useState("Choose a camp program");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const camps = context?.camps || [];
  const isLoadingCamps = context?.isLoadingCamps || false;

  useEffect(() => {
    if (camps.length > 0) {
      const savedCampName = localStorage.getItem("staffSelectedCampName");
      if (savedCampName) {
        setSelectedCamp(savedCampName);
        console.log("[StaffSidebar] Restored selected camp from localStorage:", savedCampName);
      }
    }
  }, [camps.length]);

  const mainMenuItems: MenuItem[] = [
    {
      path: PagePath.STAFF_CALENDAR,
      label: "My Calendar",
      icon: <Calendar size={20} />,
    },
    {
      path: PagePath.STAFF_ATTENDANCE_CHECKING,
      label: "Attendance Checking",
      icon: <ClipboardCheck size={20} />,
    },
    {
      path: PagePath.STAFF_PHOTOS,
      label: "Photo Sharing",
      icon: <Image size={20} />,
    },
    {
      path: PagePath.STAFF_CHECKIN,
      label: "Check In",
      icon: <LogIn size={20} />,
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

  // Camp selection handler
  const handleCampSelect = (campId: number, campName: string) => {
    console.log("[StaffSidebar] handleCampSelect called with:", { campId, campName });
    
    if (context?.setSelectedCampId) {
      context.setSelectedCampId(campId);
      console.log("[StaffSidebar] Camp ID set in context");
    } else {
      console.warn("[StaffSidebar] context.setSelectedCampId is not available!");
    }

    setSelectedCamp(campName);
    localStorage.setItem("staffSelectedCampName", campName);
    console.log("[StaffSidebar] Selected camp updated to:", campName);
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
    <div className={`staff-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* Toggle Button */}
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isCollapsed ? ">" : "<"}
      </button>

      {/* Logo & Title */}
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-hexagon">
            <Briefcase size={24} strokeWidth={2.5} />
          </div>
          {!isCollapsed && <span className="logo-text">Staff</span>}
        </div>
      </div>

      {/* Camp Dropdown */}
      {!isCollapsed && (
        <div className="camp-selector-section">
          <label className="camp-label">Camp program assignment</label>
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
                    Loading camps...
                  </div>
                ) : camps.length === 0 ? (
                  <div className="dropdown-item text-gray-500">
                    No camps assigned
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
      </nav>

      {/* User Info */}
      <div className="sidebar-footer" ref={dropdownRef}>
        <div
          className="user-info"
          onClick={() => !isCollapsed && setShowUserDropdown(!showUserDropdown)}
        >
          <div className="user-avatar">
            {user?.fullName?.charAt(0).toUpperCase() || "S"}
          </div>
          {!isCollapsed && (
            <>
              <div className="user-details">
                <div className="user-name">{user?.fullName || "Staff"}</div>
                <div className="user-role">Camp Staff</div>
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
              <span>Profile Settings</span>
            </button>
            <div className="user-dropdown-divider"></div>
            <button
              onClick={handleLogout}
              className="user-dropdown-item logout"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffSidebar;
