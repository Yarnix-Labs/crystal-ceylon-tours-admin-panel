import axiosInstance from "@/api";
import { ENDPOINTS } from "@/api/endpoints";



/**
 * Message Status types
 */
export type MessageStatus =
    | "UNREAD"
    | "READ"
    | "REPLIED"
    | "CLOSED";



/**
 * Single message item
 */
export interface MessageItem {

    id: number;

    name: string;

    subject: string;

    email: string;

    message: string;

    phoneNumber: string;

    status: MessageStatus;

    adminNote: string | null;

    createdAt: string;
}



/**
 * Pagination meta
 */
export interface MessageMeta {

    page: number;

    limit: number;

    total: number;

    totalPages: number;

    hasNextPage: boolean;

    hasPreviousPage: boolean;
}



/**
 * Message list response
 */
export interface MessageListResponse {

    success: boolean;

    statusCode: number;

    message: string;

    data: {

        data: MessageItem[];

        meta: MessageMeta;
    };

    timestamp: string;

    path: string;
}



/**
 * Single message response
 */
export interface MessageSingleResponse {

    success: boolean;

    statusCode: number;

    message: string;

    data: MessageItem;

    timestamp: string;

    path: string;
}



/**
 * Update status payload
 */
export interface MessageStatusPayload {

    status: MessageStatus;
}



/**
 * Update admin note payload
 */
export interface MessageAdminNotePayload {

    note: string;
}



/**
 * Common action response
 */
export interface MessageActionResponse {

    success: boolean;

    statusCode: number;

    message: string;

    data: MessageItem | null;

    timestamp: string;

    path: string;
}



/**
 * Message Service
 */
export const messageService = {



    /**
     * GET /contact/message/list?page=1
     */
    async getAll(page: number = 1): Promise<MessageListResponse> {

        const { data } =
            await axiosInstance.get(
                ENDPOINTS.contactMessagesList,
                {
                    params: { page }
                }
            );

        return data;
    },



    /**
     * GET /contact/message/:id
     */
    async getById(
        id: string | number
    ): Promise<MessageSingleResponse> {

        const { data } =
            await axiosInstance.get(
                ENDPOINTS.contactMessageById(id)
            );

        return data;
    },



    /**
     * GET /contact/message/filter?status=UNREAD&page=1
     */
    async filterByStatus(
        status: MessageStatus,
        page: number = 1
    ): Promise<MessageListResponse> {

        const { data } =
            await axiosInstance.get(
                ENDPOINTS.contactMessagesFilter,
                {
                    params: {
                        status,
                        page
                    }
                }
            );

        return data;
    },



    /**
     * POST /contact/status/:id
     */
    async updateStatus(
        id: string | number,
        payload: MessageStatusPayload
    ): Promise<MessageActionResponse> {

        const { data } =
            await axiosInstance.post(
                ENDPOINTS.contactMessageUpdateStatus(id),
                payload
            );

        return data;
    },



    /**
     * POST /contact/admin/note/:id
     */
    async updateAdminNote(
        id: string | number,
        payload: MessageAdminNotePayload
    ): Promise<MessageActionResponse> {

        const { data } =
            await axiosInstance.post(
                ENDPOINTS.contactMessageUpdateAdminNote(id),
                payload
            );

        return data;
    },



    /**
     * DELETE /contact/message/delete/:id
     */
    async delete(
        id: string | number
    ): Promise<MessageActionResponse> {

        const { data } =
            await axiosInstance.delete(
                ENDPOINTS.contactMessageDelete(id)
            );

        return data;
    },

};
