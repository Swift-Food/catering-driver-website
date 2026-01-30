"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

const STORAGE_KEY = "selectedDriverName";

interface PendingAction {
  action: () => void;
  message: string;
}

interface DriverContextType {
  selectedDriverName: string | null;
  setSelectedDriverName: (name: string | null) => void;
  clearSelectedDriver: () => void;
  isLoading: boolean;
  // Pending photos warning system
  hasPendingPhotos: boolean;
  setHasPendingPhotos: (value: boolean) => void;
  // For confirmation dialog
  pendingAction: PendingAction | null;
  confirmPendingAction: () => void;
  cancelPendingAction: () => void;
  // Guarded navigation
  requestNavigation: (href: string, navigate: () => void) => void;
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
  const [hasPendingPhotos, setHasPendingPhotos] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const confirmPendingAction = useCallback(() => {
    if (pendingAction) {
      setHasPendingPhotos(false);
      pendingAction.action();
      setPendingAction(null);
    }
  }, [pendingAction]);

  const cancelPendingAction = useCallback(() => {
    setPendingAction(null);
  }, []);

  const setSelectedDriverName = useCallback(
    (name: string | null) => {
      const doSwitch = () => {
        setSelectedDriverNameState(name);
        if (name) {
          localStorage.setItem(STORAGE_KEY, name);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      };

      if (hasPendingPhotos) {
        setPendingAction({
          action: doSwitch,
          message: "You have uploaded photos that haven't been confirmed. If you switch drivers, these photos will be lost.",
        });
      } else {
        doSwitch();
      }
    },
    [hasPendingPhotos]
  );

  const clearSelectedDriver = useCallback(() => {
    const doClear = () => {
      setSelectedDriverNameState(null);
      localStorage.removeItem(STORAGE_KEY);
    };

    if (hasPendingPhotos) {
      setPendingAction({
        action: doClear,
        message: "You have uploaded photos that haven't been confirmed. If you leave, these photos will be lost.",
      });
    } else {
      doClear();
    }
  }, [hasPendingPhotos]);

  const requestNavigation = useCallback(
    (href: string, navigate: () => void) => {
      if (hasPendingPhotos) {
        setPendingAction({
          action: navigate,
          message: "You have uploaded photos that haven't been confirmed. If you navigate away, these photos will be lost.",
        });
      } else {
        navigate();
      }
    },
    [hasPendingPhotos]
  );

  return (
    <DriverContext.Provider
      value={{
        selectedDriverName,
        setSelectedDriverName,
        clearSelectedDriver,
        isLoading,
        hasPendingPhotos,
        setHasPendingPhotos,
        pendingAction,
        confirmPendingAction,
        cancelPendingAction,
        requestNavigation,
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
