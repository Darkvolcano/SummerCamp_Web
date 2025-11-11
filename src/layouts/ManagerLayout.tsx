import { useState } from "react";
import { Outlet } from "react-router-dom";
import ManagerSidebar from "../components/Sidebar/Manager/ManagerSidebar";
import { ManagerContext } from "../contexts/ManagerContext";

export default function ManagerLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedCampId, setSelectedCampId] = useState<number | null>(null);

  return (
    <ManagerContext.Provider value={{ selectedCampId, setSelectedCampId }}>
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
    </ManagerContext.Provider>
  );
}
