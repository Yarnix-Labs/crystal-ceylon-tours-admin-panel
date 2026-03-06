import axiosInstance from "@/api";
import { ApiService, BaseEntity } from "./api";
import { ENDPOINTS } from "@/api/endpoints";

// Destination type definition
interface Destination {
    id: string | number;
    title: string;
    slug: string;
    description: string;
    content: string;
    image?: string;
    gallery?: string[];
    location?: string;
    region?: string;
    status?: 'draft' | 'published' | 'archived';
    createdAt?: string;
    updatedAt?: string;
}

export interface AdminDestination extends Omit<Destination, 'id'>, BaseEntity {}

export interface KeyHighlightInput {
    title: string;
    description: string;
}

export interface DestinationCreatePayload {
    title: string;
    content: string;
    // Optional scalars: allow null so they can be cleared
    excerpt?: string | null;
    coverImage?: string | null;
    specificName?: string | null;
    bestTime?: string | null;
    tourCount?: number | null;
    explorerNote?: string | null;
    location?: string | null;
    // Lists: use [] to clear
    images?: string[];
    tags?: string[];
    keyHighlights?: KeyHighlightInput[];
}

export interface DestinationUpdatePayload extends DestinationCreatePayload {}

export interface DestinationStatusPayload {
    status: "PUBLISHED" | "DRAFT";
}

export interface DestinationListResponse {
    items: AdminDestination[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

class DestinationService extends ApiService<AdminDestination> {
    constructor() {
        super(ENDPOINTS.destinations);
    }

    async create(item: DestinationCreatePayload | Omit<AdminDestination, "id">): Promise<AdminDestination> {
        const payload = item as DestinationCreatePayload;
        // Use POST /destinations/create for the new API payload shape
        if (payload?.title && payload?.content && typeof payload.title === "string") {
            const { data } = await axiosInstance.post<{ data?: AdminDestination }>(ENDPOINTS.destinationsCreate, payload);
            return (data as { data?: AdminDestination })?.data ?? (data as AdminDestination);
        }
        return super.create(item as Omit<AdminDestination, "id">);
    }

    async updateDestination(id: string | number, payload: DestinationUpdatePayload): Promise<AdminDestination> {
        const { data } = await axiosInstance.put<{ data?: AdminDestination }>(ENDPOINTS.destinationsUpdate(id), payload);
        return (data as { data?: AdminDestination })?.data ?? (data as AdminDestination);
    }


    async updateStatus(id: string | number, status: "PUBLISHED" | "DRAFT"): Promise<AdminDestination> {
        const { data } = await axiosInstance.put<{ data?: AdminDestination }>(
            ENDPOINTS.destinationsStatus(id),
            { status }
        );
        return (data as { data?: AdminDestination })?.data ?? (data as AdminDestination);
    }

    async deleteDestination(id: string | number): Promise<void> {
        await axiosInstance.delete(ENDPOINTS.destinationsDelete(id));
    }

    async getPublishedList(page: number = 1): Promise<DestinationListResponse> {
        const { data } = await axiosInstance.get<{ data?: DestinationListResponse }>(
            `${ENDPOINTS.destinationsPublishedList}?page=${page}`
        );
        return (data as { data?: DestinationListResponse })?.data ?? (data as DestinationListResponse);
    }

    async getDraftsList(page: number = 1): Promise<DestinationListResponse> {
        const { data } = await axiosInstance.get<{ data?: DestinationListResponse }>(
            `${ENDPOINTS.destinationsDraftsList}?page=${page}`
        );
        return (data as { data?: DestinationListResponse })?.data ?? (data as DestinationListResponse);
    }

    async getPublishedById(id: string | number): Promise<AdminDestination> {
        const { data } = await axiosInstance.get<{ data?: AdminDestination }>(ENDPOINTS.destinationsPublishedById(id));
        return (data as { data?: AdminDestination })?.data ?? (data as AdminDestination);
    }

    async getDraftById(id: string | number): Promise<AdminDestination> {
        const { data } = await axiosInstance.get<{ data?: AdminDestination }>(ENDPOINTS.destinationsDraftById(id));
        return (data as { data?: AdminDestination })?.data ?? (data as AdminDestination);
    }
}

export const destinationService = new DestinationService();
