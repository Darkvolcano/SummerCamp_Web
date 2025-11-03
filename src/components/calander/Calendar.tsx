import React, { useState, useCallback } from "react";
import {
  Calendar as BigCalendar,
  momentLocalizer,
  type View,
  type SlotInfo,
} from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./Calendar.css";
import ActivityForm from "./ActivityForm";
import ActivityDetail from "./ActivityDetail";

moment.locale("vi");
const localizer = momentLocalizer(moment);

export interface Activity {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: "Core" | "Core-Optional" | "Optional";
  description?: string;
  location?: string;
  participants?: number;
}

const Calendar: React.FC = () => {
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState(new Date());
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [showActivityDetail, setShowActivityDetail] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [formInitialDate, setFormInitialDate] = useState<{
    start: Date;
    end: Date;
  } | null>(null);

  // Mock activities data
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: "1",
      title: "Product demo",
      start: new Date(2025, 0, 10, 13, 30),
      end: new Date(2025, 0, 10, 15, 30),
      type: "Core",
      description: "Product demo for the new dashboard and Q&A session",
      location: "Zoom Meeting",
      participants: 6,
    },
    {
      id: "2",
      title: "Team Building",
      start: new Date(2025, 0, 15, 9, 0),
      end: new Date(2025, 0, 15, 17, 0),
      type: "Core-Optional",
      description: "Outdoor team building activities",
      location: "Camp Ground A",
      participants: 25,
    },
    {
      id: "3",
      title: "Art Workshop",
      start: new Date(2025, 0, 20, 14, 0),
      end: new Date(2025, 0, 20, 16, 0),
      type: "Optional",
      description: "Creative arts and crafts session",
      location: "Art Room",
      participants: 15,
    },
  ]);

  // Event style getter
  const eventStyleGetter = (event: Activity) => {
    let backgroundColor = "#3b82f6"; // Core - Blue
    if (event.type === "Core-Optional") {
      backgroundColor = "#10b981"; // Core-Optional - Green
    } else if (event.type === "Optional") {
      backgroundColor = "#f59e0b"; // Optional - Yellow/Orange
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.9,
        color: "white",
        border: "none",
        display: "block",
      },
    };
  };

  // Handle select event
  const handleSelectEvent = useCallback((event: Activity) => {
    setSelectedActivity(event);
    setShowActivityDetail(true);
    setShowActivityForm(false);
  }, []);

  // Handle select slot
  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    setFormInitialDate({
      start: slotInfo.start,
      end: slotInfo.end,
    });
    setShowActivityForm(true);
    setShowActivityDetail(false);
    setSelectedActivity(null);
  }, []);

  // Handle add event button
  const handleAddEvent = () => {
    const now = new Date();
    setFormInitialDate({
      start: now,
      end: new Date(now.getTime() + 2 * 60 * 60 * 1000), // +2 hours
    });
    setShowActivityForm(true);
    setShowActivityDetail(false);
    setSelectedActivity(null);
  };

  // Handle save activity
  const handleSaveActivity = (activity: Activity) => {
    if (selectedActivity) {
      // Update existing
      setActivities((prev) =>
        prev.map((a) => (a.id === activity.id ? activity : a))
      );
    } else {
      // Add new
      setActivities((prev) => [
        ...prev,
        { ...activity, id: Date.now().toString() },
      ]);
    }
    setShowActivityForm(false);
  };

  // Handle delete activity
  const handleDeleteActivity = (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
    setShowActivityDetail(false);
  };

  // Handle edit activity
  const handleEditActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setFormInitialDate({
      start: activity.start,
      end: activity.end,
    });
    setShowActivityDetail(false);
    setShowActivityForm(true);
  };

  // Custom toolbar
  const CustomToolbar = (toolbar: any) => {
    const goToBack = () => {
      toolbar.onNavigate("PREV");
    };

    const goToNext = () => {
      toolbar.onNavigate("NEXT");
    };

    const goToToday = () => {
      toolbar.onNavigate("TODAY");
    };

    const label = () => {
      const date = moment(toolbar.date);
      return (
        <span className="toolbar-label">
          {date.format("MMMM YYYY")}{" "}
          <span className="week-label">Week {date.week()}</span>
        </span>
      );
    };

    return (
      <div className="custom-toolbar">
        <div className="toolbar-left">
          <div className="toolbar-date-section">
            <span className="toolbar-month">
              {moment(toolbar.date).format("MMM")}
            </span>
            <span className="toolbar-day">
              {moment(toolbar.date).format("DD")}
            </span>
          </div>
          {label()}
        </div>

        <div className="toolbar-center">
          <button onClick={goToBack} className="toolbar-nav-btn">
            ←
          </button>
          <button onClick={goToToday} className="toolbar-today-btn">
            Today
          </button>
          <button onClick={goToNext} className="toolbar-nav-btn">
            →
          </button>
        </div>

        <div className="toolbar-right">
          <div className="view-switcher">
            <button
              className={view === "month" ? "active" : ""}
              onClick={() => setView("month")}
            >
              Month view
            </button>
            <button
              className={view === "week" ? "active" : ""}
              onClick={() => setView("week")}
            >
              Week view
            </button>
            <button
              className={view === "agenda" ? "active" : ""}
              onClick={() => setView("agenda")}
            >
              Agenda
            </button>
          </div>
          <button className="add-event-btn" onClick={handleAddEvent}>
            + Add event
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-container">
      <div className="calendar-main">
        <BigCalendar
          localizer={localizer}
          events={activities}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          eventPropGetter={eventStyleGetter}
          components={{
            toolbar: CustomToolbar,
          }}
          style={{ height: "calc(100vh - 100px)" }}
        />
      </div>

      {/* Activity Detail Sidebar */}
      {showActivityDetail && selectedActivity && (
        <ActivityDetail
          activity={selectedActivity}
          onClose={() => setShowActivityDetail(false)}
          onEdit={handleEditActivity}
          onDelete={handleDeleteActivity}
        />
      )}

      {/* Activity Form Sidebar */}
      {showActivityForm && (
        <ActivityForm
          activity={selectedActivity}
          initialDate={formInitialDate}
          onClose={() => setShowActivityForm(false)}
          onSave={handleSaveActivity}
        />
      )}
    </div>
  );
};

export default Calendar;
