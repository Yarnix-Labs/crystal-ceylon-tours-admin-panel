import axiosInstance from "@/api";
import { ENDPOINTS } from "@/api/endpoints";
import { BaseEntity } from "./api";

// Tour Package type definition
interface TourPackage {
    id: string | number;
    title: string;
    slug: string;
    description?: string;
    duration: number;
    price: number;
    image?: string;
    gallery?: string[];
    itinerary?: ApiTourDay[];
    inclusions?: string[];
    exclusions?: string[];
    status?: 'draft' | 'published' | 'archived';
    createdAt?: string;
    updatedAt?: string;
}

interface ApiTourDay {
    dayNumber?: number;
    location?: string;
    topic?: string;
    subTopic?: string;
    image?: string;
    description?: string;
    mealPlan?: string;
    accommodation?: boolean;
    hotelName?: string;
    hotelLocation?: string;
    roomType?: string;
    // Backend uses these names in responses
    destinations?: number[];
    thingsToDo?: number[];
    // Normalized names we use in the form
    destinationIds?: number[];
    thingToDoIds?: number[];
}

export interface AdminTourPackage extends TourPackage, BaseEntity {
    // Additional fields from API for admin form
    totalDays?: number;
    packageDuration?: string;
    tourRefNumber?: string;
    shortDescription?: string;
    description?: string;
    packageType?: string;
    extraDetails?: string;
    tags?: string[];
    days?: ApiTourDay[];
}

export interface CreateTourPackageDayPayload {
    dayNumber: number;
    location?: string;
    topic: string;
    subTopic?: string;
    image?: string;
    description: string;
    mealPlan?: string;
    accommodation?: boolean;
    hotelName?: string;
    hotelLocation?: string;
    roomType?: string;
    status?: string;
    destinationIds?: number[];
    thingToDoIds?: number[];
}

export interface CreateTourPackagePayload {
    name: string;
    heroImage: string;
    // Optional; send null to clear in DB
    shortDescription?: string | null;
    description: string;
    // Optional; send null to clear in DB
    price?: number | null;
    packageType: string;
    minPeople: number;
    totalDays: number;
    packageDuration: string;
    tourRefNumber: string;
    // Optional; send null to clear in DB
    extraDetails?: string | null;
    // List fields: use [] to clear (Prisma list columns cannot be null)
    includes?: string[];
    excludes?: string[];
    tags?: string[];
    days: CreateTourPackageDayPayload[];
    status?: 'PUBLISHED' | 'DRAFT';
}

interface ApiTourPackage {
    id: string;
    name: string;
    heroImage: string;
    shortDescription?: string;
    description?: string;
    price?: number;
    packageType?: string;
    minPeople?: number;
    duration?: number;
    totalDays?: number;
    packageDuration?: string;
    tourRefNumber?: string;
    extraDetails?: string;
    includes?: string[];
    excludes?: string[];
    tags?: string[];
    days?: ApiTourDay[];
    slug?: string;
    published?: boolean;
}

export interface TourPackageStatusPayload {
    status: "PUBLISHED" | "DRAFT";
}

