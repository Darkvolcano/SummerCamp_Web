import { TrendingUp } from "lucide-react";
import "./ChartCard.css";

export default function ChartCard() {
    // Mock chart data for visual representation
    const chartData = [
        { month: "Jan", value: 65 },
        { month: "Feb", value: 75 },
        { month: "Mar", value: 85 },
        { month: "Apr", value: 70 },
        { month: "May", value: 90 },
        { month: "Jun", value: 95 },
    ];

    const maxValue = Math.max(...chartData.map((d) => d.value));

    return (
        <div className="chart-card">
            <div className="card-header">
                <div>
                    <h3 className="card-title">Doanh Thu Tháng</h3>
                    <p className="card-subtitle">Tăng trưởng doanh thu trong 6 tháng qua</p>
                </div>
                <div className="chart-badge">
                    <TrendingUp size={16} />
                    <span>+18.2%</span>
                </div>
            </div>

            <div className="chart-container">
                <div className="chart-bars">
                    {chartData.map((data, index) => (
                        <div key={index} className="chart-bar-wrapper">
                            <div
                                className="chart-bar"
                                style={{
                                    height: `${(data.value / maxValue) * 100}%`,
                                    animationDelay: `${index * 0.1}s`,
                                }}
                            >
                                <div className="bar-tooltip">{data.value}%</div>
                            </div>
                            <span className="chart-label">{data.month}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Additional Stats */}
            <div className="chart-stats">
                <div className="chart-stat-item">
                    <span className="stat-label">Trung Bình</span>
                    <span className="stat-value">78.3%</span>
                </div>
                <div className="chart-stat-item">
                    <span className="stat-label">Cao Nhất</span>
                    <span className="stat-value">95.0%</span>
                </div>
                <div className="chart-stat-item">
                    <span className="stat-label">Tăng Trưởng</span>
                    <span className="stat-value green">+18.2%</span>
                </div>
            </div>
        </div>
    );
}
