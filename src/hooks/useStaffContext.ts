import { useContext } from "react";
import { StaffContext } from "../contexts/StaffContext";

export const useStaffContext = () => {
  const context = useContext(StaffContext);
  
  if (!context) {
    throw new Error("useStaffContext must be used within a StaffProvider");
  }
  
  return context;
};
