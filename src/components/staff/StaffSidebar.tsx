import { Link, useLocation } from "react-router-dom";
import {
    Calendar,
    Tent,
    BookOpen,
    LogOut,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import Logo from "../../assets/Logo.png";
import "./StaffSidebar.css";

interface NavItem {
    id: number;
    label: string;
    path: string;
    icon: React.ReactNode;
}

interface StaffSidebarProps {
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

export default function StaffSidebar({ isCollapsed, onToggleCollapse }: StaffSidebarProps) {
    const location = useLocation();

    const navItems: NavItem[] = [
        {
            id: 1,
            label: "My Schedule",
            path: "/staff/schedule",
            icon: <Calendar size={20} />,
        },
        {
            id: 2,
            label: "My Camps",
            path: "/staff/camps",
            icon: <Tent size={20} />,
        },
        {
            id: 3,
            label: "My Blogs",
            path: "/staff/blogs",
            icon: <BookOpen size={20} />,
        },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <aside className={`staff-sidebar ${isCollapsed ? "collapsed" : ""}`}>
            {/* Logo Section */}
            <div className="sidebar-logo">
                <img src={Logo} alt="Summer Camp Logo" className="logo-image" />
                {!isCollapsed && <span className="logo-text">Staff Panel</span>}
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <Link
                        key={item.id}
                        to={item.path}
                        className={`nav-item ${isActive(item.path) ? "active" : ""}`}
                        title={isCollapsed ? item.label : ""}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        {!isCollapsed && <span className="nav-label">{item.label}</span>}
                    </Link>
                ))}
            </nav>

            {/* Bottom Section */}
            <div className="sidebar-bottom">
                <button className="nav-item logout-button">
                    <span className="nav-icon">
                        <LogOut size={20} />
                    </span>
                    {!isCollapsed && <span className="nav-label">Logout</span>}
                </button>

                {/* Toggle Button */}
                <button className="toggle-button" onClick={onToggleCollapse}>
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>
        </aside>
    );
}
