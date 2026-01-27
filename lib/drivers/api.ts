import { apiClient } from "@/lib/auth";
import type { DriverUser } from "./types";

export const driversApi = {
  getAvailableDrivers: async (): Promise<DriverUser[]> => {
    const response = await apiClient.get<DriverUser[]>(
      "/driver-user/catering/enabled"
    );
    return response.data;
  },
};
