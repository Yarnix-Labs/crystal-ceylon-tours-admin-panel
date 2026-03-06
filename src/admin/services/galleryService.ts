import axiosInstance from "@/api";
import { ENDPOINTS } from "@/api/endpoints";

export interface GalleryCreatePayload {
    title: string;
    description: string;
    imageUrl: string;
}

export interface GalleryCreateResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        id?: string | number;
        title?: string;
        description?: string;
        imageUrl?: string;
    } | null;
    timestamp: string;
    path: string;
}

export interface GalleryUpdatePayload {
    title: string;
    description: string;
    imageUrl: string;
}

export interface GalleryStatusPayload {
    isActive: boolean;
}

export interface GalleryItem {
    id: string | number;
    title: string;
    description?: string | null;
    imageUrl: string;
    isActive?: boolean;
}



export interface GalleryGetAllResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        items: GalleryItem[];
        meta?: {
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

export interface GallerySingleResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data: GalleryItem;
    timestamp: string;
    path: string;
}

export const galleryService = {
    async create(payload: GalleryCreatePayload): Promise<GalleryCreateResponse> {
        const { data } = await axiosInstance.post<GalleryCreateResponse>(ENDPOINTS.galleryCreate, payload);
        return data;
    },



    async getAll(
        page: number = 1
    ): Promise<GalleryGetAllResponse> {

        const { data } =
            await axiosInstance.get(
                `${ENDPOINTS.galleryGetAll}?page=${page}`
            );

        return data;
    },

    async getById(id: string | number): Promise<GallerySingleResponse> {
        const { data } = await axiosInstance.get<GallerySingleResponse>(ENDPOINTS.galleryGetById(id));
        return data;
    },

    async getInactive(page: number = 1): Promise<GalleryGetAllResponse> {
        const { data } = await axiosInstance.get<GalleryGetAllResponse>(
            `${ENDPOINTS.galleryGetInactive}?page=${page}`
        );
        return data;
    },

    async getInactiveById(id: string | number): Promise<GallerySingleResponse> {
        const { data } = await axiosInstance.get<GallerySingleResponse>(ENDPOINTS.galleryGetInactiveById(id));
        return data;
    },

    async update(id: string | number, payload: GalleryUpdatePayload): Promise<GalleryCreateResponse> {
        const { data } = await axiosInstance.put<GalleryCreateResponse>(ENDPOINTS.galleryUpdate(id), payload);
        return data;
    },

    async updateStatus(id: string | number, payload: GalleryStatusPayload): Promise<GalleryCreateResponse> {
        const { data } = await axiosInstance.put<GalleryCreateResponse>(ENDPOINTS.galleryStatus(id), payload);
        return data;
    },

    async delete(id: string | number): Promise<GalleryCreateResponse> {
        const { data } = await axiosInstance.delete<GalleryCreateResponse>(ENDPOINTS.galleryDelete(id));
        return data;
    },
};


