import axiosInstance from "@/api";
import { ENDPOINTS } from "@/api/endpoints";




export interface CompanySocialMedia {

    id?: number;

    type: string;

    iconUrl: string;

    pageUrl: string;

}



/**
 * API response model
 */
export interface CompanySocialMediaResponse {

    success: boolean;

    statusCode: number;

    message: string;

    data: CompanySocialMedia;

    timestamp: string;

    path: string;

}



export interface CompanySocialMediaListResponse {

    success: boolean;

    statusCode: number;

    message: string;

    data: CompanySocialMedia[];

    timestamp: string;

    path: string;

}

export const companySocialMediaService = {

    /**
     * Upload icon image (use same storage API)
     */
    async uploadIcon(file: File) {

        const formData = new FormData();

        formData.append("file", file);

        const { data } =
            await axiosInstance.post(
                ENDPOINTS.storageUploadProfile, // same endpoint
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

        return data;
    },

    /**
     * Create social media
     */
    async create(payload: any) {

        const { data } =
            await axiosInstance.post(
                ENDPOINTS.companySocialMediaCreate,
                payload
            );

        return data;
    },

    /**
     * Get all
     */
    async getAll() {

        const { data } =
            await axiosInstance.get(
                ENDPOINTS.companySocialMediaList
            );

        return data;
    },

    /**
     * Update
     */
    async update(id: number, payload: any) {

        const { data } =
            await axiosInstance.put(
                ENDPOINTS.companySocialMediaById(id),
                payload
            );

        return data;
    },

    /**
     * Delete
     */
    async delete(id: number) {

        const { data } =
            await axiosInstance.delete(
                ENDPOINTS.companySocialMediaById(id)
            );

        return data;
    },

};
