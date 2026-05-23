// shared/types/index.ts
// ============================================================
// THODDOO RIDES — Shared Type Definitions
// Used by: passenger-app, driver-app, admin-dashboard, backend
// ============================================================

// ─── ENUMS ───────────────────────────────────────────────────

export enum UserRole {
  PASSENGER = 'passenger',
  DRIVER = 'driver',
  ADMIN = 'admin',
}

export enum VehicleType {
  BUGGY_6 = 'buggy_6',    // 6-seater golf buggy
  BUGGY_12 = 'buggy_12',  // 12-seater golf buggy
  MOTORCYCLE = 'motorcycle',
}

export enum RideStatus {
  REQUESTING = 'requesting',
  ACCEPTED = 'accepted',
  DRIVER_ARRIVING = 'driver_arriving',
  DRIVER_ARRIVED = 'driver_arrived',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED_PASSENGER = 'cancelled_passenger',
  CANCELLED_DRIVER = 'cancelled_driver',
  NO_DRIVER = 'no_driver',
}

export enum DriverStatus {
  OFFLINE = 'offline',
  AVAILABLE = 'available',
  ON_TRIP = 'on_trip',
}

export enum DriverApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
}

export enum DocumentType {
  NATIONAL_ID_FRONT = 'national_id_front',
  NATIONAL_ID_BACK = 'national_id_back',
  PASSPORT = 'passport',
  WORK_PERMIT = 'work_permit',
  VEHICLE_PHOTO = 'vehicle_photo',
  DRIVER_SELFIE = 'driver_selfie',
}

export enum EventCategory {
  DJ_NIGHT = 'dj_night',
  KARAOKE = 'karaoke',
  POOL_PARTY = 'pool_party',
  BEACH_EVENT = 'beach_event',
  ISLAND_SPECIAL = 'island_special',
}

export enum ActivityCategory {
  AQUA_ZUMBA = 'aqua_zumba',
  POOL_ACCESS = 'pool_access',
  KARAOKE = 'karaoke',
  DJ_NIGHT = 'dj_night',
  BEACH_EVENT = 'beach_event',
  ISLAND_SPECIAL = 'island_special',
}

export enum Language {
  EN = 'en',
  RU = 'ru',
  DV = 'dv', // Dhivehi (future)
  DE = 'de', // German (future)
  IT = 'it', // Italian (future)
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card', // future
  TRANSFER = 'transfer', // future
}

// ─── GEO ─────────────────────────────────────────────────────

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface ThoddooLocation {
  id: string;
  nameEn: string;
  nameDv?: string;       // Dhivehi name
  nameRu?: string;       // Russian name
  coordinates: GeoPoint;
  category: LocationCategory;
  isPopular?: boolean;
  icon?: string;
}

export enum LocationCategory {
  GUESTHOUSE = 'guesthouse',
  FERRY_JETTY = 'ferry_jetty',
  BEACH = 'beach',
  RESORT = 'resort',
  RESTAURANT = 'restaurant',
  ACTIVITY_VENUE = 'activity_venue',
  SCHOOL = 'school',
  MOSQUE = 'mosque',
  HEALTH = 'health',
  GOVERNMENT = 'government',
  RESIDENTIAL = 'residential',
  SHOP = 'shop',
  OTHER = 'other',
}

// ─── USER ─────────────────────────────────────────────────────

