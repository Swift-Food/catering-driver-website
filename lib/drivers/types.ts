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

export enum MealSessionDeliveryStatus {
  PENDING = "pending",
  FINDING_DRIVER = "finding_driver",
  DRIVER_ASSIGNED = "driver_assigned",
  AWAITING_PICKUP = "awaiting_pickup",
  OUT_FOR_DELIVERY = "out_for_delivery",
  AT_COLLECTION_POINT = "at_collection_point",
  DELIVERED = "delivered",
}

export enum CateringOrderStatus {
  PENDING_REVIEW = "pending_review",
  ADMIN_REVIEWED = "admin_reviewed",
  RESTAURANT_REVIEWED = "restaurant_reviewed",
  PAYMENT_LINK_SENT = "payment_link_sent",
  PAID = "paid",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
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

  // Driver names for catering assignments
  driverNames: string[] | null;

  // Catering fields
  cateringDeliveryMethods: CateringDeliveryMethod[] | null;
  cateringEnabled: boolean;
  completedCateringDeliveries: string[];
  cateringRating: number;
}

// ============================================================
// MEAL SESSION & CATERING ORDER
// ============================================================

export interface PricingAddonDto {
  addonId: string;
  name: string;
  customerUnitPrice: number;
  quantity: number;
  groupTitle?: string;
  dietaryRestrictions?: string[];
  allergens?: string[];
}

export interface PricingMenuItemDto {
  menuItemId: string;
  menuItemName: string;
  menuItemImage?: string;
  description?: string;
  quantity: number;
  customerUnitPrice: number;
  customerTotalPrice: number;
  restaurantBaseUnitPrice: number;
  restaurantBaseTotalPrice: number;
  commissionRate: number;
  commissionAmount: number;
  restaurantNetAmount: number;
  isDiscounted: boolean;
  originalUnitPrice?: number;
  discountAmount?: number;
  cateringQuantityUnit?: number;
  deliveryPortionSize?: number;
  totalDeliveryPortions?: number;
  feedsPerUnit?: number;
  groupTitle?: string;
  categoryName?: string;
  subcategoryName?: string;
  selectedAddons?: PricingAddonDto[];
}

export interface PricingOrderItemDto {
  restaurantId: string;
  restaurantName: string;
  status: string;
  specialInstructions?: string;
  collectionTime?: string;
  reminderConfirmed?: boolean;
  reminderConfirmedAt?: string;
  menuItems: PricingMenuItemDto[];
  customerTotal: number;
  restaurantGrossAmount: number;
  restaurantCommissionTotal: number;
  restaurantNetAmount: number;
  totalDeliveryPortions?: number;
}

export interface RestaurantPickupAddress {
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  zipcode: string;
  location: Location;
}

export interface AppliedPromotion {
  id: string;
  name: string;
  type: string;
  discountAmount: number;
}

export interface CateringOrder {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  organization?: string;
  publicNote?: string;
  internalNote?: string;
  ccEmails: string[];
  billingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    postalCode: string;
    country: string;
  };
  eventDate: string;
  eventTime: string;
  collectionTime?: string;
  guestCount?: number;
  eventType?: string;
  deliveryAddress: string;
  deliveryLocation?: Location;
  specialRequirements?: string;
  orderItems: PricingOrderItemDto[];
  restaurantReviews?: string[];
  restaurantRejections?: string[];
  estimatedTotal: number | null;
  finalTotal: number | null;
  depositAmount: number;
  subtotal: number;
  serviceCharge: number;
  deliveryFee: number;
  promoDiscount: number;
  promotionDiscount: number;
  promoCodes: string[];
  appliedPromotions?: Record<string, AppliedPromotion[]>;
  status: CateringOrderStatus;
  paymentId: string | null;
  stripePaymentIntentId: string | null;
  stripeChargeId: string | null;
  paymentLinkUrl: string | null;
  paymentLinkSentAt: string | null;
  paidAt: string | null;
  adminNotes?: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reminder24HourSent: boolean;
  reminder1HourSent: boolean;
  eventId: string | null;
  pickupContactName?: string;
  pickupContactPhone?: string;
  pickupContactEmail?: string;
  deliveryTimeChangedAt: string | null;
  deliveryTimeChangedBy: string | null;
  scheduledTransferDate: string | null;
  transfersCompleted: boolean;
  transferFailureReason?: string;
  transferRetryCount: number;
  organizationId: string | null;
  corporateUserId: string | null;
  isPaidWithWallet: boolean;
  walletAmountUsed: number;
  createdAt: string;
  updatedAt: string;
}

export interface MealSession {
  id: string;

  // Relationship to Catering Order
  cateringOrder: CateringOrder;
  cateringOrderId: string;

  // Session Details
  collectionTime: string;
  restaurantCollectionTimes?: Record<string, string>;
  sessionName: string;
  sessionOrder: number;
  sessionDate: string;
  eventTime: string;

  // Order Items
  orderItems: PricingOrderItemDto[];
  totalDeliveryPortions: number;

  // Session Pricing
  subtotal: number;
  deliveryFee: number;
  serviceCharge: number;
  promoDiscount: number;
  promotionDiscount: number;
  sessionTotal: number;

