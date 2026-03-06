import axiosInstance from "@/api";
import { ApiService, BaseEntity } from "./api";
import { ENDPOINTS } from "@/api/endpoints";

// ThingToDo type definition
interface ThingToDo {
    id: string | number;
    title: string;
    slug: string;
    description: string;
    image?: string;
    gallery?: string[];
    duration?: number;
    price?: number;
    location?: string;
    category?: string;
    difficulty?: string;
    status?: 'draft' | 'published' | 'archived';
    createdAt?: string;
    updatedAt?: string;
}

export interface AdminThingToDo extends ThingToDo, BaseEntity {
    category: string;
    location: string;
    difficulty: "Easy" | "Moderate" | "Challenging" | string;
    published?: boolean;
}

export interface ExperienceHighlightInput {
    image: string;
    title: string;
    description: string;
}

export interface VisionInput {
    image: string;
    title: string;
    description: string;
}

export interface ThingsToDoCreatePayload {
    title: string;
    content: string;
    // Optional scalar fields: allow null so frontend can explicitly clear them
    excerpt?: string | null;
    coverImage?: string | null;
    purpose?: string | null;
    duration?: string | null;
    overview?: string | null;
    location?: string | null;
    // List fields: use [] to clear
    images?: string[];
    tags?: string[];
    experienceHighlight?: ExperienceHighlightInput[];
    vision?: VisionInput;
}

export interface ThingsToDoUpdatePayload extends ThingsToDoCreatePayload {}

export interface ThingsToDoStatusPayload {
    status: "PUBLISHED" | "DRAFT";
}

export interface ThingsToDoListResponse {
    items: AdminThingToDo[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

class ThingsToDoService extends ApiService<AdminThingToDo> {
    constructor() {
        super(ENDPOINTS.thingsToDo);
    }

    async createThingToDo(payload: ThingsToDoCreatePayload): Promise<AdminThingToDo> {
        const { data } = await axiosInstance.post<{ data?: AdminThingToDo }>(ENDPOINTS.thingsToDoCreate, payload);
        return (data as { data?: AdminThingToDo })?.data ?? (data as AdminThingToDo);
    }

    async updateThingToDo(id: string | number, payload: ThingsToDoUpdatePayload): Promise<AdminThingToDo> {
        const { data } = await axiosInstance.put<{ data?: AdminThingToDo }>(ENDPOINTS.thingsToDoUpdate(id), payload);
        return (data as { data?: AdminThingToDo })?.data ?? (data as AdminThingToDo);
    }

    async updateStatus(id: string | number, status: "PUBLISHED" | "DRAFT"): Promise<AdminThingToDo> {
        const { data } = await axiosInstance.put<{ data?: AdminThingToDo }>(
            ENDPOINTS.thingsToDoStatus(id),
            { status }
        );
        return (data as { data?: AdminThingToDo })?.data ?? (data as AdminThingToDo);
    }

    async deleteThingToDo(id: string | number): Promise<void> {
        await axiosInstance.delete(ENDPOINTS.thingsToDoDelete(id));
    }

    async getPublishedList(page: number = 1): Promise<ThingsToDoListResponse> {
        const { data } = await axiosInstance.get<{ data?: ThingsToDoListResponse }>(
            `${ENDPOINTS.thingsToDoPublishedList}?page=${page}`
        );
        return (data as { data?: ThingsToDoListResponse })?.data ?? (data as ThingsToDoListResponse);
    }

    async getDraftsList(page: number = 1): Promise<ThingsToDoListResponse> {
        const { data } = await axiosInstance.get<{ data?: ThingsToDoListResponse }>(
            `${ENDPOINTS.thingsToDoDraftsList}?page=${page}`
        );
        return (data as { data?: ThingsToDoListResponse })?.data ?? (data as ThingsToDoListResponse);
    }

    async getPublishedById(id: string | number): Promise<AdminThingToDo> {
        const { data } = await axiosInstance.get<{ data?: AdminThingToDo }>(ENDPOINTS.thingsToDoPublishedById(id));
        return (data as { data?: AdminThingToDo })?.data ?? (data as AdminThingToDo);
    }

    async getDraftById(id: string | number): Promise<AdminThingToDo> {
        const { data } = await axiosInstance.get<{ data?: AdminThingToDo }>(ENDPOINTS.thingsToDoDraftById(id));
        return (data as { data?: AdminThingToDo })?.data ?? (data as AdminThingToDo);
    }
}

export const thingsToDoService = new ThingsToDoService();
