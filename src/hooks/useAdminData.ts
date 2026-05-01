
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tourService } from "@/admin/services/tourService";
import { destinationService } from "@/admin/services/destinationService";
import { blogService } from "@/admin/services/blogService";
import { thingsToDoService } from "@/admin/services/thingsToDoService";
import { galleryService } from "@/admin/services/galleryService";
import { reviewService, type ReviewStatus } from "@/admin/services/reviewService";
import { profileService } from "@/admin/services/profileService";
import { vehicleService } from "@/admin/services/vehicleService";
import { toast } from "sonner";

// --- Tours ---
export const useTours = () => {
    return useQuery({
        queryKey: ["tours"],
        queryFn: () => tourService.getAll(),
    });
};

export const usePublishedTours = (page: number = 1, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["tours", "published", page],
        queryFn: () => tourService.getPublishedList(page),
        enabled,
    });
};

export const useDraftTours = (page: number = 1, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["tours", "drafts", page],
        queryFn: () => tourService.getDraftsList(page),
        enabled,
    });
};

export const useTour = (id: string | undefined) => {
    return useQuery({
        queryKey: ["tours", id],
        queryFn: () => (id ? tourService.getById(id) : null),
        enabled: !!id && id !== "new",
    });
};

export const useTourById = (id: string | undefined, isPublished: boolean = true) => {
    return useQuery({
        queryKey: ["tours", id, isPublished ? "published" : "draft"],
        queryFn: () => {
            if (!id || id === "new") return null;
            return isPublished ? tourService.getPublishedById(id) : tourService.getDraftById(id);
        },
        enabled: !!id && id !== "new",
    });
};

export const useTourMutations = () => {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: (data: any) => tourService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tours"] });
            toast.success("Tour created successfully");
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: any }) => tourService.updateTourPackage(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tours"] });
            toast.success("Tour updated successfully");
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string | number; status: "PUBLISHED" | "DRAFT" }) =>
            tourService.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tours"] });
            toast.success("Tour status updated successfully");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string | number) => tourService.deleteTourPackage(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tours"] });
            toast.success("Tour deleted successfully");
        },
    });

    return { createMutation, updateMutation, updateStatusMutation, deleteMutation };
};

// --- Destinations ---
export const useDestinations = () => {
    return useQuery({
        queryKey: ["destinations"],
        queryFn: () => destinationService.getAll(),
    });
};

export const usePublishedDestinations = (page: number = 1, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["destinations", "published", page],
        queryFn: () => destinationService.getPublishedList(page),
        enabled,
    });
};

export const useDraftDestinations = (page: number = 1, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["destinations", "drafts", page],
        queryFn: () => destinationService.getDraftsList(page),
        enabled,
    });
};

export const useDestination = (id: string | undefined) => {
    return useQuery({
        queryKey: ["destinations", id],
        queryFn: () => (id ? destinationService.getById(id) : null),
        enabled: !!id && id !== "new",
    });
};

export const useDestinationById = (id: string | undefined, isPublished: boolean = true) => {
    return useQuery({
        queryKey: ["destinations", id, isPublished ? "published" : "draft"],
        queryFn: () => {
            if (!id || id === "new") return null;
            return isPublished ? destinationService.getPublishedById(id) : destinationService.getDraftById(id);
        },
        enabled: !!id && id !== "new",
    });
};

export const useDestinationMutations = () => {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: (data: any) => destinationService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["destinations"] });
            toast.success("Destination created successfully");
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => destinationService.updateDestination(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["destinations"] });
            toast.success("Destination updated successfully");
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: "PUBLISHED" | "DRAFT" }) =>
            destinationService.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["destinations"] });
            toast.success("Destination status updated successfully");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => destinationService.deleteDestination(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["destinations"] });
            toast.success("Destination deleted successfully");
        },
    });

    return { createMutation, updateMutation, updateStatusMutation, deleteMutation };
};

// --- Blogs ---
export const useBlogs = () => {
    return useQuery({
        queryKey: ["blogs"],
        queryFn: () => blogService.getAll(),
    });
};

