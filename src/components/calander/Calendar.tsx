import React, { useState, useCallback } from "react";
import {
  Calendar as BigCalendar,
  momentLocalizer,
  type View,
} from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./Calendar.css";

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

interface CalendarProps {
  activities?: Activity[];
  userRole?: 'manager' | 'staff' | 'driver' | 'admin';
  onSelectSchedule?: (schedule: any) => void;
  onAddClick?: () => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date; view: View }) => void;
}

const Calendar: React.FC<CalendarProps> = ({
  activities: externalActivities,
  userRole = 'admin',
  onSelectSchedule,
  onAddClick,
  onSelectSlot,
}) => {
  // Determine permissions based on userRole
  const canManage = userRole === 'manager';
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState(new Date());

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
    if (onSelectSchedule && externalActivities) {
      onSelectSchedule(event);
    }
  }, [externalActivities, onSelectSchedule]);

  // Handle add event button
  const handleAddEvent = () => {
    if (onAddClick) {
      onAddClick();
    }
  };

  // Handle slot selection (clicking on empty time slot)
  const handleSelectSlot = useCallback(
    (slotInfo: { start: Date; end: Date }) => {
      if (onSelectSlot) {
        onSelectSlot({ start: slotInfo.start, end: slotInfo.end, view });
      }
    },
    [view, onSelectSlot]
  );


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
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
                view === "month"
                  ? "bg-blue-50 text-blue-600 border-blue-500"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
              }`}
              onClick={() => toolbar.onView("month")}
            >
              Month view
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
                view === "week"
                  ? "bg-blue-50 text-blue-600 border-blue-500"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
              }`}
              onClick={() => toolbar.onView("week")}
            >
              Week view
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
                view === "agenda"
                  ? "bg-blue-50 text-blue-600 border-blue-500"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
              }`}
              onClick={() => toolbar.onView("agenda")}
            >
              Agenda
            </button>
          </div>
          {canManage && (
            <button
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium text-sm"
              onClick={handleAddEvent}
            >
              + Add schedule
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full rounded-2xl bg-gray-50 relative">
      <div className="flex-1 overflow-hidden">
        <BigCalendar
          localizer={localizer}
          events={externalActivities || []}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={setView}
          views={["month", "week", "agenda"]}
          date={date}
          onNavigate={setDate}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable={true}
          eventPropGetter={eventStyleGetter}
          components={{
            toolbar: CustomToolbar,
          }}
          style={{ height: "calc(100vh - 100px)" }}
        />
      </div>
    </div>
  );
};

export default Calendar;
