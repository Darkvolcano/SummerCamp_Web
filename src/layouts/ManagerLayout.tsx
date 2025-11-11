import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import ManagerSidebar from "../components/sidebar/Manager/ManagerSidebar";
import { ManagerContext, getSelectedCampId, saveSelectedCampId, type Camp } from "../contexts/ManagerContext";
import { useAuthStore } from "../services/userService";
import campStaffService from "../services/campStaffService";

export default function ManagerLayout() {
  const { user } = useAuthStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedCampId, setSelectedCampIdState] = useState<number | null>(getSelectedCampId());
  const [camps, setCamps] = useState<Camp[]>([]);
  const [isLoadingCamps, setIsLoadingCamps] = useState(false);

  // Fetch camps on mount (cached in context, not in sidebar)
  useEffect(() => {
    const fetchCamps = async () => {
      if (!user?.id) return;

      try {
        setIsLoadingCamps(true);
        const data = await campStaffService.getCampsByStaff(user.id);

        const campList = data.map((item) => ({
          id: item.camp.campId,
          name: item.camp.name,
        }));

        setCamps(campList);
      } catch (error) {
        console.error("[ManagerLayout] Failed to load camps:", error);
      } finally {
        setIsLoadingCamps(false);
      }
    };

    fetchCamps();
  }, [user?.id]);

  // Wrapper function to save to localStorage when camp ID changes
  const setSelectedCampId = (id: number | null) => {
    setSelectedCampIdState(id);
    saveSelectedCampId(id);
  };

  return (
    <ManagerContext.Provider value={{ selectedCampId, setSelectedCampId, camps, isLoadingCamps }}>
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
