import { useState } from "react";
import {
    Users,
    BookOpen,
    Tent,
    TrendingUp,
    Calendar,
    DollarSign,
    UserCheck,
    Activity,
} from "lucide-react";
import AdminSidebar from "../../../components/admin/AdminSidebar.tsx";
import StatCard from "../../../components/admin/StatCard.tsx";
import RecentActivityCard from "../../../components/admin/RecentActivityCard.tsx";
import ChartCard from "../../../components/admin/ChartCard.tsx";
import "./AdminDashboard.css";

interface StatData {
    id: number;
    title: string;
    value: string;
    change: string;
    trend: "up" | "down";
    icon: React.ReactNode;
    color: string;
}

interface ActivityItem {
    id: number;
    user: string;
    action: string;
    time: string;
    type: "user" | "blog" | "camp" | "booking";
}

export default function AdminDashboard() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Mock Statistics Data
    const stats: StatData[] = [
        {
            id: 1,
            title: "Total Users",
            value: "2,543",
            change: "+12.5%",
            trend: "up",
            icon: <Users size={24} />,
            color: "#f97316",
        },
        {
            id: 2,
            title: "Active Camps",
            value: "48",
            change: "+8.2%",
            trend: "up",
            icon: <Tent size={24} />,
            color: "#10b981",
        },
        {
            id: 3,
            title: "Blog Posts",
            value: "156",
            change: "+23.1%",
            trend: "up",
            icon: <BookOpen size={24} />,
            color: "#3b82f6",
        },
        {
            id: 4,
            title: "Revenue",
            value: "$45,231",
            change: "+15.3%",
            trend: "up",
            icon: <DollarSign size={24} />,
            color: "#8b5cf6",
        },
        {
            id: 5,
            title: "Bookings Today",
            value: "127",
            change: "+5.4%",
            trend: "up",
            icon: <Calendar size={24} />,
            color: "#ec4899",
        },
        {
            id: 6,
            title: "Active Staff",
            value: "34",
            change: "+2.1%",
            trend: "up",
            icon: <UserCheck size={24} />,
            color: "#06b6d4",
        },
    ];

    // Mock Recent Activity Data
    const recentActivities: ActivityItem[] = [
        {
            id: 1,
            user: "Nguyễn Văn A",
            action: "registered for Summer Camp 2025",
            time: "5 phút trước",
            type: "booking",
        },
        {
            id: 2,
            user: "Admin",
            action: "published new blog post",
            time: "15 phút trước",
            type: "blog",
        },
        {
            id: 3,
            user: "Trần Thị B",
            action: "created new account",
            time: "32 phút trước",
            type: "user",
        },
        {
            id: 4,
            user: "Staff Manager",
            action: "updated Camp Schedule",
            time: "1 giờ trước",
            type: "camp",
        },
        {
            id: 5,
            user: "Lê Văn C",
            action: "cancelled booking",
            time: "2 giờ trước",
            type: "booking",
        },
    ];

    return (
        <div className="admin-dashboard">
            <AdminSidebar
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />

            <main className={`admin-main-content ${isSidebarCollapsed ? "expanded" : ""}`}>
                {/* Header */}
                <header className="dashboard-header">
                    <div>
                        <h1 className="dashboard-title">Dashboard Overview</h1>
                        <p className="dashboard-subtitle">
                            Welcome back! Here's what's happening today.
                        </p>
                    </div>
                    <div className="header-actions">
                        <button className="action-button">
                            <Activity size={18} />
                            <span>View Reports</span>
                        </button>
                        <button className="action-button primary">
                            <TrendingUp size={18} />
                            <span>Analytics</span>
                        </button>
                    </div>
                </header>

                {/* Statistics Grid */}
                <section className="stats-grid">
                    {stats.map((stat) => (
                        <StatCard key={stat.id} {...stat} />
                    ))}
                </section>

                {/* Charts and Activity Section */}
                <section className="dashboard-content-grid">
                    {/* Chart Card */}
                    <ChartCard />

                    {/* Recent Activity */}
                    <RecentActivityCard activities={recentActivities} />
                </section>
            </main>
        </div>
    );
}
