import { createContext } from "react";

export const ManagerContext = createContext<{
  selectedCampId: number | null;
  setSelectedCampId: (id: number | null) => void;
} | null>(null);
