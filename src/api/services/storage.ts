import axiosInstance from "@/api";
import { ENDPOINTS } from "@/api/endpoints";

export interface UploadImageResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        url: string;
        path: string;
    };
    timestamp: string;
    path: string;
}

export const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await axiosInstance.post<UploadImageResponse>(
        `${ENDPOINTS.storageUploadImage}?file`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            timeout: 60000, // 60 seconds timeout for image uploads
        }
    );

    return data.data.url;
};

export const uploadAsset = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await axiosInstance.post<UploadImageResponse>(
        `${ENDPOINTS.storageUploadAsset}?file`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            timeout: 60000, // 60 seconds timeout for asset uploads
        }
    );

    return data.data.url;
};
