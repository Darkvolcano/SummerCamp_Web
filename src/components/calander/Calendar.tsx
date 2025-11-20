import React, { useState, useCallback, useEffect } from "react";
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
  type: "Core" | "Core-Optional" | "Optional" | "Resting" | "CheckIn" | "CheckOut";
  description?: string;
  location?: string;
  participants?: number;
}

export interface CampInfo {
  campId: number;
  name: string;
  startDate: string;
  endDate: string;
}

interface CalendarProps {
  activities?: Activity[];
  campInfo?: CampInfo;
  userRole?: 'manager' | 'staff' | 'driver' | 'admin';
  onSelectSchedule?: (schedule: any) => void;
  onAddClick?: () => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date; view: View }) => void;
}

const Calendar: React.FC<CalendarProps> = ({
  activities: externalActivities,
  campInfo,
  userRole = 'admin',
  onSelectSchedule,
  onAddClick,
  onSelectSlot,
}) => {
  // Determine permissions based on userRole
  const canManage = userRole === 'manager';
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState(new Date());

  // Jump to camp start
  useEffect(() => {
    if (campInfo) {
      setDate(moment(campInfo.startDate).toDate());
    }
  }, [campInfo]);

  // Event style
  const eventStyleGetter = (event: Activity) => {
    let backgroundColor = "#3b82f6"; // Core - Blue
    switch (event.type) {
      case "Core-Optional":
        backgroundColor = "#10b981"; // Core-Optional - Green
        break;
      case "Optional":
        backgroundColor = "#f59e0b"; // Optional - Yellow/Orange
        break;
      case "Resting":
        backgroundColor = "#8b5cf6"; // Resting - Purple
        break;
      case "CheckIn":
        backgroundColor = "#10b981"; // CheckIn - Green
        break;
      case "CheckOut":
        backgroundColor = "#ef4444"; // CheckOut - Red
        break;
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

  // Get camp date range style
  const dayStyleGetter = (date: Date) => {
    const today = moment().startOf('day');
    const currentDate = moment(date).startOf('day');

    const style: any = {};

    if (currentDate.isSame(today)) {
      style.fontWeight = 'bold';
    }

    if (campInfo) {
      const campStart = moment(campInfo.startDate).startOf('day');
      const campEnd = moment(campInfo.endDate).startOf('day');

      if (currentDate.isSameOrAfter(campStart) && currentDate.isSameOrBefore(campEnd)) {
        style.backgroundColor = '#f0f9ff'; // bg-blue-50
      }
    }

    return { style };
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
      // Update toolbar date to selected date
      setDate(slotInfo.start);
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
          dayPropGetter={dayStyleGetter}
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
