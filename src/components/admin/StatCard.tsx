import { TrendingUp, TrendingDown } from "lucide-react";
import "./StatCard.css";

interface StatCardProps {
    title: string;
    value: string;
    change: string;
    trend: "up" | "down";
    icon: React.ReactNode;
    color: string;
}

export default function StatCard({ title, value, change, trend, icon, color }: StatCardProps) {
    return (
        <div className="stat-card">
            <div className="stat-card-header">
                <div className="stat-icon" style={{ background: `${color}15`, color }}>
                    {icon}
                </div>
                <div className={`stat-trend ${trend}`}>
                    {trend === "up" ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    <span>{change}</span>
                </div>
            </div>
            <div className="stat-content">
                <h3 className="stat-value">{value}</h3>
                <p className="stat-title">{title}</p>
            </div>
            <div className="stat-progress-bar">
                <div
                    className="stat-progress-fill"
                    style={{
                        width: `${Math.abs(parseFloat(change))}%`,
                        background: color,
                    }}
                />
            </div>
        </div>
    );
}
