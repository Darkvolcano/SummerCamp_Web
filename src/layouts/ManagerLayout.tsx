import { useState } from "react";
import ManagerSidebar from "../components/Sidebar/Manager/ManagerSidebar";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        {children}
      </main>
    </div>
  );
}