export const usePublishedBlogs = (page: number = 1, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["blogs", "published", page],
        queryFn: () => blogService.getPublishedList(page),
        enabled,
    });
};

export const useDraftBlogs = (page: number = 1, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["blogs", "drafts", page],
        queryFn: () => blogService.getDraftsList(page),
        enabled,
    });
};

export const useBlog = (id: string | undefined) => {
    return useQuery({
        queryKey: ["blogs", id],
        queryFn: () => (id ? blogService.getById(id) : null),
        enabled: !!id && id !== "new",
    });
};

export const useBlogById = (id: string | undefined, isPublished: boolean = true) => {
    return useQuery({
        queryKey: ["blogs", id, isPublished ? "published" : "draft"],
        queryFn: () => {
            if (!id || id === "new") return null;
            return isPublished ? blogService.getPublishedById(id) : blogService.getDraftById(id);
        },
        enabled: !!id && id !== "new",
    });
};

export const useBlogStats = () => {
    return useQuery({
        queryKey: ["blogs", "stats"],
        queryFn: () => blogService.getStats(),
    });
};

export const useBlogMutations = () => {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: (data: any) => {
            if (data?.title && data?.content && typeof data.title === "string" && typeof data.content === "string") {
                return blogService.createBlog(data);
            }
            return blogService.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["blogs"] });
            toast.success("Blog post created successfully");
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: any }) => blogService.updateBlog(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["blogs"] });
            toast.success("Blog post updated successfully");
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string | number; status: "PUBLISHED" | "DRAFT" }) =>
            blogService.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["blogs"] });
            queryClient.invalidateQueries({ queryKey: ["blogs", "stats"] });
            toast.success("Blog post status updated successfully");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string | number) => blogService.deleteBlog(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["blogs"] });
            toast.success("Blog post deleted successfully");
        },
    });

    return { createMutation, updateMutation, updateStatusMutation, deleteMutation };
};

// --- Things To Do ---
export const useThingsToDo = () => {
    return useQuery({
        queryKey: ["thingsToDo"],
        queryFn: () => thingsToDoService.getAll(),
    });
};

export const usePublishedThingsToDo = (page: number = 1, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["thingsToDo", "published", page],
        queryFn: () => thingsToDoService.getPublishedList(page),
        enabled,
    });
};

export const useDraftThingsToDo = (page: number = 1, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["thingsToDo", "drafts", page],
        queryFn: () => thingsToDoService.getDraftsList(page),
        enabled,
    });
};

export const useThingToDo = (id: string | undefined) => {
    return useQuery({
        queryKey: ["thingsToDo", id],
        queryFn: () => (id ? thingsToDoService.getById(id) : null),
        enabled: !!id && id !== "new",
    });
};

export const useThingToDoById = (id: string | undefined, isPublished: boolean = true) => {
    return useQuery({
        queryKey: ["thingsToDo", id, isPublished ? "published" : "draft"],
        queryFn: () => {
            if (!id || id === "new") return null;
            return isPublished ? thingsToDoService.getPublishedById(id) : thingsToDoService.getDraftById(id);
        },
        enabled: !!id && id !== "new",
    });
};

export const useThingsToDoMutations = () => {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: (data: any) => {
            // Check if payload matches ThingsToDoCreatePayload structure (title + content required)
            if (data.title && data.content && typeof data.title === "string" && typeof data.content === "string") {
                return thingsToDoService.createThingToDo(data);
            }
            return thingsToDoService.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["thingsToDo"] });
            toast.success("Activity created successfully");
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => thingsToDoService.updateThingToDo(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["thingsToDo"] });
            toast.success("Activity updated successfully");
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: "PUBLISHED" | "DRAFT" }) =>
            thingsToDoService.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["thingsToDo"] });
            toast.success("Activity status updated successfully");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => thingsToDoService.deleteThingToDo(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["thingsToDo"] });
            toast.success("Activity deleted successfully");
        },
    });

    return { createMutation, updateMutation, updateStatusMutation, deleteMutation };
};

