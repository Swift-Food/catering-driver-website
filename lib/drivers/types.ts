// ============================================================
// ENUMS
// ============================================================

export enum CateringDeliveryMethod {
  E_BIKE = "e_bike",
  E_BIKE_TRAILER = "e_bike_trailer",
  UBER = "uber",
  MINI_VAN = "mini_van",
  TRUCK = "truck",
}

export enum DriverStatus {
  AVAILABLE = "available",
  UNAVAILABLE = "unavailable",
  OCCUPIED = "occupied",
}

export enum UserRole {
  CUSTOMER = "customer",
  RESTAURANT_OWNER = "restaurant_owner",
  DRIVER = "driver",
  ADMIN = "admin",
  CORPORATE_EMPLOYEE = "corporate_employee",
  CORPORATE_ADMIN = "corporate_admin",
  CORPORATE_MANAGER = "corporate_manager",
  EVENT_ORGANIZER = "event_organizer",
  EVENT_ATTENDEE = "event_attendee",
}

// ============================================================
// CONSTANTS
// ============================================================

export const DELIVERY_METHOD_CAPACITY: Record<CateringDeliveryMethod, number> =
  {
    [CateringDeliveryMethod.E_BIKE]: 30,
    [CateringDeliveryMethod.E_BIKE_TRAILER]: 60,
    [CateringDeliveryMethod.UBER]: 175,
    [CateringDeliveryMethod.MINI_VAN]: 500,
    [CateringDeliveryMethod.TRUCK]: 999999,
  };

// ============================================================
// TYPES
// ============================================================

export interface Location {
  latitude: number;
  longitude: number;
}

export interface Address {
  userId: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  flat?: string;
  city: string;
  zipcode: string;
  placeId?: string;
  location: Location;
}

export interface DriverPaymentMethod {
  id: string;
  type: "bank_account";
  isDefault: boolean;
  accountNumber?: string;
  bankName?: string;
  bankcode?: string;
  accountHolderName?: string;
  address?: Address;
}

export interface User {
  id: string;
  verified: boolean;
  email: string;
  phoneNumber: string | null;
  username: string | null;
  profilePicture: string | null;
  isGoogleUser: boolean;
  googleId: string | null;
  isAppleUser: boolean;
  appleId: string | null;
  oauthProviders: string[] | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  tokens: string | null;
}

export interface DriverUser {
  id: string;
  user: User;
  status: DriverStatus;
  currentLocation: Location | null;
  rating: number;
  points: number;
  completedOrders: string[];
  failedOrders: string[];
  deviceToken: string;
  paymentMethods: DriverPaymentMethod[];
  stripeAccountId: string | null;
  stripeOnboardingComplete: boolean;
  availableBalance: number;
  lastPayoutDate: string | null;

  // Catering fields
  cateringDeliveryMethods: CateringDeliveryMethod[] | null;
  cateringEnabled: boolean;
  completedCateringDeliveries: string[];
  cateringRating: number;
}

// ============================================================
// CATERING DRIVER DTOs
// ============================================================

export interface AcceptMealSessionDto {
  driverId: string;
  driverName: string;
  deliveryMethod: CateringDeliveryMethod;
}

export interface PickupCompleteDto {
  driverId: string;
  pickupProofImageUrl: string;
  notes?: string;
}

export interface DeliveryCompleteDto {
  driverId: string;
  deliveryProofImageUrl: string;
  notes?: string;
}
