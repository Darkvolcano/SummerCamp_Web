import { useState } from "react";
import { Tent, MapPin, Calendar, Users } from "lucide-react";
import StaffSidebar from "../../../components/staff/StaffSidebar";
import "../MySchedule/MySchedule.css";
import "./MyCamps.css";

interface Camp {
    id: number;
    name: string;
    location: string;
    startDate: string;
    endDate: string;
    camperCount: number;
    status: "upcoming" | "ongoing" | "completed";
    description: string;
}

// Mock data for staff camps
const mockCamps: Camp[] = [
    {
        id: 1,
        name: "Adventure Quest Camp",
        location: "Mountain Valley",
        startDate: "2025-10-15",
        endDate: "2025-10-20",
        camperCount: 20,
        status: "upcoming",
        description: "Outdoor adventure activities including hiking, rock climbing, and team challenges.",
    },
    {
        id: 2,
        name: "Science Discovery Camp",
        location: "Science Museum",
        startDate: "2025-10-25",
        endDate: "2025-10-28",
        camperCount: 18,
        status: "upcoming",
        description: "Hands-on science experiments and interactive learning experiences.",
    },
    {
        id: 3,
        name: "Sports & Fun Camp",
        location: "City Sports Complex",
        startDate: "2025-09-10",
        endDate: "2025-09-15",
        camperCount: 30,
        status: "completed",
        description: "Multi-sport activities focusing on teamwork and physical fitness.",
    },
    {
        id: 4,
        name: "Art & Creativity Camp",
        location: "Community Center",
        startDate: "2025-10-22",
        endDate: "2025-10-24",
        camperCount: 15,
        status: "upcoming",
        description: "Creative arts including painting, sculpture, and digital design.",
    },
];

export default function MyCamps() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [filter, setFilter] = useState<"all" | "upcoming" | "ongoing" | "completed">("all");

    const filteredCamps = filter === "all"
        ? mockCamps
        : mockCamps.filter(camp => camp.status === filter);

    const getStatusBadge = (status: Camp["status"]) => {
        const statusConfig = {
            upcoming: { label: "Upcoming", className: "status-upcoming" },
            ongoing: { label: "Ongoing", className: "status-ongoing" },
            completed: { label: "Completed", className: "status-completed" },
        };

        const config = statusConfig[status];
        return <span className={`status-badge ${config.className}`}>{config.label}</span>;
    };

    return (
        <div className="staff-layout">
            <StaffSidebar isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(!isCollapsed)} />

            <div className={`main-content ${isCollapsed ? "sidebar-collapsed" : ""}`}>
                {/* Header */}
                <div className="page-header">
                    <div>
                        <h1 className="page-title">My Camps</h1>
                        <p className="page-subtitle">Manage your assigned camp programs</p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${filter === "all" ? "active" : ""}`}
                        onClick={() => setFilter("all")}
                    >
                        All Camps
                    </button>
                    <button
                        className={`filter-tab ${filter === "upcoming" ? "active" : ""}`}
                        onClick={() => setFilter("upcoming")}
                    >
                        Upcoming
                    </button>
                    <button
                        className={`filter-tab ${filter === "ongoing" ? "active" : ""}`}
                        onClick={() => setFilter("ongoing")}
                    >
                        Ongoing
                    </button>
                    <button
                        className={`filter-tab ${filter === "completed" ? "active" : ""}`}
                        onClick={() => setFilter("completed")}
                    >
                        Completed
                    </button>
                </div>

                {/* Camps Grid */}
                <div className="camps-grid">
                    {filteredCamps.length > 0 ? (
                        filteredCamps.map(camp => (
                            <div key={camp.id} className="camp-card">
                                <div className="camp-header">
                                    <div className="camp-icon">
                                        <Tent size={24} />
                                    </div>
                                    {getStatusBadge(camp.status)}
                                </div>

                                <h3 className="camp-name">{camp.name}</h3>
                                <p className="camp-description">{camp.description}</p>

                                <div className="camp-details">
                                    <div className="detail-item">
                                        <MapPin size={16} />
                                        <span>{camp.location}</span>
                                    </div>
                                    <div className="detail-item">
                                        <Calendar size={16} />
                                        <span>
                                            {new Date(camp.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -
                                            {new Date(camp.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <Users size={16} />
                                        <span>{camp.camperCount} Campers</span>
                                    </div>
                                </div>

                                <button className="view-details-btn">View Details</button>
                            </div>
                        ))
                    ) : (
                        <div className="no-camps">
                            <Tent size={64} />
                            <p>No camps found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