// --- Gallery ---
export const usePublishedGallery = (page: number = 1, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["gallery", "published", page],
        queryFn: () => galleryService.getAll(page),
        enabled,
    });
};

export const useUnpublishedGallery = (page: number = 1, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["gallery", "unpublished", page],
        queryFn: () => galleryService.getInactive(page),
        enabled,
    });
};

export const useGalleryMutations = () => {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: (data: any) => galleryService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["gallery"] });
            toast.success("Gallery item created successfully");
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: any }) => galleryService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["gallery"] });
            toast.success("Gallery item updated successfully");
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, isActive }: { id: string | number; isActive: boolean }) =>
            galleryService.updateStatus(id, { isActive }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["gallery"] });
            toast.success("Gallery item status updated successfully");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string | number) => galleryService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["gallery"] });
            toast.success("Gallery item deleted successfully");
        },
    });

    return { createMutation, updateMutation, updateStatusMutation, deleteMutation };
};

// --- Reviews ---
export const useReviewsAdminList = (page: number = 1, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["reviews", "admin", "list", page],
        queryFn: () => reviewService.getAdminList(page),
        enabled,
    });
};

export const useReviewsFilter = (status: ReviewStatus | null, page: number = 1, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["reviews", "admin", "filter", status, page],
        queryFn: () => (status ? reviewService.getFiltered(status, page) : reviewService.getAdminList(page)),
        enabled: enabled && !!status,
    });
};

export const useReview = (id: string | undefined) => {
    return useQuery({
        queryKey: ["reviews", id],
        queryFn: () => (id ? reviewService.getById(id) : null),
        enabled: !!id && id !== "new",
    });
};

export const useReviewMutations = () => {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: (data: Parameters<typeof reviewService.create>[0]) => reviewService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reviews"] });
            toast.success("Review created successfully");
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: Parameters<typeof reviewService.update>[1] }) =>
            reviewService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reviews"] });
            toast.success("Review updated successfully");
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string | number; status: ReviewStatus }) =>
            reviewService.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reviews"] });
            toast.success("Review status updated successfully");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string | number) => reviewService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reviews"] });
            toast.success("Review deleted successfully");
        },
    });

    return { createMutation, updateMutation, updateStatusMutation, deleteMutation };
};

// --- Profile ---
export const useUserProfile = () => {
    return useQuery({
        queryKey: ["userProfile"],
        queryFn: () => profileService.getMe(),
    });
};

export const useProfileMutations = () => {
    const queryClient = useQueryClient();

    const updateMutation = useMutation({
        mutationFn: (data: any) => profileService.updateProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["userProfile"] });
            toast.success("Profile updated successfully");
        },
    });

    const uploadImageMutation = useMutation({
        mutationFn: (file: File) => profileService.uploadProfileImage(file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["userProfile"] });
            toast.success("Profile image uploaded successfully");
        },
    });

    const changePasswordMutation = useMutation({
        mutationFn: (payload: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
            profileService.changePassword(payload),
        onSuccess: () => {
            toast.success("Password changed successfully");
        },
    });

    return { updateMutation, uploadImageMutation, changePasswordMutation };
};

// --- Vehicles ---
export const useVehicles = () => {
    return useQuery({
        queryKey: ["vehicles"],
        queryFn: () => vehicleService.getAll(),
    });
};

export const useVehicle = (id: string | number | undefined) => {
    return useQuery({
        queryKey: ["vehicles", id],
        queryFn: () => (id ? vehicleService.getById(id) : null),
        enabled: !!id && id !== "new",
    });
};

export const useVehicleMutations = () => {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: (data: any) => vehicleService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vehicles"] });
            toast.success("Vehicle created successfully");
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: any }) => vehicleService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vehicles"] });
            toast.success("Vehicle updated successfully");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string | number) => vehicleService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vehicles"] });
            toast.success("Vehicle deleted successfully");
        },
    });

    return { createMutation, updateMutation, deleteMutation };
};
