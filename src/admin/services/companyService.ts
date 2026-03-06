import axiosInstance from "@/api";
import { ENDPOINTS } from "@/api/endpoints";



/**
 * Company details data model
 */
export interface CompanyDetails {

    id?: number;

    companyName: string;

    logoUrl?: string;

    contactEmail: string;

    contactPhone: string;

    address: string;

}



/**
 * API response model
 */
export interface CompanyDetailsResponse {

    success: boolean;

    statusCode: number;

    message: string;

    data: CompanyDetails;

    timestamp: string;

    path: string;
}



/**
 * Company Service
 */
export const companyService = {





    /**
     * Upload company logo (use same storage API)
     */
    async uploadLogo(file: File) {

        const formData = new FormData();

        formData.append("file", file);

        const { data } =
            await axiosInstance.post(
                ENDPOINTS.storageUploadProfile, // same API
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
     * GET company details
     */
    async getDetails() {

        const { data } =
            await axiosInstance.get(
                ENDPOINTS.companyDetails
            );

        return data;
    },



    /**
     * POST create company details
     */
    async createDetails(payload: any) {

        const { data } =
            await axiosInstance.post(
                ENDPOINTS.companyDetails,
                payload
            );

        return data;
    },



    /**
     * PUT update company details
     */
    async updateDetails(payload: any) {

        const { data } =
            await axiosInstance.put(
                ENDPOINTS.companyDetails,
                payload
            );

        return data;
    },

};


