import { useState } from "react";
import { Outlet } from "react-router-dom";
import DriverSidebar from "../components/sidebar/Driver/DriverSidebar";

export default function DriverLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
      <DriverSidebar onCollapsedChange={setIsSidebarCollapsed} />
      <main
        className="flex-1 transition-all duration-300"
        style={{
          backgroundColor: "#EDF0FB",
          marginLeft: isSidebarCollapsed ? "80px" : "280px",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
