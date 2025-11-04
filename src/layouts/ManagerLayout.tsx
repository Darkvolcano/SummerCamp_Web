import { useState } from "react";
import { Outlet } from "react-router-dom";
import ManagerSidebar from "../components/Sidebar/Manager/ManagerSidebar";

export default function ManagerLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
      <ManagerSidebar onCollapsedChange={setIsSidebarCollapsed} />
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
