import axiosInstance from "@/api";
import { ENDPOINTS } from "@/api/endpoints";

export interface Subscriber {
  id: number;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export interface NewsletterResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    items: Subscriber[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
  timestamp: string;
  path: string;
}

export const newsletterService = {
  getSubscribers: async (page = 1, limit = 30) => {
    const response = await axiosInstance.get<NewsletterResponse>(
      `${ENDPOINTS.contactSubscribers}?page=${page}&limit=${limit}`
    );
    return response.data;
  },
};
