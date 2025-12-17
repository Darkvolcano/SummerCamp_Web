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
  const stats: StatData[] = [
    {
      id: 1,
      title: "Tổng Người Dùng",
      value: "2,543",
      change: "+12.5%",
      trend: "up",
      icon: <Users size={24} />,
      color: "#f97316",
    },
    {
      id: 2,
      title: "Trại Hoạt Động",
      value: "48",
      change: "+8.2%",
      trend: "up",
      icon: <Tent size={24} />,
      color: "#10b981",
    },
    {
      id: 3,
      title: "Bài Viết",
      value: "156",
      change: "+23.1%",
      trend: "up",
      icon: <BookOpen size={24} />,
      color: "#3b82f6",
    },
    {
      id: 4,
      title: "Doanh Thu",
      value: "$45,231",
      change: "+15.3%",
      trend: "up",
      icon: <DollarSign size={24} />,
      color: "#8b5cf6",
    },
    {
      id: 5,
      title: "Đăng Ký Hôm Nay",
      value: "127",
      change: "+5.4%",
      trend: "up",
      icon: <Calendar size={24} />,
      color: "#ec4899",
    },
    {
      id: 6,
      title: "Nhân Viên",
      value: "34",
      change: "+2.1%",
      trend: "up",
      icon: <UserCheck size={24} />,
      color: "#06b6d4",
    },
  ];

  const recentActivities: ActivityItem[] = [
    {
      id: 1,
      user: "Nguyễn Văn A",
      action: "đã đăng ký Trại Hè 2025",
      time: "5 phút trước",
      type: "booking",
    },
    {
      id: 2,
      user: "Admin",
      action: "đã đăng bài viết mới",
      time: "15 phút trước",
      type: "blog",
    },
    {
      id: 3,
      user: "Trần Thị B",
      action: "đã tạo tài khoản mới",
      time: "32 phút trước",
      type: "user",
    },
    {
      id: 4,
      user: "Staff Manager",
      action: "đã cập nhật Lịch Trại",
      time: "1 giờ trước",
      type: "camp",
    },
    {
      id: 5,
      user: "Lê Văn C",
      action: "đã hủy đăng ký",
      time: "2 giờ trước",
      type: "booking",
    },
  ];

  return (
    <>
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Tổng Quan</h1>
          <p className="dashboard-subtitle">
            Chào mừng trở lại! Đây là những gì đang diễn ra hôm nay.
          </p>
        </div>
        <div className="header-actions">
          <button className="action-button">
            <Activity size={18} />
            <span>Xem Báo Cáo</span>
          </button>
          <button className="action-button primary">
            <TrendingUp size={18} />
            <span>Phân Tích</span>
          </button>
        </div>
      </header>

      <section className="stats-grid">
        {stats.map((stat) => (
          <StatCard key={stat.id} {...stat} />
        ))}
      </section>

      <section className="dashboard-content-grid">
        <ChartCard />
        <RecentActivityCard activities={recentActivities} />
      </section>
    </>
  );
}
