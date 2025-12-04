import React, { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import staffService, { type StaffCampResponseDto } from "../services/staffService";

interface CampOption {
  id: number;
  name: string;
}

interface StaffContextValue {
  selectedCampId: number | null;
  setSelectedCampId: (campId: number | null) => void;
  camps: CampOption[];
  isLoadingCamps: boolean;
}

export const StaffContext = createContext<StaffContextValue | undefined>(undefined);

interface StaffProviderProps {
  children: ReactNode;
}

export const StaffProvider: React.FC<StaffProviderProps> = ({ children }) => {
  const [selectedCampId, setSelectedCampIdState] = useState<number | null>(null);
  const [camps, setCamps] = useState<CampOption[]>([]);
  const [isLoadingCamps, setIsLoadingCamps] = useState(false);

  useEffect(() => {
    const fetchStaffCamps = async () => {
      try {
        setIsLoadingCamps(true);
        const campData = await staffService.getStaffCamps();
        
        const campOptions: CampOption[] = campData.map((camp: StaffCampResponseDto) => ({
          id: camp.campId,
          name: camp.name,
        }));

        setCamps(campOptions);

        const savedCampId = localStorage.getItem("staffSelectedCampId");
        if (savedCampId) {
          const campId = parseInt(savedCampId, 10);
          const campExists = campOptions.some(c => c.id === campId);
          if (campExists) {
            setSelectedCampIdState(campId);
            console.log("[StaffContext] Restored camp from localStorage:", campId);
          } else {
            // Saved camp doesn't exist, auto-select first
            if (campOptions.length > 0) {
              const firstCamp = campOptions[0];
              setSelectedCampIdState(firstCamp.id);
              localStorage.setItem("staffSelectedCampId", firstCamp.id.toString());
              localStorage.setItem("staffSelectedCampName", firstCamp.name);
              console.log("[StaffContext] Auto-selected first camp:", firstCamp.name);
            }
          }
        } else {
          // No saved camp, auto-select first
          if (campOptions.length > 0) {
            const firstCamp = campOptions[0];
            setSelectedCampIdState(firstCamp.id);
            localStorage.setItem("staffSelectedCampId", firstCamp.id.toString());
            localStorage.setItem("staffSelectedCampName", firstCamp.name);
            console.log("[StaffContext] Auto-selected first camp:", firstCamp.name);
          }
        }
      } catch (error) {
        console.error("[StaffContext] Failed to fetch staff camps:", error);
        setCamps([]);
      } finally {
        setIsLoadingCamps(false);
      }
    };

    fetchStaffCamps();
  }, []);

  const setSelectedCampId = (campId: number | null) => {
    console.log("[StaffContext] setSelectedCampId called with:", campId);
    setSelectedCampIdState(campId);
    
    if (campId !== null) {
      localStorage.setItem("staffSelectedCampId", campId.toString());
      console.log("[StaffContext] Saved camp ID to localStorage:", campId);
    } else {
      localStorage.removeItem("staffSelectedCampId");
      localStorage.removeItem("staffSelectedCampName");
      console.log("[StaffContext] Cleared camp from localStorage");
    }
  };

  const value: StaffContextValue = {
    selectedCampId,
    setSelectedCampId,
    camps,
    isLoadingCamps,
  };

  return <StaffContext.Provider value={value}>{children}</StaffContext.Provider>;
};
