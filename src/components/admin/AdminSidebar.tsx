import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    BookOpen,
    Tent,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import Logo from "../../assets/Logo.png";
import "./AdminSidebar.css";

interface NavItem {
    id: number;
    label: string;
    path: string;
    icon: React.ReactNode;
}

interface AdminSidebarProps {
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

export default function AdminSidebar({ isCollapsed, onToggleCollapse }: AdminSidebarProps) {
    const location = useLocation();

    const navItems: NavItem[] = [
        {
            id: 1,
            label: "Dashboard",
            path: "/admin/dashboard",
            icon: <LayoutDashboard size={20} />,
        },
        {
            id: 2,
            label: "Account Management",
            path: "/admin/accounts",
            icon: <Users size={20} />,
        },
        {
            id: 3,
            label: "Blogs Management",
            path: "/admin/blogs",
            icon: <BookOpen size={20} />,
        },
        {
            id: 4,
            label: "Camps Management",
            path: "/admin/camps",
            icon: <Tent size={20} />,
        },
        {
            id: 5,
            label: "Settings",
            path: "/admin/settings",
            icon: <Settings size={20} />,
        },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <aside className={`admin-sidebar ${isCollapsed ? "collapsed" : ""}`}>
            {/* Logo Section */}
            <div className="sidebar-logo">
                <img src={Logo} alt="Summer Camp Logo" className="logo-image" />
                {!isCollapsed && <span className="logo-text">Admin Panel</span>}
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
