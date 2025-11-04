import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/Sidebar/Admin/AdminSidebar";

export default function AdminLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar onCollapsedChange={setIsSidebarCollapsed} />
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
