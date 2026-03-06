import axiosInstance from "@/api";
import { ENDPOINTS } from "@/api/endpoints";

export interface WeeklyBooking {
  day: string;
  count: number;
}

export interface DashboardAnalyticsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    weeklyBookings: WeeklyBooking[];
  };
  timestamp: string;
  path: string;
}

export interface DashboardStatsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    totalBookingsCurrentMonth: number;
    confirmedBookingsCurrentMonth: number;
    conversionRateCurrentMonth: number;
    unreadMessages: number;
  };
  timestamp: string;
  path: string;
}

export interface Country {
  country: string;
  activeUsers: number;
}

export interface DeviceTypes {
  desktop: number;
  mobile: number;
  tablet: number;
}

export interface VisitorInsight {
  date: string;
  activeUsers: number;
}

export interface TrafficSource {
  source: string;
  activeUsers: number;
}

export interface DashboardOverview {
  countries: Country[];
  deviceTypes: DeviceTypes;
  visitorInsights: VisitorInsight[];
  trafficSources: TrafficSource[];
}

export interface DashboardOverviewResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: DashboardOverview;
  timestamp: string;
  path: string;
}
export const dashboardService = {
  /**
   * Get dashboard analytics (weekly bookings chart data)
   */
  async getAnalytics() {
    const { data } = await axiosInstance.get<DashboardAnalyticsResponse>(
      ENDPOINTS.dashboardAnalytics
    );
    return data;
  },

  /**
   * Get dashboard stats (summary statistics)
   */
  async getStats() {
    const { data } = await axiosInstance.get<DashboardStatsResponse>(
      ENDPOINTS.dashboardStats
    );
    return data;
  },

  getOverview: async (): Promise<DashboardOverview> => {
    const response = await axiosInstance.get<DashboardOverviewResponse>(
      ENDPOINTS.GoogleAnalytics
    );

    return response.data.data;
  },
};
