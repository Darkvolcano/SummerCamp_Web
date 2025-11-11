import { createContext } from "react";

export interface Camp {
  id: number;
  name: string;
}

export const ManagerContext = createContext<{
  selectedCampId: number | null;
  setSelectedCampId: (id: number | null) => void;
  camps: Camp[];
  isLoadingCamps: boolean;
} | null>(null);

// Utility functions for localStorage
export const saveSelectedCampId = (campId: number | null) => {
  if (campId === null) {
    localStorage.removeItem("selectedCampId");
  } else {
    localStorage.setItem("selectedCampId", campId.toString());
  }
};

export const getSelectedCampId = (): number | null => {
  const saved = localStorage.getItem("selectedCampId");
  return saved ? parseInt(saved, 10) : null;
};