export interface TourPackageListResponse {
    items: ApiTourPackage[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

const toStringArray = (value?: string[] | string) => {
    if (Array.isArray(value)) {
        return value.filter(Boolean);
    }
    if (!value) {
        return [];
    }
    const stripped = value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    return stripped
        .split(/[\n,•]+/)
        .map((item) => item.trim())
        .filter(Boolean);
};

const parseTotalDays = (value?: string | number): number => {
    if (!value) {
        return 1;
    }
    // Try to extract number from string like "7 days" -> 7
    const num = parseInt(String(value), 10);
    return isNaN(num) ? 1 : num;
};

const generateTourRefNumber = (): string => {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `TOUR-${random}`;
};

const normalizeTour = (item: ApiTourPackage): AdminTourPackage => {
    const itinerary = (item.days ?? []).map((day, index) => ({
        day: day.dayNumber ?? index + 1,
        title: day.topic || day.subTopic || `Day ${index + 1}`,
        location: day.location || "",
        description: day.description || "",
        accommodation: day.accommodation ? day.hotelName || "Included" : undefined,
    }));

    // Map backend day fields to the structure our form expects
    const normalizedDays =
        item.days?.map((day) => {
            const d = day as ApiTourDay;
            // Handle destinations and thingsToDo - they can be arrays of objects or arrays of IDs
            const extractIds = (arr: any[]): number[] => {
                if (!Array.isArray(arr)) return [];
                return arr.map(item => {
                    if (typeof item === 'number' || typeof item === 'string') {
                        return parseInt(String(item), 10);
                    }
                    if (item && typeof item === 'object' && 'id' in item) {
                        return parseInt(String(item.id), 10);
                    }
                    return NaN;
                }).filter(id => !isNaN(id));
            };

            return {
                ...d,
                dayNumber: d.dayNumber,
                location: d.location,
                topic: d.topic,
                subTopic: d.subTopic,
                image: d.image,
                description: d.description,
                mealPlan: d.mealPlan,
                accommodation: d.accommodation,
                hotelName: d.hotelName,
                hotelLocation: d.hotelLocation,
                roomType: d.roomType,
                // Handle both possible field names from different API responses
                // Also handle nested objects with id, title, slug structure
                destinationIds: extractIds(d.destinationIds ?? d.destinations ?? []),
                thingToDoIds: extractIds(d.thingToDoIds ?? d.thingsToDo ?? []),
            };
        }) ?? [];

    return {
        id: item.id,
        title: item.name,
        slug: item.slug || String(item.id),
        description: item.description || item.shortDescription || "",
        duration: item.duration ?? 1,
        price: item.price ?? 0,
        image: item.heroImage,
        gallery: [],
        itinerary: item.days || [],
        inclusions: item.includes || [],
        exclusions: item.excludes || [],
        status: item.published ? "published" : "draft",
        createdAt: undefined,
        updatedAt: undefined,
        // Additional admin fields
        totalDays: item.totalDays,
        packageDuration: item.packageDuration,
        tourRefNumber: item.tourRefNumber,
        shortDescription: item.shortDescription,
        packageType: item.packageType,
        extraDetails: item.extraDetails,
        tags: item.tags,
        days: item.days,
    };
};

const buildPayload = (data: Partial<AdminTourPackage>): CreateTourPackagePayload => {
    // Use existing values if available, otherwise compute from other fields
    const totalDays = data.totalDays ?? parseTotalDays(data.duration);
    const packageDuration = data.packageDuration || (data.duration ? String(data.duration).trim() : `${totalDays} Days`);
    // Preserve existing tourRefNumber for updates, generate new one only for creates
    const tourRefNumber = data.tourRefNumber || generateTourRefNumber();
    
    return {
        name: data.name || "",
        heroImage: data.heroImage || "",
        shortDescription: data.packageDescription || data.name,
        description: data.packageDescription || "",
        price: (data.price as any)?.amount || (data.price as number) || 0,
        packageType: data.type || data.category || "",
        minPeople: data.minPeople || 1,
        totalDays,
        packageDuration,
        tourRefNumber,
        extraDetails: "",
        includes: toStringArray(data.includes),
        excludes: toStringArray(data.excludes),
        tags: [],
        days: (data.days || []).map((day, index) => ({
            dayNumber: day.dayNumber ?? index + 1,
            location: day.location || "",
            topic: day.topic || "",
            subTopic: day.subTopic || "",
            image: day.image,
            description: day.description || "",
            mealPlan: day.mealPlan || "",
            accommodation: day.accommodation || false,
            hotelName: day.hotelName || "",
            hotelLocation: day.hotelLocation || "",
            roomType: day.roomType || "",
            destinationIds: day.destinationIds || [],
            thingToDoIds: day.thingToDoIds || [],
        })),
    };
};

export const tourService = {
    async getAll(): Promise<AdminTourPackage[]> {
        const { data } = await axiosInstance.get<ApiTourPackage[]>(ENDPOINTS.tours);
        return data.map(normalizeTour);
    },
    async getById(id: string): Promise<AdminTourPackage | undefined> {
        const response = await axiosInstance.get<any>(`${ENDPOINTS.tours}/${id}`);
        // Handle new nested response structure: { success, statusCode, message, data: { ... } }
        const responseData = response.data;
        // Check if response has nested data structure
        if (responseData && responseData.data && typeof responseData.data === 'object') {
            // Handle { data: { data: {...} } } structure
            const item = responseData.data.data || responseData.data;
            return normalizeTour(item);
        }
        // Handle direct response or { data: {...} } structure
        const item = responseData.data || responseData;
        return normalizeTour(item);
    },
    async create(payload: CreateTourPackagePayload | Omit<AdminTourPackage, "id">): Promise<AdminTourPackage> {
        // If payload is already CreateTourPackagePayload, use it directly; otherwise build it
        const apiPayload = 'days' in payload && Array.isArray(payload.days) && payload.days.length > 0 && 'topic' in payload.days[0]
            ? payload as CreateTourPackagePayload
            : buildPayload(payload as Partial<AdminTourPackage>);
        const { data } = await axiosInstance.post<ApiTourPackage>(ENDPOINTS.tours, apiPayload);
        return normalizeTour(data);
    },
    async update(id: string, updates: Partial<AdminTourPackage>): Promise<AdminTourPackage> {
        const { data } = await axiosInstance.patch<ApiTourPackage>(
            `${ENDPOINTS.tours}/${id}`,
            buildPayload(updates)
        );
        return normalizeTour(data);
    },
    async updateTourPackage(id: string | number, payload: CreateTourPackagePayload): Promise<AdminTourPackage> {
        const { data } = await axiosInstance.put<ApiTourPackage>(ENDPOINTS.tourPackagesUpdate(id), payload);
        return normalizeTour(data);
    },
    async updateStatus(id: string | number, status: "PUBLISHED" | "DRAFT"): Promise<AdminTourPackage> {
        const { data } = await axiosInstance.put<ApiTourPackage>(
            ENDPOINTS.tourPackagesStatus(id),
            { status }
        );
        return normalizeTour(data);
    },
    async deleteTourPackage(id: string | number): Promise<void> {
        await axiosInstance.delete(ENDPOINTS.tourPackagesDelete(id));
    },
    async getPublishedList(page: number = 1): Promise<TourPackageListResponse> {
        const response = await axiosInstance.get(
            `${ENDPOINTS.tourPackagesPublishedList}?page=${page}`
        );
        const data = response.data as {
            data?: { data?: ApiTourPackage[]; meta?: any } | ApiTourPackage[];
            meta?: any;
        };
        const defaultMeta = {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
        };
        // Handle API response: { data: { data: [...], meta: {...} } } (double-nested)
        const inner = data?.data;
        if (inner && typeof inner === 'object' && !Array.isArray(inner) && Array.isArray(inner.data)) {
            return {
                items: inner.data as ApiTourPackage[],
                meta: inner.meta || defaultMeta,
            };
        }
        // Handle API response: { data: [...], meta: {...} } (single-nested)
        if (inner && Array.isArray(inner)) {
            return {
                items: inner as ApiTourPackage[],
                meta: data.meta || defaultMeta,
            };
        }
        // Handle direct { items: [...], meta: {...} }
        return (data as TourPackageListResponse) || { items: [], meta: defaultMeta };
    },
    async getDraftsList(page: number = 1): Promise<TourPackageListResponse> {
        const response = await axiosInstance.get(
            `${ENDPOINTS.tourPackagesDraftsList}?page=${page}`
        );
        const data = response.data as {
            data?: { data?: ApiTourPackage[]; meta?: any } | ApiTourPackage[];
            meta?: any;
        };
        const defaultMeta = {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
        };
        // Handle API response: { data: { data: [...], meta: {...} } } (double-nested)
        const inner = data?.data;
        if (inner && typeof inner === 'object' && !Array.isArray(inner) && Array.isArray(inner.data)) {
            return {
                items: inner.data as ApiTourPackage[],
                meta: inner.meta || defaultMeta,
            };
        }
        // Handle API response: { data: [...], meta: {...} } (single-nested)
        if (inner && Array.isArray(inner)) {
            return {
                items: inner as ApiTourPackage[],
                meta: data.meta || defaultMeta,
            };
        }
        // Handle direct { items: [...], meta: {...} }
        return (data as TourPackageListResponse) || { items: [], meta: defaultMeta };
    },
    async getPublishedById(id: string | number): Promise<AdminTourPackage> {
        const response = await axiosInstance.get(ENDPOINTS.tourPackagesPublishedById(id));
        const responseData = response.data;
        // Handle new nested response structure: { success, statusCode, message, data: { ... } }
        if (responseData && responseData.data && typeof responseData.data === 'object') {
            const item = responseData.data.data || responseData.data;
            return normalizeTour(item);
        }
        // Handle old structure
        const outer = responseData as { data?: ApiTourPackage } | ApiTourPackage;
        const item = (outer as { data?: ApiTourPackage }).data ?? (outer as ApiTourPackage);
        return normalizeTour(item);
    },
    async getDraftById(id: string | number): Promise<AdminTourPackage> {
        const response = await axiosInstance.get(ENDPOINTS.tourPackagesDraftById(id));
        const responseData = response.data;
        // Handle new nested response structure: { success, statusCode, message, data: { ... } }
        if (responseData && responseData.data && typeof responseData.data === 'object') {
            const item = responseData.data.data || responseData.data;
            return normalizeTour(item);
        }
        // Handle old structure
        const outer = responseData as { data?: ApiTourPackage } | ApiTourPackage;
        const item = (outer as { data?: ApiTourPackage }).data ?? (outer as ApiTourPackage);
        return normalizeTour(item);
    },
    async delete(id: string): Promise<void> {
        await axiosInstance.delete(`${ENDPOINTS.tours}/${id}`);
    },
    
    async getDestinationsList(page: number = 1) {
        const { data } = await axiosInstance.get(ENDPOINTS.destinations);
        return data;
    },
    
    async getThingsToDoList(page: number = 1) {
        const { data } = await axiosInstance.get(ENDPOINTS.thingsToDo);
        return data;
    },
};
