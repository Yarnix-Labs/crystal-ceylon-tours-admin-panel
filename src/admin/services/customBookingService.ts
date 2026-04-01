import axiosInstance from "@/api";
import { ENDPOINTS } from "@/api/endpoints";

/**
 * Custom Booking Status type
 */
export type CustomBookingStatus = "NEW" | "CONTACTED" | "CONFIRMED" | "CLOSED";

export interface CustomBookingDestination {
  id: number;
  title: string;
}

export interface CustomBookingActivity {
  id: number;
  title: string;
}

/**
 * Custom Booking item interface
 */
export interface CustomBookingItem {
  id: number;
  destinations: CustomBookingDestination[];
  startDate: string;
  travelers: number;
  activities: CustomBookingActivity[];
  fullName: string;
  email: string;
  phoneNumber: string;
  whatsappNumber: string;
  specialRequests: string;
  status: CustomBookingStatus;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Pagination meta
 */
export interface CustomBookingMeta {
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
export interface CustomBookingListResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    items: CustomBookingItem[];
    meta: CustomBookingMeta;
  };
  timestamp: string;
  path: string;
}

/**
 * Single custom booking response
 */
export interface CustomBookingSingleResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: CustomBookingItem;
  timestamp: string;
  path: string;
}

/**
 * Update admin note payload
 */
export interface UpdateCustomAdminNotePayload {
  adminNote: string;
}

/**
 * Update status payload
 */
export interface UpdateCustomStatusPayload {
  status: CustomBookingStatus;
}

/**
 * Common success response
 */
export interface CustomBookingActionResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: CustomBookingItem | null;
  timestamp: string;
  path: string;
}

/**
 * Custom Booking Service
 */
export const customBookingService = {
  /**
   * GET /custom-bookings?page=1
   */
  async getAll(page: number = 1): Promise<CustomBookingListResponse> {
    const { data } = await axiosInstance.get(ENDPOINTS.customBookings, {
      params: { page },
    });

    return data;
  },

  /**
   * GET /custom-bookings/:id
   */
  async getById(id: string | number): Promise<CustomBookingSingleResponse> {
    const { data } = await axiosInstance.get(ENDPOINTS.customBookingsById(id));

    return data;
  },

  /**
   * GET /custom-bookings/filter?status=CONTACTED&page=1
   */
  async filterByStatus(
    status: CustomBookingStatus,
    page: number = 1,
  ): Promise<CustomBookingListResponse> {
    const { data } = await axiosInstance.get(ENDPOINTS.customBookingsFilter, {
      params: {
        status,
        page,
      },
    });

    return data;
  },

  /**
   * Post /custom-bookings/admin-note/:id
   */
  async updateAdminNote(
    id: string | number,
    payload: UpdateCustomAdminNotePayload,
  ): Promise<CustomBookingActionResponse> {
    const { data } = await axiosInstance.post(
      ENDPOINTS.customBookingsUpdateAdminNote(id),
      payload,
    );

    return data;
  },

  /**
   * PUT /custom-bookings/status/:id
   */
  async updateStatus(
    id: string | number,
    payload: UpdateCustomStatusPayload,
  ): Promise<CustomBookingActionResponse> {
    const { data } = await axiosInstance.post(
      ENDPOINTS.customBookingsUpdateStatus(id),
      payload,
    );

    return data;
  },

  /**
   * DELETE /custom-bookings/:id
   */
  async delete(id: string | number): Promise<CustomBookingActionResponse> {
    const { data } = await axiosInstance.delete(ENDPOINTS.customBookingsDelete(id));

    return data;
  },
};
