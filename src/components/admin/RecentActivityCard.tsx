import { Users, BookOpen, Tent, Calendar } from "lucide-react";
import "./RecentActivityCard.css";

interface ActivityItem {
    id: number;
    user: string;
    action: string;
    time: string;
    type: "user" | "blog" | "camp" | "booking";
}

interface RecentActivityCardProps {
    activities: ActivityItem[];
}

const activityIcons = {
    user: <Users size={16} />,
    blog: <BookOpen size={16} />,
    camp: <Tent size={16} />,
    booking: <Calendar size={16} />,
};

const activityColors = {
    user: "#3b82f6",
    blog: "#10b981",
    camp: "#f97316",
    booking: "#8b5cf6",
};

export default function RecentActivityCard({ activities }: RecentActivityCardProps) {
    return (
        <div className="activity-card">
            <div className="card-header">
                <h3 className="card-title">Recent Activity</h3>
                <button className="view-all-button">View All</button>
            </div>
            <div className="activity-list">
                {activities.map((activity) => (
                    <div key={activity.id} className="activity-item">
                        <div
                            className="activity-icon"
                            style={{
                                background: `${activityColors[activity.type]}15`,
                                color: activityColors[activity.type],
                            }}
                        >
                            {activityIcons[activity.type]}
                        </div>
                        <div className="activity-content">
                            <p className="activity-text">
                                <span className="activity-user">{activity.user}</span> {activity.action}
                            </p>
                            <span className="activity-time">{activity.time}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
