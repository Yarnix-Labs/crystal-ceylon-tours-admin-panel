import axiosInstance from "@/api";
import { ENDPOINTS } from "@/api/endpoints";

/**
 * Vehicle Status type
 */
export type VehicleStatus = "ACTIVE" | "INACTIVE";

/**
 * Vehicle item interface
 */
export interface VehicleItem {
  id: number;
  name: string;
  type: string;
  model: string;
  passengers: number;
  features: string[];
  description: string;
  images: string[];
  price: number;
  status: VehicleStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Vehicle list response
 */
export interface VehicleListResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: VehicleItem[];
  timestamp: string;
  path: string;
}

/**
 * Single vehicle response
 */
export interface VehicleSingleResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: VehicleItem;
  timestamp: string;
  path: string;
}

/**
 * Vehicle Service
 */
export const vehicleService = {
  /**
   * GET /vehicles
   */
  async getAll(): Promise<VehicleListResponse> {
    const { data } = await axiosInstance.get(ENDPOINTS.vehicles);
    return data;
  },

  /**
   * GET /vehicles/:id
   */
  async getById(id: string | number): Promise<VehicleSingleResponse> {
    const { data } = await axiosInstance.get(ENDPOINTS.vehiclesById(id));
    return data;
  },

  /**
   * POST /vehicles
   */
  async create(payload: Partial<VehicleItem>): Promise<VehicleSingleResponse> {
    const { data } = await axiosInstance.post(ENDPOINTS.vehicles, payload);
    return data;
  },

  /**
   * PUT /vehicles/:id
   */
  async update(id: string | number, payload: Partial<VehicleItem>): Promise<VehicleSingleResponse> {
    const { data } = await axiosInstance.put(ENDPOINTS.vehiclesById(id), payload);
    return data;
  },

  /**
   * DELETE /vehicles/:id
   */
  async delete(id: string | number): Promise<any> {
    const { data } = await axiosInstance.delete(ENDPOINTS.vehiclesDelete(id));
    return data;
  },
};
