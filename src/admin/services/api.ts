import axiosInstance from "@/api";

// Generic Type for Entities
export interface BaseEntity {
    id: string | number;
    [key: string]: any;
}

/**
 * Base API service class for admin CRUD operations.
 * All methods call the real API endpoints.
 */
export class ApiService<T extends BaseEntity> {
    protected endpoint: string;

    constructor(endpoint: string) {
        this.endpoint = endpoint;
    }

    async getAll(): Promise<T[]> {
        const response = await axiosInstance.get<T[]>(this.endpoint);
        return response.data;
    }

    async getById(id: string): Promise<T | undefined> {
        const response = await axiosInstance.get<T>(`${this.endpoint}/${id}`);
        return response.data;
    }

    async create(item: Omit<T, "id">): Promise<T> {
        const response = await axiosInstance.post<T>(this.endpoint, item);
        return response.data;
    }

    async update(id: string, updates: Partial<T>): Promise<T> {
        const response = await axiosInstance.patch<T>(`${this.endpoint}/${id}`, updates);
        return response.data;
    }

    async delete(id: string): Promise<void> {
        await axiosInstance.delete(`${this.endpoint}/${id}`);
    }
}
