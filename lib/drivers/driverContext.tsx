"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
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
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSelectedDriverNameState(stored);
      }
    } catch (error) {
      console.error("Failed to load selected driver:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
