import { apiClient } from "@/lib/auth";
import type {
  DriverUser,
  DriverMealSessionDto,
  DeliveryAnalyticsDto,
  CollectionRouteDto,
  DeliveryTrackingDto,
  AcceptMealSessionDto,
  PickupCompleteDto,
  DeliveryCompleteDto,
  UpdateDriverNameDto,
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
  getAvailableSessions: async (): Promise<DriverMealSessionDto[]> => {
    const response = await apiClient.get<DriverMealSessionDto[]>(
      "/catering-driver/available-sessions"
    );
    return response.data;
  },

  /** Accept a meal session with a driver name */
  acceptMealSession: async (
    mealSessionId: string,
    dto: AcceptMealSessionDto
  ): Promise<DriverMealSessionDto> => {
    const response = await apiClient.post<DriverMealSessionDto>(
      `/catering-driver/accept/${mealSessionId}`,
      dto
    );
    return response.data;
  },

  /** Get driver's current catering assignments */
  getMyAssignments: async (driverName?: string): Promise<DriverMealSessionDto[]> => {
    const params = driverName ? { driverName } : undefined;
    const response = await apiClient.get<DriverMealSessionDto[]>(
      "/catering-driver/my-assignments",
      { params }
    );
    return response.data;
  },

  /** Start delivery (heading to restaurants) */
  startDelivery: async (mealSessionId: string): Promise<DriverMealSessionDto> => {
    const response = await apiClient.post<DriverMealSessionDto>(
      `/catering-driver/${mealSessionId}/start-delivery`
    );
    return response.data;
  },

  /** Confirm pickup with photo proof */
  pickupComplete: async (
    mealSessionId: string,
    dto: PickupCompleteDto
  ): Promise<DriverMealSessionDto> => {
    const response = await apiClient.post<DriverMealSessionDto>(
      `/catering-driver/${mealSessionId}/pickup-complete`,
      dto
    );
    return response.data;
  },

  /** Mark arrival at delivery destination */
  arriveAtDestination: async (
    mealSessionId: string
  ): Promise<DriverMealSessionDto> => {
    const response = await apiClient.post<DriverMealSessionDto>(
      `/catering-driver/${mealSessionId}/arrive`
    );
    return response.data;
  },

  /** Confirm delivery with photo proof */
  deliveryComplete: async (
    mealSessionId: string,
    dto: DeliveryCompleteDto
  ): Promise<DriverMealSessionDto> => {
    const response = await apiClient.post<DriverMealSessionDto>(
      `/catering-driver/${mealSessionId}/delivery-complete`,
      dto
    );
    return response.data;
  },

  /** Get collection route for meal session */
  getCollectionRoute: async (
    mealSessionId: string
  ): Promise<CollectionRouteDto> => {
    const response = await apiClient.get<CollectionRouteDto>(
      `/catering-driver/${mealSessionId}/route`
    );
    return response.data;
  },

  /** Get delivery analytics (pending, active, completed counts) */
  getAnalytics: async (): Promise<DeliveryAnalyticsDto> => {
    const response = await apiClient.get<DeliveryAnalyticsDto>(
      "/catering-driver/analytics"
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
  trackDelivery: async (
    mealSessionId: string
  ): Promise<DeliveryTrackingDto> => {
    const response = await apiClient.get<DeliveryTrackingDto>(
      `/catering-driver/track/${mealSessionId}`
    );
    return response.data;
  },

  /** Update the driver name on an assigned meal session */
  updateDriverName: async (
    mealSessionId: string,
    dto: UpdateDriverNameDto
  ): Promise<DriverMealSessionDto> => {
    const response = await apiClient.post<DriverMealSessionDto>(
      `/catering-driver/${mealSessionId}/update-driver-name`,
      dto
    );
    return response.data;
  },

  /** Get all meal sessions currently assigned to drivers */
  getAssignedSessions: async (): Promise<DriverMealSessionDto[]> => {
    const response = await apiClient.get<DriverMealSessionDto[]>(
      "/catering-driver/assigned-sessions"
    );
    return response.data;
  },

  /** Upload an image and return the URL */
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("upload", file);
    const response = await apiClient.post<string>("/image-upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};
