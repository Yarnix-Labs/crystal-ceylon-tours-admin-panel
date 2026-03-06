import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
    Upload, Image as ImageIcon, X, Download, Trash2, 
    Search, Plus, FileImage, 
    CheckCircle2, HardDrive, ChevronLeft, ChevronRight,
    ChevronsLeft, ChevronsRight
} from "lucide-react";
import { Loader, ButtonLoader } from "@/admin/components/ui/Loader";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { uploadAsset } from "@/api/services/storage";
import { usePublishedGallery, useUnpublishedGallery, useGalleryMutations } from "@/hooks/useAdminData";
import { galleryService } from "@/admin/services/galleryService";
import { Skeleton } from "@/components/ui/skeleton";

interface MediaItem {
    id: string | number;
    src: string;
    title: string;
    description: string;
    type: 'image' | 'video';
    published: boolean;
}

export default function MediaLibrary() {
    const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
    const [viewMode, setViewMode] = useState<"published" | "unpublished">("published");
    const [currentPage, setCurrentPage] = useState(1);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [uploadTitle, setUploadTitle] = useState("");
    const [uploadDescription, setUploadDescription] = useState("");
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadPreview, setUploadPreview] = useState<string>("");
    const [isUploading, setIsUploading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");

    const { data: publishedData, isLoading: loadingPublished, isFetching: fetchingPublished } = usePublishedGallery(currentPage);
    const { data: unpublishedData, isLoading: loadingUnpublished, isFetching: fetchingUnpublished } = useUnpublishedGallery(currentPage);
    
    const isLoading = viewMode === "published" ? loadingPublished : loadingUnpublished;
    const isFetching = viewMode === "published" ? fetchingPublished : fetchingUnpublished;
    const currentData = viewMode === "published" ? publishedData : unpublishedData;
    const galleryItems = currentData?.data?.items ?? [];
    const paginationMeta = currentData?.data?.meta;

    const { createMutation, updateMutation, updateStatusMutation, deleteMutation } = useGalleryMutations();

    // Convert API items to MediaItem format
    const images = useMemo(() => {
        return galleryItems.map((item) => ({
            id: item.id,
            src: item.imageUrl,
            title: item.title,
            description: item.description || "",
            type: "image" as const,
            published: item.isActive ?? (viewMode === "published"),
        }));
    }, [galleryItems, viewMode]);

    // Filter Logic
    const filteredItems = useMemo(() => {
        return images.filter(item => 
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [images, searchQuery]);

    // Stats Logic - use API data
    const stats = useMemo(() => {
        return {
            totalImages: (publishedData?.data?.meta?.total ?? 0) + (unpublishedData?.data?.meta?.total ?? 0),
            publishedCount: publishedData?.data?.meta?.total ?? 0,
            unpublishedCount: unpublishedData?.data?.meta?.total ?? 0,
        };
    }, [publishedData, unpublishedData]);

    // Reset to page 1 when switching tabs or filters
    useEffect(() => {
        setCurrentPage(1);
    }, [viewMode, searchQuery]);

    const handleTogglePublish = async (id: string | number, current: boolean) => {
        updateStatusMutation.mutate(
            { id, isActive: !current },
            {
                onSuccess: () => {
                    if (selectedItem?.id === id) {
                        setSelectedItem(prev => prev ? { ...prev, published: !current } : null);
                    }
                    toast.success(current ? "Media unpublished" : "Media published");
                },
                onError: () => {
                    toast.error("Failed to update status.");
                },
            }
        );
    };

    const handleDelete = async (id: string | number) => {
        deleteMutation.mutate(id, {
            onSuccess: () => {
                setSelectedItem(null);
                toast.success("Media deleted successfully");
            },
            onError: () => {
                toast.error("Failed to delete media.");
            },
        });
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            if (uploadPreview) {
                URL.revokeObjectURL(uploadPreview);
            }
            setUploadFile(file);
            setUploadPreview(URL.createObjectURL(file));
            toast.success("Image selected. Ready to upload.");
        }
        setIsUploadOpen(true);
    };

    const resetUploadState = () => {
        setUploadTitle("");
        setUploadDescription("");
        setUploadFile(null);
        if (uploadPreview) {
            URL.revokeObjectURL(uploadPreview);
        }
        setUploadPreview("");
        setIsUploading(false);
    };

    const handleUpload = async () => {
        if (!uploadFile) {
            toast.error("Please select an image to upload.");
            return;
        }
        const maxSizeBytes = 10 * 1024 * 1024;
        if (uploadFile.size > maxSizeBytes) {
            toast.error("File size must be less than 10MB.");
            return;
        }
        if (!uploadTitle.trim()) {
            toast.error("Title is required.");
            return;
        }
        if (!uploadDescription.trim()) {
            toast.error("Description is required.");
            return;
        }

        setIsUploading(true);
        try {
            const imageUrl = await uploadAsset(uploadFile);
            createMutation.mutate({
                title: uploadTitle.trim(),
                description: uploadDescription.trim(),
                imageUrl,
            }, {
                onSuccess: () => {
                    setIsUploadOpen(false);
                    resetUploadState();
                },
                onError: () => {
                    toast.error("Gallery upload failed. Please try again.");
                },
            });
        } catch (error) {
            console.error("Gallery upload failed:", error);
            toast.error("Gallery upload failed. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDownload = async (url: string, filename: string) => {
        if (!url) return;
        try {
            const response = await fetch(url, { mode: "cors" });
            if (!response.ok) {
                throw new Error(`Download failed with status ${response.status}`);
            }
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = objectUrl;
            link.download = filename || "image";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(objectUrl);
        } catch (error) {
            console.error("Download failed:", error);
            toast.error("Failed to download image.");
        }
    };

    useEffect(() => {
        if (selectedItem) {
            setEditTitle(selectedItem.title);
            setEditDescription(selectedItem.description || "");
            setIsUpdating(false);
        } else {
            setEditTitle("");
            setEditDescription("");
            setIsUpdating(false);
        }
    }, [selectedItem]);

    const handleUpdateDetails = async () => {
        if (!selectedItem) return;
        if (!editTitle.trim()) {
            toast.error("Title is required.");
            return;
        }
        setIsUpdating(true);
        try {
            updateMutation.mutate({
                id: selectedItem.id,
                data: {
                    title: editTitle.trim(),
                    description: editDescription.trim(),
                    imageUrl: selectedItem.src,
                },
            }, {
                onSuccess: () => {
                    setSelectedItem(prev =>
                        prev ? { ...prev, title: editTitle.trim(), description: editDescription.trim() } : prev
                    );
                    toast.success("Details updated.");
                },
                onError: () => {
                    toast.error("Failed to update details.");
                },
            });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="min-h-screen bg-muted/30 relative">
            {/* Delete Loader Overlay */}
            {deleteMutation.isPending && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-background rounded-lg p-8 flex flex-col items-center gap-4 shadow-xl">
                        <Loader size="xl" />
                        <p className="text-lg font-semibold text-foreground">Deleting media...</p>
                        <p className="text-sm text-muted-foreground">Please wait</p>
                    </div>
                </div>
            )}
            <div className="p-6 space-y-6 animate-in fade-in duration-500">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Media Library</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage your images and video assets
                        </p>
                    </div>
                    <Button 
                        onClick={() => setIsUploadOpen(true)}
                        className="gap-2 bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all duration-200"
                    >
                        <Upload className="w-4 h-4" />
                        Upload Media
                    </Button>
                </div>

                {/* Tabs for Published/Unpublished */}
                <div className="flex gap-2 border-b border-border">
                    <button
                        onClick={() => setViewMode("published")}
                        className={`px-4 py-2 font-medium transition-colors ${
                            viewMode === "published"
                                ? "border-b-2 border-primary text-primary"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Published ({stats.publishedCount})
                    </button>
                    <button
                        onClick={() => setViewMode("unpublished")}
                        className={`px-4 py-2 font-medium transition-colors ${
                            viewMode === "unpublished"
                                ? "border-b-2 border-primary text-primary"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Unpublished ({stats.unpublishedCount})
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="border border-border bg-white dark:bg-card shadow-sm">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-blue-500/10">
                                <FileImage className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{stats.totalImages}</p>
                                <p className="text-xs text-muted-foreground">Total Images</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border border-border bg-white dark:bg-card shadow-sm">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-green-500/10">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{stats.publishedCount}</p>
                                <p className="text-xs text-muted-foreground">Published Images</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border border-border bg-white dark:bg-card shadow-sm">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-amber-500/10">
                                <HardDrive className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{stats.unpublishedCount}</p>
                                <p className="text-xs text-muted-foreground">Unpublished Images</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="bg-white dark:bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col min-h-[600px]">
                    <div className="border-b border-border p-4 flex flex-col lg:flex-row gap-4 justify-between items-center bg-muted/20">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search media..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-10 bg-background border-border"
                            />
                        </div>
                    </div>

                    <div className="flex-1 p-6 bg-muted/10 relative">
                        {/* Skeleton loading for first load */}
                        {isLoading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                                    <div key={i} className="aspect-square rounded-xl">
                                        <Skeleton className="h-full w-full rounded-xl" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <>
                                {/* Inline loader for subsequent data fetching */}
                                {isFetching && (
                                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader size="lg" />
                                            <p className="text-sm text-muted-foreground">Updating...</p>
                                        </div>
                                    </div>
                                )}
                                {filteredItems.length > 0 ? (
                                    <>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6 mb-6">
                                            {/* Drag Drop Area */}
                                            <div
                                                onClick={() => setIsUploadOpen(true)}
                                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                                onDragLeave={() => setIsDragging(false)}
                                                onDrop={handleDrop}
                                                className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center aspect-square cursor-pointer transition-all duration-200 group ${
                                                    isDragging
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-border bg-white dark:bg-card hover:border-primary/50 hover:bg-muted/50'
                                                }`}
                                            >
                                                <div className="p-3 rounded-full bg-muted group-hover:bg-primary/10 transition-colors mb-3">
                                                    <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                                </div>
                                                <p className="text-sm font-medium text-foreground">Upload New</p>
                                                <p className="text-xs text-muted-foreground mt-1">or drag & drop</p>
                                            </div>

                                            {filteredItems.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="group relative bg-white dark:bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
                                                    onClick={async () => {
                                                        setSelectedItem(item);
                                                        setIsDetailLoading(true);
                                                        try {
                                                            const res = item.published
                                                                ? await galleryService.getById(item.id)
                                                                : await galleryService.getInactiveById(item.id);
                                                            const full = res.data;
                                                            const updated: MediaItem = {
                                                                id: full.id,
                                                                src: full.imageUrl,
                                                                title: full.title,
                                                                description: full.description || "",
                                                                type: "image",
                                                                published: full.isActive ?? item.published,
                                                            };
                                                            setSelectedItem(updated);
                                                            setEditTitle(updated.title);
                                                            setEditDescription(updated.description);
                                                        } catch (error) {
                                                            console.error("Failed to load image details:", error);
                                                            toast.error("Failed to load image details.");
                                                        } finally {
                                                            setIsDetailLoading(false);
                                                        }
                                                    }}
                                                >
                                                    <div className="aspect-square relative overflow-hidden bg-muted">
                                                        <img
                                                            src={item.src}
                                                            alt={item.title}
                                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                            loading="lazy"
                                                        />
                                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent px-3 pb-3 pt-6 flex flex-col gap-1">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span
                                                                    className={`text-xs font-medium px-2 py-0.5 rounded-full border border-white/10 ${
                                                                        item.published
                                                                            ? "bg-emerald-500/80 text-white"
                                                                            : "bg-red-500/80 text-white"
                                                                    }`}
                                                                >
                                                                    {item.published ? "Published" : "Unpublished"}
                                                                </span>
                                                                {updateStatusMutation.isPending && updateStatusMutation.variables?.id === item.id && (
                                                                    <Loader size="sm" />
                                                                )}
                                                            </div>
                                                            <p className="text-sm font-semibold text-white truncate" title={item.title}>
                                                                {item.title}
                                                            </p>
                                                            {!!item.description && (
                                                                <p className="text-[11px] text-white/80 line-clamp-2">
                                                                    {item.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Pagination */}
                                        {paginationMeta && (
                                            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-border bg-muted/10">
                                                <div className="text-sm text-muted-foreground">
                                                    Showing {Math.min((currentPage - 1) * paginationMeta.limit + 1, paginationMeta.total)} to {Math.min(currentPage * paginationMeta.limit, paginationMeta.total)} of {paginationMeta.total} records
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    {/* Page Info */}
                                                    <div className="text-sm font-medium">
                                                        Page {currentPage} of {paginationMeta.totalPages || 1}
                                                    </div>

                                                    {/* Navigation Buttons */}
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => setCurrentPage(1)}
                                                            disabled={!paginationMeta.hasPreviousPage}
                                                        >
                                                            <ChevronsLeft className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                            disabled={!paginationMeta.hasPreviousPage}
                                                        >
                                                            <ChevronLeft className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => setCurrentPage(p => p + 1)}
                                                            disabled={!paginationMeta.hasNextPage}
                                                        >
                                                            <ChevronRight className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => setCurrentPage(paginationMeta.totalPages)}
                                                            disabled={!paginationMeta.hasNextPage}
                                                        >
                                                            <ChevronsRight className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                                    <Search className="w-8 h-8 opacity-50" />
                                </div>
                                <p className="text-lg font-medium text-foreground">No media found</p>
                                <p className="text-sm">{searchQuery ? "Try adjusting your search terms" : "Get started by uploading your first image"}</p>
                            </div>
                        )}
                    </>
                )}
                    </div>
                </div>

                {/* Media Details Dialog */}
                <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
                    <DialogContent className="max-w-5xl max-h-[95vh] p-0 overflow-hidden gap-0 bg-background border-border [&>button.absolute]:hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-5 h-full max-h-[95vh]">
                            {/* Preview Area - clean, no overlapping buttons */}
                            <div className="lg:col-span-3 bg-black/95 flex items-center justify-center relative min-h-[300px] lg:min-h-[600px]">
                                {selectedItem && (
                                    <img
                                        src={selectedItem.src}
                                        alt={selectedItem.title}
                                        className="max-w-full max-h-full object-contain"
                                    />
                                )}
                            </div>

                            {/* Info Sidebar */}
                            <div className="lg:col-span-2 border-l border-border bg-card flex flex-col max-h-[95vh]">
                                {/* Sticky Header with title + close */}
                                <div className="flex items-start justify-between gap-3 px-6 py-4 border-b border-border bg-card shrink-0">
                                    <div className="flex flex-col min-w-0">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Media Details</p>
                                        <h2 className="text-base font-semibold text-foreground truncate mt-0.5" title={selectedItem?.title}>
                                            {selectedItem?.title || '—'}
                                        </h2>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground rounded-full mt-0.5"
                                        onClick={() => setSelectedItem(null)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Scrollable Content */}
                                <div className="flex-1 overflow-y-auto p-6">
                                    {isDetailLoading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader />
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {(() => {
                                                const TITLE_MAX = 50;
                                                const DESC_MAX = 200;
                                                return (
                                                    <>
                                            {/* Title Section */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title</Label>
                                                    <span className={`text-xs tabular-nums ${
                                                        editTitle.length >= TITLE_MAX ? 'text-destructive font-semibold' :
                                                        editTitle.length >= TITLE_MAX * 0.8 ? 'text-amber-500' : 'text-muted-foreground'
                                                    }`}>{editTitle.length}/{TITLE_MAX}</span>
                                                </div>
                                                <Input
                                                    value={editTitle}
                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                    placeholder="Enter media title"
                                                    className="h-12 text-sm"
                                                    maxLength={TITLE_MAX}
                                                />
                                            </div>

                                            {/* Visibility Section */}
                                            <div className="space-y-3 pt-4 border-t border-border">
                                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Visibility</Label>
                                                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                                                selectedItem?.published
                                                                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                                                    : "bg-red-500/10 text-red-600 border border-red-500/20"
                                                            }`}
                                                        >
                                                            {selectedItem?.published ? 'Published' : 'Unpublished'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Switch 
                                                            checked={selectedItem?.published}
                                                            disabled={updateStatusMutation.isPending && updateStatusMutation.variables?.id === selectedItem?.id}
                                                            onCheckedChange={(checked) => selectedItem && handleTogglePublish(selectedItem.id, !checked)}
                                                        />
                                                        {updateStatusMutation.isPending && updateStatusMutation.variables?.id === selectedItem?.id && (
                                                            <Loader size="sm" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Description Section */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</Label>
                                                    <span className={`text-xs tabular-nums ${
                                                        editDescription.length >= DESC_MAX ? 'text-destructive font-semibold' :
                                                        editDescription.length >= DESC_MAX * 0.8 ? 'text-amber-500' : 'text-muted-foreground'
                                                    }`}>{editDescription.length}/{DESC_MAX}</span>
                                                </div>
                                                <Textarea
                                                    value={editDescription}
                                                    onChange={(e) => setEditDescription(e.target.value)}
                                                    placeholder="Add a description for this media..."
                                                    className="min-h-[100px] resize-none"
                                                    maxLength={DESC_MAX}
                                                />
                                            </div>
                                                    </>
                                                );
                                            })()}

                                            {/* Direct Link Section */}
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Direct Link</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        readOnly
                                                        value={selectedItem?.src ?? ""}
                                                        className="h-10 bg-muted/50 font-mono text-xs flex-1 min-w-0"
                                                    />
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-10 w-10 shrink-0"
                                                        onClick={() => {
                                                            if (selectedItem?.src) {
                                                                navigator.clipboard.writeText(selectedItem.src).then(
                                                                    () => toast.success("Link copied!"),
                                                                    () => toast.error("Failed to copy link.")
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <span className="sr-only">Copy</span>
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons - Fixed at bottom */}
                                <div className="p-6 border-t border-border bg-card space-y-3 shrink-0">
                                    <Button
                                        className="w-full gap-2"
                                        variant="outline"
                                        onClick={() => selectedItem?.src && handleDownload(selectedItem.src, selectedItem.title)}
                                    >
                                        <Download className="h-4 w-4" /> Download
                                    </Button>
                                    <Button
                                        className="w-full gap-2"
                                        onClick={handleUpdateDetails}
                                        disabled={isUpdating || !selectedItem || updateMutation.isPending}
                                    >
                                        <ButtonLoader loading={isUpdating || updateMutation.isPending}>
                                            Save Changes
                                        </ButtonLoader>
                                    </Button>
                                    <Button 
                                        className="w-full gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30" 
                                        variant="outline"
                                        onClick={() => selectedItem && handleDelete(selectedItem.id)}
                                        disabled={deleteMutation.isPending}
                                    >
                                        <ButtonLoader loading={deleteMutation.isPending}>
                                            <Trash2 className="h-4 w-4" /> Delete Asset
                                        </ButtonLoader>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Upload Dialog */}
                <Dialog open={isUploadOpen} onOpenChange={(open) => {
                    setIsUploadOpen(open);
                    if (!open) resetUploadState();
                }}>
                    <DialogContent className="sm:max-w-xl">
                        <DialogHeader>
                            <DialogTitle>Upload Media</DialogTitle>
                            <DialogDescription>
                                Drag and drop files here or click to browse. Max size 10MB per file.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            {!uploadPreview ? (
                                <div 
                                    onClick={() => document.getElementById('file-upload')?.click()}
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setIsDragging(false);
                                        const file = e.dataTransfer.files?.[0];
                                        if (file && file.type.startsWith('image/')) {
                                            setUploadFile(file);
                                            setUploadPreview(URL.createObjectURL(file));
                                            toast.success("Image selected. Ready to upload.");
                                        }
                                    }}
                                    className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group ${
                                        isDragging 
                                            ? 'border-primary bg-primary/5' 
                                            : 'border-muted-foreground/25 hover:bg-muted/20'
                                    }`}
                                >
                                    <input 
                                        id="file-upload"
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                if (uploadPreview) {
                                                    URL.revokeObjectURL(uploadPreview);
                                                }
                                                setUploadFile(file);
                                                setUploadPreview(URL.createObjectURL(file));
                                                toast.success("Image selected. Ready to upload.");
                                            }
                                        }}
                                    />
                                    <div className="p-4 rounded-full bg-primary/10 mb-4 group-hover:scale-110 transition-transform duration-200">
                                        <Upload className="w-8 h-8 text-primary" />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-1">Click to upload</h3>
                                    <p className="text-sm text-muted-foreground mb-4">or drag and drop image files</p>
                                    <Button size="sm" variant="secondary" onClick={(e) => {
                                        e.stopPropagation();
                                        document.getElementById('file-upload')?.click();
                                    }}>Browse Files</Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="relative rounded-lg border border-border overflow-hidden bg-muted/20">
                                        <img
                                            src={uploadPreview}
                                            alt="Selected preview"
                                            className="w-full h-64 object-cover"
                                        />
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2 h-8 w-8 rounded-full"
                                            onClick={() => {
                                                if (uploadPreview) {
                                                    URL.revokeObjectURL(uploadPreview);
                                                }
                                                setUploadFile(null);
                                                setUploadPreview("");
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {uploadFile && (
                                        <p className="text-xs text-muted-foreground">
                                            Selected file: {uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)
                                        </p>
                                    )}
                                </div>
                            )}
                            <div className="grid gap-4">
                                {(() => {
                                    const TITLE_MAX = 50;
                                    const DESC_MAX = 200;
                                    return (
                                        <>
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <Label>Title <span className="text-destructive">*</span></Label>
                                        <span className={`text-xs tabular-nums ${
                                            uploadTitle.length >= TITLE_MAX ? 'text-destructive font-semibold' :
                                            uploadTitle.length >= TITLE_MAX * 0.8 ? 'text-amber-500' : 'text-muted-foreground'
                                        }`}>{uploadTitle.length}/{TITLE_MAX}</span>
                                    </div>
                                    <Input
                                        placeholder="Enter media title"
                                        value={uploadTitle}
                                        onChange={(e) => setUploadTitle(e.target.value)}
                                        maxLength={TITLE_MAX}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <Label>Description <span className="text-destructive">*</span></Label>
                                        <span className={`text-xs tabular-nums ${
                                            uploadDescription.length >= DESC_MAX ? 'text-destructive font-semibold' :
                                            uploadDescription.length >= DESC_MAX * 0.8 ? 'text-amber-500' : 'text-muted-foreground'
                                        }`}>{uploadDescription.length}/{DESC_MAX}</span>
                                    </div>
                                    <Textarea
                                        placeholder="Enter description"
                                        value={uploadDescription}
                                        onChange={(e) => setUploadDescription(e.target.value)}
                                        className="resize-none min-h-[80px]"
                                        maxLength={DESC_MAX}
                                    />
                                </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
                            <Button onClick={handleUpload} disabled={isUploading || createMutation.isPending}>
                                <ButtonLoader loading={isUploading || createMutation.isPending}>
                                    Upload
                                </ButtonLoader>
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
