import axiosInstance from "@/api";
import { ENDPOINTS } from "@/api/endpoints";

export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface AdminReview {
    id: string;
    name: string;
    email: string;
    rating: number;
    title: string;
    comment: string;
    status?: ReviewStatus;
    createdAt?: string;
    /** Optional API fields */
    customerName?: string;
    customerEmail?: string;
    tourName?: string;
}

export interface CreateReviewPayload {
    name: string;
    email: string;
    rating: number;
    title: string;
    comment: string;
}

export interface ReviewListResponse {
    items: AdminReview[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

class ReviewService {
    async getAdminList(page: number = 1): Promise<ReviewListResponse> {
        const { data } = await axiosInstance.get<{ data?: ReviewListResponse }>(
            `${ENDPOINTS.reviewsAdminList}?page=${page}`
        );
        return (data as { data?: ReviewListResponse })?.data ?? (data as ReviewListResponse);
    }

    async getFiltered(status: ReviewStatus, page: number = 1): Promise<ReviewListResponse> {
        const { data } = await axiosInstance.get<{ data?: ReviewListResponse }>(
            `${ENDPOINTS.reviewsAdminFilter}?status=${status}&page=${page}`
        );
        return (data as { data?: ReviewListResponse })?.data ?? (data as ReviewListResponse);
    }

    async getById(id: string | number): Promise<AdminReview> {
        const { data } = await axiosInstance.get<{ data?: AdminReview }>(ENDPOINTS.reviewsById(id));
        const raw = (data as { data?: AdminReview })?.data ?? (data as AdminReview);
        return this.normalizeReview(raw);
    }

    async updateStatus(id: string | number, status: ReviewStatus): Promise<AdminReview> {
        const { data } = await axiosInstance.put<{ data?: AdminReview }>(
            ENDPOINTS.reviewsStatus(id),
            { status }
        );
        const raw = (data as { data?: AdminReview })?.data ?? (data as AdminReview);
        return this.normalizeReview(raw);
    }

    async update(id: string | number, payload: CreateReviewPayload): Promise<AdminReview> {
        const { data } = await axiosInstance.put<{ data?: AdminReview }>(
            ENDPOINTS.reviewsByIdUpdate(id),
            payload
        );
        const raw = (data as { data?: AdminReview })?.data ?? (data as AdminReview);
        return this.normalizeReview(raw);
    }

    async delete(id: string | number): Promise<void> {
        await axiosInstance.delete(ENDPOINTS.reviewsByIdUpdate(id));
    }

    async create(payload: CreateReviewPayload): Promise<AdminReview> {
        const { data } = await axiosInstance.post<{ data?: AdminReview }>(ENDPOINTS.reviews, payload);
        const raw = (data as { data?: AdminReview })?.data ?? (data as AdminReview);
        return this.normalizeReview(raw);
    }

    private normalizeReview(r: AdminReview): AdminReview {
        return {
            ...r,
            name: r.name ?? r.customerName ?? "",
            email: r.email ?? r.customerEmail ?? "",
        };
    }
}

export const reviewService = new ReviewService();
