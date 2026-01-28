import { apiClient } from "@/lib/auth";
import type {
  DriverUser,
  AcceptMealSessionDto,
  PickupCompleteDto,
  DeliveryCompleteDto,
} from "./types";

export const driversApi = {
  getAvailableDrivers: async (): Promise<DriverUser[]> => {
    const response = await apiClient.get<DriverUser[]>(
      "/driver-user/catering/enabled"
    );
    return response.data;
  },
};

export const cateringDriverApi = {
  /** Get all meal sessions available for pickup (FINDING_DRIVER status) */
  getAvailableSessions: async () => {
    const response = await apiClient.get("/catering-driver/available-sessions");
    return response.data;
  },

  /** Accept a meal session with a delivery method */
  acceptMealSession: async (
    mealSessionId: string,
    dto: AcceptMealSessionDto
  ) => {
    const response = await apiClient.post(
      `/catering-driver/accept/${mealSessionId}`,
      dto
    );
    return response.data;
  },

  /** Get driver's current catering assignments */
  getMyAssignments: async (driverName?: string) => {
    const params = driverName ? { driverName } : undefined;
    const response = await apiClient.get("/catering-driver/my-assignments", {
      params,
    });
    return response.data;
  },

  /** Start delivery (heading to restaurants) */
  startDelivery: async (mealSessionId: string) => {
    const response = await apiClient.post(
      `/catering-driver/${mealSessionId}/start-delivery`
    );
    return response.data;
  },

  /** Confirm pickup with photo proof */
  pickupComplete: async (mealSessionId: string, dto: PickupCompleteDto) => {
    const response = await apiClient.post(
      `/catering-driver/${mealSessionId}/pickup-complete`,
      dto
    );
    return response.data;
  },

  /** Mark arrival at delivery destination */
  arriveAtDestination: async (mealSessionId: string) => {
    const response = await apiClient.post(
      `/catering-driver/${mealSessionId}/arrive`
    );
    return response.data;
  },

  /** Confirm delivery with photo proof */
  deliveryComplete: async (
    mealSessionId: string,
    dto: DeliveryCompleteDto
  ) => {
    const response = await apiClient.post(
      `/catering-driver/${mealSessionId}/delivery-complete`,
      dto
    );
    return response.data;
  },

  /** Get collection route for meal session */
  getCollectionRoute: async (mealSessionId: string) => {
    const response = await apiClient.get(
      `/catering-driver/${mealSessionId}/route`
    );
    return response.data;
  },

  /** Get all driver names with active (non-delivered) orders */
  getActiveDriverNames: async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>(
      "/catering-driver/active-driver-names"
    );
    return response.data;
  },

  /** Track delivery status (public endpoint for customers) */
  trackDelivery: async (mealSessionId: string) => {
    const response = await apiClient.get(
      `/catering-driver/track/${mealSessionId}`
    );
    return response.data;
  },
};
