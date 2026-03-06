import axiosInstance from "@/api";
import { ENDPOINTS } from "@/api/endpoints";



/**
 * Notification model
 */
export interface Notification {

    id: number;

    title: string;

    message: string;

    type: string;

    isRead: boolean;

    isFavorite: boolean;

    createdAt: string;

}



/**
 * Meta model
 */
export interface NotificationMeta {

    page: number;

    limit: number;

    total: number;

    totalPages: number;

    hasNextPage: boolean;

    hasPreviousPage: boolean;

}



/**
 * Stats model
 */
export interface NotificationStats {

    totalUnread: number;

    totalRead: number;

}



/**
 * List response
 */
export interface NotificationListResponse {

    success: boolean;

    statusCode: number;

    message: string;

    data: {

        items: Notification[];

        meta: NotificationMeta;

        stats: NotificationStats;

    };

    timestamp: string;

    path: string;

}



/**
 * Generic response
 */
export interface NotificationActionResponse {

    success: boolean;

    statusCode: number;

    message: string;

    data: any;

    timestamp: string;

    path: string;

}



/**
 * Notification Service
 */
export const notificationService = {



    /**
     * GET all notifications
     */
    async getAll(
        page: number = 1
    ): Promise<NotificationListResponse> {

        const { data } =
            await axiosInstance.get(
                ENDPOINTS.notificationsList,
                {
                    params: { page },
                }
            );

        return data;
    },



    /**
     * GET favorite notifications
     */
    async getFavorites(
        page: number = 1
    ): Promise<NotificationListResponse> {

        const { data } =
            await axiosInstance.get(
                ENDPOINTS.notificationsFavorites,
                {
                    params: { page },
                }
            );

        return data;
    },



    /**
     * Mark as favorite
     */
    async favorite(
        id: number | string
    ): Promise<NotificationActionResponse> {

        const { data } =
            await axiosInstance.put(
                ENDPOINTS.notificationFavorite(id)
            );

        return data;
    },



    /**
     * Remove favorite
     */
    async unfavorite(
        id: number | string
    ): Promise<NotificationActionResponse> {

        const { data } =
            await axiosInstance.put(
                ENDPOINTS.notificationUnfavorite(id)
            );

        return data;
    },



    /**
     * Mark all as read
     */
    async markAllRead(): Promise<NotificationActionResponse> {

        const { data } =
            await axiosInstance.put(
                ENDPOINTS.notificationReadAll
            );

        return data;
    },



    /**
     * Mark one as read
     */
    async markRead(
        id: number | string
    ): Promise<NotificationActionResponse> {

        const { data } =
            await axiosInstance.put(
                ENDPOINTS.notificationRead(id)
            );

        return data;
    },

};