export interface BaseUser {
  uid: string;
  phone: string;
  name: string;
  profilePhoto?: string;
  role: UserRole;
  language: Language;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface Passenger extends BaseUser {
  role: UserRole.PASSENGER;
  savedLocations: SavedLocation[];
  totalRides: number;
  rating?: number;
}

export interface SavedLocation {
  id: string;
  label: string;  // e.g. "Home", "My Guesthouse", "Ferry Jetty"
  icon: string;
  location: ThoddooLocation;
}

export interface Driver extends BaseUser {
  role: UserRole.DRIVER;
  driverCode: string;          // e.g. THD-4022
  approvalStatus: DriverApprovalStatus;
  nationality: 'maldivian' | 'foreign';
  idType: 'national_id' | 'passport';
  documents: DriverDocument[];
  vehicle?: Vehicle;
  currentLocation?: GeoPoint;
  status: DriverStatus;
  rating: number;
  totalRides: number;
  totalEarnings: number;
  fcmToken?: string;
  lastSelfieVerification?: Date;
}

export interface DriverDocument {
  type: DocumentType;
  url: string;
  uploadedAt: Date;
  verified: boolean;
}

export interface Vehicle {
  id: string;
  driverId: string;
  type: VehicleType;
  plateNumber: string;
  photoUrl: string;
  seats: number;
  color?: string;
  model?: string;
  isApproved: boolean;
}

// ─── RIDE ─────────────────────────────────────────────────────

export interface Ride {
  id: string;
  passengerId: string;
  driverId?: string;
  vehicleType: VehicleType;
  status: RideStatus;
  pickup: ThoddooLocation;
  dropoff: ThoddooLocation;
  fare: number;
  commission: number;          // platform fee
  driverEarnings: number;      // fare - commission
  paymentMethod: PaymentMethod;
  isPaid: boolean;
  requestedAt: Date;
  acceptedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  passengerRating?: number;
  driverRating?: number;
  eventId?: string;            // if booked via Events tab
  activityId?: string;         // if booked via Activities tab
}

// ─── PRICING ─────────────────────────────────────────────────

export interface PricingRule {
  id: string;
  vehicleType: VehicleType;
  baseFare: number;           // MVR
  perKmRate?: number;         // for future use
  flatIslandRate: boolean;    // Thoddoo is tiny, flat pricing makes sense
  commissionPercent: number;  // admin-configurable
  surgeFactor?: number;       // for events (future)
  isActive: boolean;
  updatedBy: string;          // admin uid
  updatedAt: Date;
}

// ─── EVENTS ─────────────────────────────────────────────────

export interface IslandEvent {
  id: string;
  titleEn: string;
  titleRu?: string;
  descriptionEn: string;
  descriptionRu?: string;
  category: EventCategory;
  venue: ThoddooLocation;
  imageUrl: string;
  startTime: Date;
  endTime?: Date;
  price?: number;
  isFeatured: boolean;
  isActive: boolean;
  createdBy: string;   // admin uid
  createdAt: Date;
  rideCount?: number;  // how many rides booked to this event
}

export interface IslandActivity {
  id: string;
  titleEn: string;
  titleRu?: string;
  descriptionEn: string;
  descriptionRu?: string;
  category: ActivityCategory;
  venue: ThoddooLocation;
  imageUrl: string;
  scheduledTime: Date;
  duration?: number;           // minutes
  maxParticipants?: number;
  currentParticipants?: number;
  price?: number;
  isFeatured: boolean;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
}

// ─── NOTIFICATIONS ───────────────────────────────────────────

export interface PushNotification {
  id: string;
  recipientId: string;
  recipientRole: UserRole;
  title: string;
  body: string;
  data?: Record<string, string>;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
}

export enum NotificationType {
  RIDE_ACCEPTED = 'ride_accepted',
  DRIVER_ARRIVING = 'driver_arriving',
  DRIVER_ARRIVED = 'driver_arrived',
  RIDE_STARTED = 'ride_started',
  RIDE_COMPLETED = 'ride_completed',
  RIDE_CANCELLED = 'ride_cancelled',
  NEW_RIDE_REQUEST = 'new_ride_request',
  PAYOUT_UPDATE = 'payout_update',
  VERIFICATION_REMINDER = 'verification_reminder',
  EVENT_REMINDER = 'event_reminder',
  ACCOUNT_APPROVED = 'account_approved',
  ACCOUNT_SUSPENDED = 'account_suspended',
}

// ─── EARNINGS ────────────────────────────────────────────────

export interface DriverEarnings {
  driverId: string;
  date: string;         // YYYY-MM-DD
  totalFares: number;
  totalCommission: number;
  netEarnings: number;
  totalRides: number;
  cashCollected: number;
}

// ─── ADMIN ───────────────────────────────────────────────────

export interface AdminAction {
  id: string;
  adminId: string;
  action: AdminActionType;
  targetId: string;
  targetType: 'driver' | 'passenger' | 'ride' | 'vehicle';
  reason?: string;
  timestamp: Date;
}

export enum AdminActionType {
  APPROVE_DRIVER = 'approve_driver',
  REJECT_DRIVER = 'reject_driver',
  SUSPEND_DRIVER = 'suspend_driver',
  UNSUSPEND_DRIVER = 'unsuspend_driver',
  APPROVE_VEHICLE = 'approve_vehicle',
  REJECT_VEHICLE = 'reject_vehicle',
  SUSPEND_PASSENGER = 'suspend_passenger',
  UPDATE_PRICING = 'update_pricing',
}

// ─── API RESPONSES ───────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
