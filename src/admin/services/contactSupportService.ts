import axiosInstance from "@/api";
import { ENDPOINTS } from "@/api/endpoints";

export interface SupportEmailRequest {
    subject: string;
    message: string;
}

export interface SupportEmailResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data: null;
    timestamp: string;
    path: string;
}

export const contactSupportService = {
    /**
     * Send support email
     */
    async create(payload: SupportEmailRequest) {
        const { data } = await axiosInstance.post(
            ENDPOINTS.contactSupport,
            payload
        );
        return data;
    },
};