  // Applied Promotions
  appliedPromotions?: Record<string, AppliedPromotion[]>;

  // Restaurant Coordination
  restaurantReviews?: string[];
  restaurantRejections?: string[];

  // Status Tracking
  deliveryTimeChangedAt: string | null;
  deliveryTimeChangedBy: string | null;

  // Restaurant Pickup Addresses
  restaurantPickupAddresses?: Record<string, RestaurantPickupAddress>;

  // Driver Assignment & Delivery Tracking
  driverName: string | null;
  driverId: string | null;
  deliveryStatus: MealSessionDeliveryStatus;
  deliveryMethod: CateringDeliveryMethod | null;

  // Delivery Timestamps
  driverAssignedAt: string | null;
  pickupStartedAt: string | null;
  outForDeliveryAt: string | null;
  arrivedAtDestinationAt: string | null;
  deliveredAt: string | null;
  estimatedDeliveryTime: string | null;

  // Proof Images
  pickupProofImageUrl: string | null;
  deliveryProofImageUrl: string | null;

  // Driver Notes
  driverNotes: string | null;

  // Delay Tracking
  isDelayed: boolean;
  delayMinutes: number | null;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// API RESPONSE DTOs
// ============================================================

export interface RestaurantRouteStop {
  restaurantId: string;
  restaurantName: string;
  location: Location;
  address: string;
  contact: {
    phone?: string;
    email?: string;
  };
  estimatedCollectionTime: string;
  travelTimeFromPrevious: number;
  order: number;
}

export interface CollectionRouteDto {
  restaurants: RestaurantRouteStop[];
  totalCollectionTimeMinutes: number;
  estimatedDeliveryTime: string;
}

export type CustomerDeliveryStatus =
  | "awaiting_pickup"
  | "out_for_delivery"
  | "at_collection_point"
  | "delivered";

export interface DeliveryTrackingDto {
  mealSessionId: string;
  status: MealSessionDeliveryStatus;
  customerStatus: CustomerDeliveryStatus;
  estimatedDeliveryTime: string | null;
  estimatedDeliveryWindow: {
    earliest: string;
    latest: string;
  } | null;
  isDelayed: boolean;
  delayMessage: string | null;
  driverInfo: {
    name: string;
    rating: number;
  } | null;
}

// ============================================================
// ANALYTICS DTO
// ============================================================

export interface DeliveryAnalyticsDto {
  pending: number;
  active: number;
  completed: number;
}

// ============================================================
// DRIVER MEAL SESSION DTO (returned by driver-facing endpoints)
// ============================================================

export interface DriverRestaurantAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postcode: string;
  location?: Location;
}

export interface DriverRestaurantContact {
  phone?: string;
  email?: string;
}

export interface DriverRestaurantPickup {
  restaurantId: string;
  restaurantName: string;
  address: DriverRestaurantAddress;
  contact: DriverRestaurantContact;
  collectionTime: string;
  itemCount: number;
  portionCount: number;
}

export interface DriverDeliveryInfo {
  address: string;
  location?: Location;
  contactName?: string;
  contactPhone?: string;
}

// Per-restaurant pickup tracking for multi-driver
export interface RestaurantPickupStatusEntry {
  collectedAt: string;
  pickupProofImageUrl: string;
  collectedBy: string;
  notes?: string;
}

// Per-driver delivery confirmation for multi-driver
export interface DriverDeliveryConfirmation {
  confirmedAt: string;
  deliveryProofImageUrl: string;
  notes?: string;
}

export interface DriverMealSessionDto {
  id: string;
  sessionName: string;
  sessionDate: string;
  eventTime: string;

  deliveryStatus: MealSessionDeliveryStatus;

  // Single driver org account per session
  driverOrgId: string | null;
  driverNames: string[];
  driverOrgAssignedAt?: string;

  // Per-restaurant pickup tracking
  restaurantPickupStatus: Record<string, RestaurantPickupStatusEntry>;

  // Delivery confirmations (keyed by driverName)
  driverDeliveryConfirmations: Record<string, DriverDeliveryConfirmation>;

  // Optimistic locking version
  version: number;

  restaurants: DriverRestaurantPickup[];
  totalPortions: number;
  totalItems: number;

  delivery: DriverDeliveryInfo;

  specialRequirements?: string;
  estimatedDeliveryTime?: string;

  pickupStartedAt?: string;
  outForDeliveryAt?: string;
  arrivedAtDestinationAt?: string;
  deliveredAt?: string;

  driverOrgNotes?: string;
}

// ============================================================
// CATERING DRIVER REQUEST DTOs
// ============================================================

export interface AcceptMealSessionDto {
  driverOrgId?: string;
  driverNames: string[];
}

// Per-restaurant collection
export interface CollectRestaurantDto {
  restaurantId: string;
  pickupProofImageUrl: string;
  collectedBy: string;
  notes?: string;
}

// Delivery confirmation (one confirms = session delivered)
export interface ConfirmDriverDeliveryDto {
  deliveryProofImageUrl: string;
  driverName: string;
  notes?: string;
}

export interface UpdateDriverNameDto {
  driverOrgId?: string;
  driverNames: string[];
}

export interface SetDestinationDto {
  type: "restaurant" | "delivery";
  restaurantId?: string;
}
