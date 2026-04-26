import axiosInstance from "@/api";
import { ENDPOINTS } from "@/api/endpoints";

/**
 * Quick Booking Status type
 */
export type QuickBookingStatus = "NEW" | "CONTACTED" | "CONFIRMED" | "CLOSED";

/**
 * Vehicle interface nested in Quick Booking
 */
export interface VehicleInfo {
  id: number;
  name: string;
  type: string;
  model: string;
  passengers: number;
  features: string[];
  description: string;
  images: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Quick Booking item interface
 */
export interface QuickBookingItem {
  id: number;
  transferType: string;
  pickupLocation: string;
  dropLocation: string;
  vehicleId: number;
  passengersCount: number;
  date: string;
  pickupTime: string;
  name: string;
  email: string;
  mobileNo: string | null;
  message: string | null;
  status: QuickBookingStatus;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
  vehicle: VehicleInfo;
}

/**
 * Pagination meta
 */
export interface QuickBookingMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Get all / filter response
 */
export interface QuickBookingListResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    items: QuickBookingItem[];
    meta: QuickBookingMeta;
  };
  timestamp: string;
  path: string;
}

/**
 * Single quick booking response
 */
export interface QuickBookingSingleResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: QuickBookingItem;
  timestamp: string;
  path: string;
}

/**
 * Update admin note payload
 */
export interface UpdateAdminNotePayload {
  adminNote: string;
}

/**
 * Update status payload
 */
export interface UpdateStatusPayload {
  status: QuickBookingStatus;
}

/**
 * Common success response
 */
export interface QuickBookingActionResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: QuickBookingItem | null;
  timestamp: string;
  path: string;
}

/**
 * Quick Booking Service
 */
export const quickBookingService = {
  /**
   * GET /quick-bookings?page=1
   */
  async getAll(page: number = 1): Promise<QuickBookingListResponse> {
    const { data } = await axiosInstance.get(ENDPOINTS.quickBookings, {
      params: { page },
    });

    return data;
  },

  /**
   * GET /quick-bookings/:id
   */
  async getById(id: string | number): Promise<QuickBookingSingleResponse> {
    const { data } = await axiosInstance.get(ENDPOINTS.quickBookingsById(id));

    return data;
  },

  /**
   * GET /quick-bookings/filter?status=CONTACTED&page=1
   */
  async filterByStatus(
    status: QuickBookingStatus,
    page: number = 1,
  ): Promise<QuickBookingListResponse> {
    const { data } = await axiosInstance.get(ENDPOINTS.quickBookingsFilter, {
      params: {
        status,
        page,
      },
    });

    return data;
  },

  /**
   * POST /quick-bookings/admin-note/:id
   */
  async updateAdminNote(
    id: string | number,
    payload: UpdateAdminNotePayload,
  ): Promise<QuickBookingActionResponse> {
    const { data } = await axiosInstance.post(
      ENDPOINTS.quickBookingsUpdateAdminNote(id),
      payload,
    );

    return data;
  },

  /**
   * POST /quick-bookings/status/:id
   */
  async updateStatus(
    id: string | number,
    payload: UpdateStatusPayload,
  ): Promise<QuickBookingActionResponse> {
    const { data } = await axiosInstance.post(
      ENDPOINTS.quickBookingsUpdateStatus(id),
      payload,
    );

    return data;
  },

  /**
   * DELETE /quick-bookings/:id
   */
  async delete(id: string | number): Promise<QuickBookingActionResponse> {
    const { data } = await axiosInstance.delete(ENDPOINTS.quickBookingsDelete(id));

    return data;
  },
};
