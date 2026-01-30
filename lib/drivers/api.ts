import { apiClient } from "@/lib/auth";
import type {
  DriverUser,
  DriverMealSessionDto,
  DeliveryAnalyticsDto,
  CollectionRouteDto,
  DeliveryTrackingDto,
  AcceptMealSessionDto,
  CollectRestaurantDto,
  ConfirmDriverDeliveryDto,
  UpdateDriverNameDto,
  SetDestinationDto,
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
    console.log(response)
    return response.data;
  },

  /** Start delivery (heading to restaurants) */
  startDelivery: async (mealSessionId: string): Promise<DriverMealSessionDto> => {
    const response = await apiClient.post<DriverMealSessionDto>(
      `/catering-driver/${mealSessionId}/start-delivery`
    );
    return response.data;
  },

  /** MULTI-DRIVER: Collect from a specific restaurant with photo proof */
  collectRestaurant: async (
    mealSessionId: string,
    dto: CollectRestaurantDto
  ): Promise<DriverMealSessionDto> => {
    const response = await apiClient.post<DriverMealSessionDto>(
      `/catering-driver/${mealSessionId}/collect-restaurant`,
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

  /** MULTI-DRIVER: Confirm delivery with photo proof (per driver) */
  confirmDriverDelivery: async (
    mealSessionId: string,
    dto: ConfirmDriverDeliveryDto
  ): Promise<DriverMealSessionDto> => {
    const response = await apiClient.post<DriverMealSessionDto>(
      `/catering-driver/${mealSessionId}/confirm-delivery`,
      dto
    );
    return response.data;
  },

  /** Leave a session (before delivery starts) */
  leaveSession: async (mealSessionId: string): Promise<void> => {
    await apiClient.post(`/catering-driver/${mealSessionId}/leave`);
  },

  /** Set driver's current destination (where they're heading) */
  setDestination: async (
    mealSessionId: string,
    dto: SetDestinationDto
  ): Promise<void> => {
    await apiClient.post(
      `/catering-driver/${mealSessionId}/set-destination`,
      dto
    );
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
    console.log("Update driver request:", { mealSessionId, dto });
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
    console.log("Upcoming response:", response.data);
    return response.data;
  },
  /** Get completed orders for a specific driver */
  getCompletedSessions: async (): Promise<DriverMealSessionDto[]> => {
    const response = await apiClient.get<DriverMealSessionDto[]>(
      `/catering-driver/completed`
    );
    console.log("Completed sessions:", response)
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
