import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Users, Clock } from "lucide-react";
import StaffSidebar from "../../../components/staff/StaffSidebar";
import "./MySchedule.css";

interface WorkSchedule {
    date: string; // Format: "YYYY-MM-DD"
    campName: string;
    location: string;
    timeSlot: string;
    role: string;
    camperCount: number;
}

// Mock data for staff schedule
const mockSchedules: WorkSchedule[] = [
    {
        date: "2025-10-15",
        campName: "Adventure Quest Camp",
        location: "Mountain Valley",
        timeSlot: "8:00 AM - 4:00 PM",
        role: "Camp Counselor",
        camperCount: 20,
    },
    {
        date: "2025-10-16",
        campName: "Nature Explorer Camp",
        location: "Forest Park",
        timeSlot: "9:00 AM - 5:00 PM",
        role: "Activity Leader",
        camperCount: 25,
    },
    {
        date: "2025-10-20",
        campName: "Sports & Fun Camp",
        location: "City Sports Complex",
        timeSlot: "7:00 AM - 3:00 PM",
        role: "Sports Instructor",
        camperCount: 30,
    },
    {
        date: "2025-10-22",
        campName: "Art & Creativity Camp",
        location: "Community Center",
        timeSlot: "10:00 AM - 6:00 PM",
        role: "Art Facilitator",
        camperCount: 15,
    },
    {
        date: "2025-10-25",
        campName: "Science Discovery Camp",
        location: "Science Museum",
        timeSlot: "8:30 AM - 4:30 PM",
        role: "Science Guide",
        camperCount: 18,
    },
    {
        date: "2025-10-28",
        campName: "Adventure Quest Camp",
        location: "Lake District",
        timeSlot: "8:00 AM - 4:00 PM",
        role: "Camp Counselor",
        camperCount: 22,
    },
    {
        date: "2025-11-02",
        campName: "Outdoor Skills Camp",
        location: "Wilderness Area",
        timeSlot: "7:00 AM - 5:00 PM",
        role: "Survival Skills Trainer",
        camperCount: 16,
    },
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export default function MySchedule() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Calculate calendar days
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayWeekday = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    // Create work schedule map
    const scheduleMap = useMemo(() => {
        const map = new Map<string, WorkSchedule[]>();
        mockSchedules.forEach(schedule => {
            const existing = map.get(schedule.date) || [];
            map.set(schedule.date, [...existing, schedule]);
        });
        return map;
    }, []);

    // Generate calendar days
    const calendarDays = useMemo(() => {
        const days = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDayWeekday; i++) {
            days.push(null);
        }

        // Add actual days
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(day);
        }

        return days;
    }, [firstDayWeekday, daysInMonth]);

    const handlePreviousMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
        setSelectedDate(null);
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
        setSelectedDate(null);
    };

    const handleDayClick = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setSelectedDate(dateStr);
    };

    const isToday = (day: number) => {
        const today = new Date();
        return day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();
    };

    const hasWorkSchedule = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return scheduleMap.has(dateStr);
    };

    const getSelectedSchedules = () => {
        if (!selectedDate) return [];
        return scheduleMap.get(selectedDate) || [];
    };

    const upcomingSchedules = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return mockSchedules
            .filter(schedule => new Date(schedule.date) >= today)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 5);
    }, []);

    return (
        <div className="staff-layout">
            <StaffSidebar isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(!isCollapsed)} />

            <div className={`main-content ${isCollapsed ? "sidebar-collapsed" : ""}`}>
                {/* Header */}
                <div className="page-header">
                    <div>
                        <h1 className="page-title">My Schedule</h1>
                        <p className="page-subtitle">View and manage your work schedule</p>
                    </div>
                </div>

                <div className="schedule-container">
                    {/* Calendar Section */}
                    <div className="calendar-card">
                        <div className="calendar-header">
                            <button
                                className="calendar-nav-btn"
                                onClick={handlePreviousMonth}
                                aria-label="Previous month"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <h2 className="calendar-month">
                                {MONTHS[month]} {year}
                            </h2>
                            <button
                                className="calendar-nav-btn"
                                onClick={handleNextMonth}
                                aria-label="Next month"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        {/* Calendar Grid */}
                        <div className="calendar-grid">
                            {/* Day names */}
                            {DAYS.map(day => (
                                <div key={day} className="calendar-day-name">
                                    {day}
                                </div>
                            ))}

                            {/* Calendar days */}
                            {calendarDays.map((day, index) => (
                                <div
                                    key={index}
                                    className={`calendar-day ${!day ? 'empty' : ''} ${day && isToday(day) ? 'today' : ''
                                        } ${day && hasWorkSchedule(day) ? 'has-schedule' : ''} ${day && selectedDate === `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` ? 'selected' : ''
                                        }`}
                                    onClick={() => day && handleDayClick(day)}
                                >
                                    {day && (
                                        <>
                                            <span className="day-number">{day}</span>
                                            {hasWorkSchedule(day) && (
                                                <span className="schedule-indicator"></span>
                                            )}
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Schedule Details Section */}
                    <div className="schedule-details">
                        {selectedDate ? (
                            <>
                                <h3 className="details-title">
                                    <CalendarIcon size={20} />
                                    Schedule for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </h3>

                                {getSelectedSchedules().length > 0 ? (
                                    <div className="schedule-list">
                                        {getSelectedSchedules().map((schedule, index) => (
                                            <div key={index} className="schedule-item">
                                                <h4 className="schedule-camp-name">{schedule.campName}</h4>
                                                <div className="schedule-info">
                                                    <div className="info-row">
                                                        <MapPin size={16} />
                                                        <span>{schedule.location}</span>
                                                    </div>
                                                    <div className="info-row">
                                                        <Clock size={16} />
                                                        <span>{schedule.timeSlot}</span>
                                                    </div>
                                                    <div className="info-row">
                                                        <Users size={16} />
                                                        <span>{schedule.camperCount} Campers</span>
                                                    </div>
                                                </div>
                                                <div className="schedule-role">{schedule.role}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="no-schedule">
                                        <CalendarIcon size={48} />
                                        <p>No schedule for this day</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <h3 className="details-title">
                                    <CalendarIcon size={20} />
                                    Upcoming Schedule
                                </h3>

                                {upcomingSchedules.length > 0 ? (
                                    <div className="schedule-list">
                                        {upcomingSchedules.map((schedule, index) => (
                                            <div key={index} className="schedule-item upcoming">
                                                <div className="schedule-date">
                                                    {new Date(schedule.date + 'T00:00:00').toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                                <div className="schedule-content">
                                                    <h4 className="schedule-camp-name">{schedule.campName}</h4>
                                                    <div className="schedule-info">
                                                        <div className="info-row">
                                                            <MapPin size={16} />
                                                            <span>{schedule.location}</span>
                                                        </div>
                                                        <div className="info-row">
                                                            <Clock size={16} />
                                                            <span>{schedule.timeSlot}</span>
                                                        </div>
                                                    </div>
                                                    <div className="schedule-role">{schedule.role}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="no-schedule">
                                        <CalendarIcon size={48} />
                                        <p>No upcoming schedule</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
