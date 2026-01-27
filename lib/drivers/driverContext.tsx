"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { DriverUser } from "./types";

const STORAGE_KEY = "selectedDriver";

interface DriverContextType {
  selectedDriver: DriverUser | null;
  setSelectedDriver: (driver: DriverUser | null) => void;
  clearSelectedDriver: () => void;
  isLoading: boolean;
}

const DriverContext = createContext<DriverContextType | undefined>(undefined);

export function DriverProvider({ children }: { children: ReactNode }) {
  const [selectedDriver, setSelectedDriverState] = useState<DriverUser | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSelectedDriverState(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load selected driver:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setSelectedDriver = (driver: DriverUser | null) => {
    setSelectedDriverState(driver);
    if (driver) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(driver));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const clearSelectedDriver = () => {
    setSelectedDriverState(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <DriverContext.Provider
      value={{
        selectedDriver,
        setSelectedDriver,
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
