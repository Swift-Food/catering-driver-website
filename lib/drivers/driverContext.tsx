"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

const STORAGE_KEY = "selectedDriverName";

interface DriverContextType {
  selectedDriverName: string | null;
  setSelectedDriverName: (name: string | null) => void;
  clearSelectedDriver: () => void;
  isLoading: boolean;
}

const DriverContext = createContext<DriverContextType | undefined>(undefined);

export function DriverProvider({ children }: { children: ReactNode }) {
  const [selectedDriverName, setSelectedDriverNameState] = useState<
    string | null
  >(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem(STORAGE_KEY);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [isLoading] = useState(false);

  const setSelectedDriverName = (name: string | null) => {
    setSelectedDriverNameState(name);
    if (name) {
      localStorage.setItem(STORAGE_KEY, name);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const clearSelectedDriver = () => {
    setSelectedDriverNameState(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <DriverContext.Provider
      value={{
        selectedDriverName,
        setSelectedDriverName,
        clearSelectedDriver,
        isLoading,
      }}
    >
      {children}
    </DriverContext.Provider>
  );
}

export function useDriver() {
  const context = useContext(DriverContext);
  if (context === undefined) {
    throw new Error("useDriver must be used within a DriverProvider");
  }
  return context;
}
