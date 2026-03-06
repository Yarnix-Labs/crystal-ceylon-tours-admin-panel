import axiosInstance from "@/api";
import { ENDPOINTS } from "@/api/endpoints";

/**
 * Booking Status type
 */
export type BookingStatus = "NEW" | "CONTACTED" | "CONFIRMED" | "CLOSED";

/**
 * Booking item interface
 */
export interface BookingItem {
  id: number;

  tourPackageId: number | null;

  name: string;

  email: string;

  phoneNumber: string;

  country: string;

  whatsapp: string;

  arrivalDate: string;

  passengers: number;

  clientMessage: string;

  adminNote: string | null;

  status: BookingStatus;

  createdAt: string;

  updatedAt: string;
}

/**
 * Pagination meta
 */
export interface BookingMeta {
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
export interface BookingListResponse {
  success: boolean;

  statusCode: number;

  message: string;

  data: {
    items: BookingItem[];
    meta: BookingMeta;
  };

  timestamp: string;

  path: string;
}

/**
 * Single booking response
 */
export interface BookingSingleResponse {
  success: boolean;

  statusCode: number;

  message: string;

  data: BookingItem;

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
  status: BookingStatus;
}

/**
 * Common success response
 */
export interface BookingActionResponse {
  success: boolean;

  statusCode: number;

  message: string;

  data: BookingItem | null;

  timestamp: string;

  path: string;
}

/**
 * Booking Service
 */
export const bookingService = {
  /**
   * GET /bookings?page=1
   */
  async getAll(page: number = 1): Promise<BookingListResponse> {
    const { data } = await axiosInstance.get(ENDPOINTS.bookings, {
      params: { page },
    });

    return data;
  },

  /**
   * GET /bookings/:id
   */
  async getById(id: string | number): Promise<BookingSingleResponse> {
    const { data } = await axiosInstance.get(ENDPOINTS.bookingsById(id));

    return data;
  },

  /**
   * GET /bookings/filter?status=CONTACTED&page=1
   */
  async filterByStatus(
    status: BookingStatus,
    page: number = 1,
  ): Promise<BookingListResponse> {
    const { data } = await axiosInstance.get(ENDPOINTS.bookingsFilter, {
      params: {
        status,
        page,
      },
    });

    return data;
  },

  /**
   * Post /bookings/admin-note/:id
   */
  async updateAdminNote(
    id: string | number,
    payload: UpdateAdminNotePayload,
  ): Promise<BookingActionResponse> {
    const { data } = await axiosInstance.post(
      ENDPOINTS.bookingsUpdateAdminNote(id),
      payload,
    );

    return data;
  },

  /**
   * PUT /bookings/status/:id
   */
  async updateStatus(
    id: string | number,
    payload: UpdateStatusPayload,
  ): Promise<BookingActionResponse> {
    const { data } = await axiosInstance.post(
      ENDPOINTS.bookingsUpdateStatus(id),
      payload,
    );

    return data;
  },

  /**
   * DELETE /bookings/:id
   */
  async delete(id: string | number): Promise<BookingActionResponse> {
    const { data } = await axiosInstance.delete(ENDPOINTS.bookingsDelete(id));

    return data;
  },
};
