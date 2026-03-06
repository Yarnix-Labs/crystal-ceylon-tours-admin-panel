import axiosInstance from "@/api";
import { ApiService } from "./api";
import { ENDPOINTS } from "@/api/endpoints";
import { handleApiResponse, handleAxiosError, type ApiResponse } from "./errorHandler";

// Standalone Admin Blog Post interface - separate from public BlogPost
export interface AdminBlogPost {
    // Core fields (same as BlogPost but independent)
    id: number;
    slug: string;
    title: string;
    excerpt: string;
    readingTime: string;
    coverImage: string;
    tags: string[];
    views: number;
    content: string;
    publishedAt: string;
    createdAt: string;
    updatedAt: string;
    authorName: string;
    
    // Additional fields used in admin forms
    category?: string;
    
    // Admin-specific fields
    published?: boolean;
    headerTitle?: string;
    headerImage?: string;
    contentBlocks?: { type?: string; content?: string; title?: string; image?: string; description?: string }[];
    relatedBlogs?: number[];
    images?: string[];
    
    // Fallback fields for backward compatibility (API might return these)
    image?: string; // fallback for coverImage
    readTime?: string; // fallback for readingTime
    author?: string; // fallback for authorName
}

export interface CreateBlogPayload {
    title: string;
    content: string;
    // Optional scalars: allow null so they can be cleared from the admin UI
    excerpt?: string | null;
    coverImage?: string | null;
    readingTime?: string | null;
    category?: string | null;
    authorName?: string | null;
    // Lists: use [] to clear
    relatedBlogs?: number[];
    images?: string[];
    tags?: string[];
}

export interface BlogStatusPayload {
    status: "PUBLISHED" | "DRAFT";
}

export interface BlogListResponse {
    items: AdminBlogPost[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

export interface BlogStats {
    total: number;
    published: number;
    drafts: number;
}

export type BlogApiResponse = ApiResponse<AdminBlogPost>;

class BlogService extends ApiService<AdminBlogPost> {
    constructor() {
        super(ENDPOINTS.blogs);
    }

    async createBlog(payload: CreateBlogPayload): Promise<AdminBlogPost> {
        const { data } = await axiosInstance.post<{ data?: AdminBlogPost }>(ENDPOINTS.blogsCreate, payload);
        return (data as { data?: AdminBlogPost })?.data ?? (data as unknown as AdminBlogPost);
    }

    async updateBlog(id: string | number, payload: CreateBlogPayload): Promise<AdminBlogPost> {
        const { data } = await axiosInstance.put<{ data?: AdminBlogPost }>(ENDPOINTS.blogsUpdate(id), payload);
        return (data as { data?: AdminBlogPost })?.data ?? (data as unknown as AdminBlogPost);
    }

    async updateStatus(id: string | number, status: "PUBLISHED" | "DRAFT"): Promise<AdminBlogPost> {
        const { data } = await axiosInstance.put<{ data?: AdminBlogPost }>(
            ENDPOINTS.blogsStatus(id),
            { status } satisfies BlogStatusPayload
        );
        return (data as { data?: AdminBlogPost })?.data ?? (data as unknown as AdminBlogPost);
    }

    async deleteBlog(id: string | number): Promise<void> {
        await axiosInstance.delete(ENDPOINTS.blogsDelete(id));
    }

    async getPublishedList(page: number = 1): Promise<BlogListResponse> {
        const { data } = await axiosInstance.get<{ data?: BlogListResponse }>(
            `${ENDPOINTS.blogsPublishedList}?page=${page}`
        );
        return (data as { data?: BlogListResponse })?.data ?? (data as BlogListResponse);
    }

    async getDraftsList(page: number = 1): Promise<BlogListResponse> {
        const { data } = await axiosInstance.get<{ data?: BlogListResponse }>(
            `${ENDPOINTS.blogsDraftsList}?page=${page}`
        );
        return (data as { data?: BlogListResponse })?.data ?? (data as BlogListResponse);
    }

    async getPublishedById(id: string | number): Promise<AdminBlogPost> {
        const { data } = await axiosInstance.get<{ data?: AdminBlogPost }>(ENDPOINTS.blogsPublishedById(id));
        return (data as { data?: AdminBlogPost })?.data ?? (data as AdminBlogPost);
    }

    async getDraftById(id: string | number): Promise<AdminBlogPost> {
        const { data } = await axiosInstance.get<{ data?: AdminBlogPost }>(ENDPOINTS.blogsDraftById(id));
        return (data as { data?: AdminBlogPost })?.data ?? (data as AdminBlogPost);
    }

    async getStats(): Promise<BlogStats> {
        try {
            const { data } = await axiosInstance.get<ApiResponse<BlogStats>>(ENDPOINTS.blogsStats);
            return handleApiResponse(data, "Failed to fetch blog stats");
        } catch (error) {
            handleAxiosError(error, "Failed to fetch blog stats");
            throw error; // This will never execute, but TypeScript needs it
        }
    }
}

export const blogService = new BlogService();
