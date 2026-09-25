import { useContext } from "react";
import AppContext from "./appContextValue";

export function useApp() {
  const context = useContext(AppContext);
  // Fail fast if a component reads app state outside of AppProvider
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
